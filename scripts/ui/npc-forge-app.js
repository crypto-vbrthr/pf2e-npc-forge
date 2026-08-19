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


function integrationRow(labelKey, status, { details = null } = {}) {
  let stateKey = "NPCFORGE.Integrations.StatusUnavailable";
  let stateClass = "unavailable";
  if (status?.ready) {
    stateKey = "NPCFORGE.Integrations.StatusConnected";
    stateClass = "connected";
  } else if (status?.active) {
    stateKey = "NPCFORGE.Integrations.StatusIncomplete";
    stateClass = "incomplete";
  } else if (status?.installed) {
    stateKey = "NPCFORGE.Integrations.StatusInactive";
    stateClass = "inactive";
  }
  return {
    moduleId: status?.moduleId ?? null,
    label: game.i18n.localize(labelKey),
    statusLabel: game.i18n.localize(stateKey),
    stateClass,
    details
  };
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
    this.request = { level: 3, ancestry: "core.human", classProfile: "core.fighter", classSpecialization: null, professionCategory: "core.profession-category.civic", profession: "core.guard", professionSpecialization: null, role: "core.ordinary", identity: { name: null, generateName: true, gender: "random", ageCategory: "random" }, appearance: { enabled: true, intensity: "medium", allowScars: true, allowAgeFeatures: true, allowBodyShape: true, allowPosture: true }, personality: { enabled: true, intensity: "medium", allowSecrets: true }, inventory: { enabled: true, personalItems: false, allowPoisonedWeapons: false, poisonPolicy: "automatic" } };
    this.preview = null;
    this._pendingUiState = null;
    this._integrationInspectionCache = null;
  }

  async _inspectIntegrations() {
    const level = Number(this.request.level ?? 0);
    const now = Date.now();
    const cached = this._integrationInspectionCache;
    if (cached?.level === level && now - cached.timestamp < 5000) return cached.value;
    const value = await this.api.integrations.inspect({ level });
    this._integrationInspectionCache = { level, timestamp: now, value };
    return value;
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
    const namePacks = this.api.content.listNamePacks({ ancestryId: this.request.ancestry, locale: game.i18n.lang ?? "en" });
    const integrationStatus = await this._inspectIntegrations();
    const afflictionStatus = integrationStatus.afflictionForge;
    let afflictionDetails = null;
    if (afflictionStatus?.ready) {
      if (afflictionStatus.probeError) {
        afflictionDetails = game.i18n.localize("NPCFORGE.Integrations.ProbeFailed");
      } else if (Number.isInteger(afflictionStatus.injuryPoisonsInRange)) {
        afflictionDetails = game.i18n.format("NPCFORGE.Integrations.AfflictionDetails", {
          libraries: afflictionStatus.enabledLibraries ?? "?",
          poisons: afflictionStatus.injuryPoisonsInRange,
          total: afflictionStatus.injuryPoisonsTotal ?? afflictionStatus.injuryPoisonsInRange
        });
      }
    }
    const integrationRows = [
      integrationRow("NPCFORGE.Integrations.AfflictionForgeName", afflictionStatus, { details: afflictionDetails }),
      integrationRow("NPCFORGE.Integrations.ItemForgeName", integrationStatus.itemForge),
      integrationRow("NPCFORGE.Integrations.LootForgeName", integrationStatus.lootForge)
    ];
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
      namePackOptions: definitionOptions(namePacks, this.request.identity?.namePack ?? null),
      genderOptions: [
        { value: "random", labelKey: "NPCFORGE.Fields.Automatic", selected: (this.request.identity?.gender ?? "random") === "random" },
        { value: "female", labelKey: "NPCFORGE.Identity.GenderFemale", selected: this.request.identity?.gender === "female" },
        { value: "male", labelKey: "NPCFORGE.Identity.GenderMale", selected: this.request.identity?.gender === "male" },
        { value: "nonbinary", labelKey: "NPCFORGE.Identity.GenderNonbinary", selected: this.request.identity?.gender === "nonbinary" }
      ],
      appearanceEnabled: this.request.appearance?.enabled !== false,
      appearanceAllowScars: this.request.appearance?.allowScars !== false,
      appearanceAllowAgeFeatures: this.request.appearance?.allowAgeFeatures !== false,
      appearanceAllowBodyShape: this.request.appearance?.allowBodyShape !== false,
      appearanceAllowPosture: this.request.appearance?.allowPosture !== false,
      appearanceIntensityOptions: [
        { value: "low", labelKey: "NPCFORGE.Appearance.IntensityLow", selected: (this.request.appearance?.intensity ?? "medium") === "low" },
        { value: "medium", labelKey: "NPCFORGE.Appearance.IntensityMedium", selected: (this.request.appearance?.intensity ?? "medium") === "medium" },
        { value: "high", labelKey: "NPCFORGE.Appearance.IntensityHigh", selected: (this.request.appearance?.intensity ?? "medium") === "high" }
      ],
      personalityEnabled: this.request.personality?.enabled !== false,
      personalityAllowSecrets: this.request.personality?.allowSecrets !== false,
      inventoryEnabled: this.request.inventory?.enabled !== false,
      personalItemsEnabled: this.request.inventory?.personalItems === true,
      poisonedWeaponsEnabled: this.request.inventory?.allowPoisonedWeapons === true,
      poisonPolicyOptions: [
        { value: "automatic", labelKey: "NPCFORGE.Integrations.PoisonPolicyAutomatic", selected: (this.request.inventory?.poisonPolicy ?? "automatic") === "automatic" },
        { value: "always", labelKey: "NPCFORGE.Integrations.PoisonPolicyAlways", selected: this.request.inventory?.poisonPolicy === "always" }
      ],
      afflictionForgeReady: afflictionStatus?.ready === true,
      itemForgeReady: integrationStatus.itemForge?.ready === true,
      integrationRows,
      personalityIntensityOptions: [
        { value: "low", labelKey: "NPCFORGE.Personality.IntensityLow", selected: (this.request.personality?.intensity ?? "medium") === "low" },
        { value: "medium", labelKey: "NPCFORGE.Personality.IntensityMedium", selected: (this.request.personality?.intensity ?? "medium") === "medium" },
        { value: "high", labelKey: "NPCFORGE.Personality.IntensityHigh", selected: (this.request.personality?.intensity ?? "medium") === "high" }
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

  _captureUiState() {
    const controls = this.element?.querySelector?.(".npc-forge-controls-scroll");
    const preview = this.element?.querySelector?.(".npc-forge-preview-scroll");
    const sections = {};
    for (const section of this.element?.querySelectorAll?.("details[data-section-id]") ?? []) {
      sections[section.dataset.sectionId] = section.open;
    }
    this._pendingUiState = {
      controlsScrollTop: controls?.scrollTop ?? 0,
      previewScrollTop: preview?.scrollTop ?? 0,
      sections
    };
  }

  _restoreUiState() {
    if (!this._pendingUiState) return;
    const state = this._pendingUiState;
    this._pendingUiState = null;

    // Restore disclosure state first. Opening/closing <details> changes the controls
    // pane geometry, so applying scrollTop before this point lets the browser's
    // scroll anchoring move the viewport after generation.
    for (const section of this.element?.querySelectorAll?.("details[data-section-id]") ?? []) {
      if (Object.hasOwn(state.sections, section.dataset.sectionId)) {
        section.open = state.sections[section.dataset.sectionId];
      }
    }

    const restoreScroll = () => {
      const controls = this.element?.querySelector?.(".npc-forge-controls-scroll");
      const preview = this.element?.querySelector?.(".npc-forge-preview-scroll");
      if (controls) controls.scrollTop = state.controlsScrollTop;
      if (preview) preview.scrollTop = state.previewScrollTop;
    };

    // Foundry/ApplicationV2 and the browser can both perform focus/layout work
    // immediately after _onRender. Restore after two animation frames so our
    // saved editor position wins over scroll anchoring/focus scrolling.
    requestAnimationFrame(() => {
      requestAnimationFrame(restoreScroll);
    });
  }

  _capturePreviewScroll() { this._captureUiState(); }
  _restorePreviewScroll() { this._restoreUiState(); }

  async _onRender(context, options) {
    await super._onRender(context, options);
    this._restoreUiState();
    const form = this.element.querySelector("form[data-npc-forge-request]");
    form?.addEventListener("input", (event) => {
      const data = new FormData(form);
      const nextClass = String(data.get("classProfile") ?? "core.fighter");
      const classChanged = nextClass !== this.request.classProfile;
      const nextAncestry = String(data.get("ancestry") ?? "core.human");
      const ancestryChanged = nextAncestry !== this.request.ancestry;
      const nextCategory = String(data.get("professionCategory") ?? "") || null;
      const categoryChanged = nextCategory !== this.request.professionCategory;
      const nextProfession = categoryChanged ? null : (String(data.get("profession") ?? "") || null);
      const professionChanged = nextProfession !== this.request.profession;
      this.request = {
        ...this.request,
        level: Number(data.get("level") ?? 3),
        ancestry: nextAncestry,
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
          ageCategory: String(data.get("identityAgeCategory") ?? "random"),
          namePack: ancestryChanged ? null : (String(data.get("identityNamePack") ?? "") || null),
          nameLocale: game.i18n.lang ?? "en"
        },
        appearance: {
          ...(this.request.appearance ?? {}),
          enabled: data.get("appearanceEnabled") === "on",
          intensity: String(data.get("appearanceIntensity") ?? "medium"),
          allowScars: data.get("appearanceAllowScars") === "on",
          allowAgeFeatures: data.get("appearanceAllowAgeFeatures") === "on",
          allowBodyShape: data.get("appearanceAllowBodyShape") === "on",
          allowPosture: data.get("appearanceAllowPosture") === "on"
        },
        personality: {
          ...(this.request.personality ?? {}),
          enabled: data.get("personalityEnabled") === "on",
          intensity: String(data.get("personalityIntensity") ?? "medium"),
          allowSecrets: data.get("personalityAllowSecrets") === "on"
        },
        inventory: {
          ...(this.request.inventory ?? {}),
          enabled: data.get("inventoryEnabled") === "on",
          personalItems: data.get("personalItems") === "on",
          allowPoisonedWeapons: data.get("allowPoisonedWeapons") === "on",
          poisonPolicy: String(data.get("poisonPolicy") ?? "automatic") === "always" ? "always" : "automatic"
        }
      };
      if (classChanged || categoryChanged || professionChanged || ancestryChanged) {
        this._captureUiState();
        this.render();
      }
    });
  }

  static async #onGenerate() {
    try {
      this.request.identity = { ...(this.request.identity ?? {}), nameLocale: game.i18n.lang ?? "en" };
      this.preview = await this.api.engine.generate(this.request);
      // Keep the resolved specialization visible after an automatic selection.
      this.request.classSpecialization = this.preview.build?.classSpecialization?.id ?? null;
      this._captureUiState();
      await this.render();
    } catch (error) {
      console.error("PF2E NPC Forge | Generation failed", error);
      ui.notifications.error(game.i18n.localize("NPCFORGE.Notifications.GenerationFailed"));
    }
  }

  static async #onCreateActor() {
    try {
      this.request.identity = { ...(this.request.identity ?? {}), nameLocale: game.i18n.lang ?? "en" };
      if (!this.preview) this.preview = await this.api.engine.generate(this.request);
      const actor = await this.api.documents.createActor(this.preview, { folder: this.targetFolderId, renderSheet: true });
      ui.notifications.info(game.i18n.format("NPCFORGE.Notifications.ActorCreated", { name: actor.name }));
      if (this.preview.integrations?.afflictionForge?.requested) {
        const poison = actor.flags?.[MODULE_ID]?.integrations?.afflictionForge;
        if (poison?.applied) {
          ui.notifications.info(game.i18n.format("NPCFORGE.Notifications.PoisonApplied", { poison: poison.label, charges: poison.charges }));
        } else if (poison?.reason) {
          const reasonKey = {
            unavailable: "NPCFORGE.Notifications.PoisonUnavailable",
            "no-eligible-attack": "NPCFORGE.Notifications.PoisonNoEligibleAttack",
            chance: "NPCFORGE.Notifications.PoisonChanceSkipped",
            "no-match": "NPCFORGE.Notifications.PoisonNoMatch"
          }[poison.reason];
          if (reasonKey) ui.notifications.warn(game.i18n.localize(reasonKey));
        }
      }
    } catch (error) {
      console.error("PF2E NPC Forge | Actor creation failed", error);
      ui.notifications.error(game.i18n.localize("NPCFORGE.Notifications.ActorCreationFailed"));
    }
  }
}
