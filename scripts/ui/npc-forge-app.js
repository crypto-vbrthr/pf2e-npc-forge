import { MODULE_ID } from "../constants.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
const HandlebarsApplication = HandlebarsApplicationMixin(ApplicationV2);

export class NpcForgeApp extends HandlebarsApplication {
  static DEFAULT_OPTIONS = {
    id: `${MODULE_ID}-application`,
    classes: [MODULE_ID, "npc-forge-application"],
    tag: "section",
    window: { title: "NPCFORGE.App.Title", icon: "fa-solid fa-user-gear", resizable: true },
    position: { width: 880, height: 650 },
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
    this.request = { level: 3, ancestry: "core.human", classProfile: "core.fighter", profession: "core.guard", role: "core.ordinary" };
    this.preview = null;
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    return { ...context, preview: this.preview, hasPreview: Boolean(this.preview), targetFolderId: this.targetFolderId };
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    const form = this.element.querySelector("form[data-npc-forge-request]");
    form?.addEventListener("input", () => {
      const data = new FormData(form);
      this.request = {
        ...this.request,
        level: Number(data.get("level") ?? 3),
        ancestry: String(data.get("ancestry") ?? "core.human"),
        classProfile: String(data.get("classProfile") ?? "core.fighter"),
        profession: String(data.get("profession") ?? "core.guard")
      };
    });
  }

  static async #onGenerate() {
    try {
      this.preview = await this.api.engine.generate(this.request);
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
