import { MODULE_ID } from "../constants.js";
import { presentNpc } from "./npc-presentation.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
const HandlebarsApplication = HandlebarsApplicationMixin(ApplicationV2);

function definitionOptions(values, selectedId) {
  return values.map((entry) => ({
    value: entry.id,
    labelKey: entry.labelKey,
    label: entry.label ?? entry.id,
    selected: entry.id === selectedId
  }));
}

export class NpcForgeApp extends HandlebarsApplication {
  static DEFAULT_OPTIONS = {
    id: `${MODULE_ID}-application`,
    classes: [MODULE_ID, "npc-forge-application"],
    tag: "section",
    window: { title: "NPCFORGE.App.Title", icon: "fa-solid fa-user-gear", resizable: true },
    position: { width: 1040, height: 760 },
    actions: {
      generate: NpcForgeApp.#onGenerate,
      createActor: NpcForgeApp.#onCreateActor
    }
  };

  static PARTS = { main: { template: `modules/${MODULE_ID}/templates/npc-forge-app.hbs` } };

  constructor({ api, targetFolderId = null, ...options } = {}) {
    super(options);
    this.api = api;
    this.targetFolderId = targetFolderId;
    this.request = { level: 3, ancestry: "core.human", classProfile: "core.fighter", classSpecialization: null, professionCategory: "core.profession-category.civic", profession: "core.guard", professionSpecialization: null, role: "core.ordinary", identity: { name: null, generateName: true, gender: "random", ageCategory: "random" } };
    this.preview = null;
    this._pendingPreviewScrollTop = null;
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const localize = (key) => game.i18n.localize(key);
    const classSpecializations = this.api.registry.children("classSpecializations", this.request.classProfile);
    const professions = this.request.professionCategory
      ? this.api.registry.children("professions", this.request.professionCategory)
      : this.api.content.list("professions");
    const professionSpecializations = this.request.profession
      ? this.api.registry.children("professionSpecializations", this.request.profession)
      : [];
    return {
      ...context,
      preview: this.preview,
      view: presentNpc(this.preview, localize),
      hasPreview: Boolean(this.preview),
      targetFolderId: this.targetFolderId,
      request: this.request,
      ancestryOptions: definitionOptions(this.api.content.list("ancestries"), this.request.ancestry),
      classOptions: definitionOptions(this.api.content.list("classProfiles"), this.request.classProfile),
      specializationOptions: definitionOptions(classSpecializations, this.request.classSpecialization),
      hasSpecializations: classSpecializations.length > 0,
      professionCategoryOptions: definitionOptions(this.api.content.list("professionCategories"), this.request.professionCategory),
      professionOptions: definitionOptions(professions, this.request.profession),
      professionSpecializationOptions: definitionOptions(professionSpecializations, this.request.professionSpecialization),
      hasProfessionSpecializations: professionSpecializations.length > 0,
      genderOptions: [
        { value: "random", labelKey: "NPCFORGE.Fields.Automatic", selected: (this.request.identity?.gender ?? "random") === "random" },
        { value: "female", labelKey: "NPCFORGE.Identity.GenderFemale", selected: this.request.identity?.gender === "female" },
        { value: "male", labelKey: "NPCFORGE.Identity.GenderMale", selected: this.request.identity?.gender === "male" },
        { value: "nonbinary", labelKey: "NPCFORGE.Identity.GenderNonbinary", selected: this.request.identity?.gender === "nonbinary" }
      ],
      ageOptions: [
        { value: "random", labelKey: "NPCFORGE.Fields.Automatic", selected: (this.request.identity?.ageCategory ?? "random") === "random" },
        { value: "youngAdult", labelKey: "NPCFORGE.Identity.AgeYoungAdult", selected: this.request.identity?.ageCategory === "youngAdult" },
        { value: "adult", labelKey: "NPCFORGE.Identity.AgeAdult", selected: this.request.identity?.ageCategory === "adult" },
        { value: "middleAged", labelKey: "NPCFORGE.Identity.AgeMiddleAged", selected: this.request.identity?.ageCategory === "middleAged" },
        { value: "elder", labelKey: "NPCFORGE.Identity.AgeElder", selected: this.request.identity?.ageCategory === "elder" }
      ]
    };
  }

  _capturePreviewScroll() {
    const preview = this.element?.querySelector?.(".npc-forge-preview");
    this._pendingPreviewScrollTop = preview?.scrollTop ?? 0;
  }

  _restorePreviewScroll() {
    if (this._pendingPreviewScrollTop == null) return;
    const preview = this.element?.querySelector?.(".npc-forge-preview");
    if (preview) preview.scrollTop = this._pendingPreviewScrollTop;
    this._pendingPreviewScrollTop = null;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    this._restorePreviewScroll();
    const form = this.element.querySelector("form[data-npc-forge-request]");
    form?.addEventListener("input", (event) => {
      const data = new FormData(form);
      const nextClass = String(data.get("classProfile") ?? "core.fighter");
      const classChanged = nextClass !== this.request.classProfile;
      const nextCategory = String(data.get("professionCategory") ?? "") || null;
      const categoryChanged = nextCategory !== this.request.professionCategory;
      const nextProfession = categoryChanged ? null : (String(data.get("profession") ?? "") || null);
      const professionChanged = nextProfession !== this.request.profession;
      this.request = {
        ...this.request,
        level: Number(data.get("level") ?? 3),
        ancestry: String(data.get("ancestry") ?? "core.human"),
        classProfile: nextClass,
        classSpecialization: classChanged ? null : (String(data.get("classSpecialization") ?? "") || null),
        professionCategory: nextCategory,
        profession: nextProfession,
        professionSpecialization: (categoryChanged || professionChanged) ? null : (String(data.get("professionSpecialization") ?? "") || null),
        identity: {
          ...(this.request.identity ?? {}),
          name: String(data.get("identityName") ?? "").trim() || null,
          generateName: !String(data.get("identityName") ?? "").trim(),
          gender: String(data.get("identityGender") ?? "random"),
          ageCategory: String(data.get("identityAgeCategory") ?? "random")
        }
      };
      if (classChanged || categoryChanged || professionChanged) {
        this._capturePreviewScroll();
        this.render();
      }
    });
  }

  static async #onGenerate() {
    try {
      this.preview = await this.api.engine.generate(this.request);
      // Keep the resolved specialization visible after an automatic selection.
      this.request.classSpecialization = this.preview.build?.classSpecialization?.id ?? null;
      this._capturePreviewScroll();
      await this.render();
    } catch (error) {
      console.error("PF2E NPC Forge | Generation failed", error);
      ui.notifications.error(game.i18n.localize("NPCFORGE.Notifications.GenerationFailed"));
    }
  }

  static async #onCreateActor() {
    try {
      if (!this.preview) this.preview = await this.api.engine.generate(this.request);
      const actor = await this.api.documents.createActor(this.preview, { folder: this.targetFolderId, renderSheet: true });
      ui.notifications.info(game.i18n.format("NPCFORGE.Notifications.ActorCreated", { name: actor.name }));
    } catch (error) {
      console.error("PF2E NPC Forge | Actor creation failed", error);
      ui.notifications.error(game.i18n.localize("NPCFORGE.Notifications.ActorCreationFailed"));
    }
  }
}
