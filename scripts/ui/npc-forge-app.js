import { MODULE_ID } from "../constants.js";
import { CustomNamesManager } from "./custom-names-manager.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
const HandlebarsApplication = HandlebarsApplicationMixin(ApplicationV2);

export class NpcForgeApp extends HandlebarsApplication {
  static DEFAULT_OPTIONS = {
    id: `${MODULE_ID}-application`,
    classes: [MODULE_ID, "npc-forge-application"],
    tag: "section",
    window: { title: "NPCFORGE.App.Title", icon: "fa-solid fa-user-gear", resizable: true },
    position: { width: 1040, height: 760 }
  };

  static PARTS = { main: { template: `modules/${MODULE_ID}/templates/npc-forge-app.hbs` } };

  constructor({ api, targetFolderId = null, ...options } = {}) {
    super(options);
    this.api = api;
    this.targetFolderId = targetFolderId;
    this.editorSession = null;
    this.customManager = null;
    this.activeTab = "generate";
    this.unsubscribeCustomNames = null;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    const host = this.element.querySelector("[data-npc-forge-editor-host]");
    if (!host) return;
    if (!this.editorSession) {
      this.editorSession = this.api.ui.createEditor({
        mode: "standalone",
        actionBar: "default",
        capabilities: { createActor: true, reroll: true, editInventory: true },
        createActorOptions: { folder: this.targetFolderId, renderSheet: true },
        callbacks: {
          onActorCreated: ({ actor }) => this._onActorCreated(actor),
          onError: ({ action, error }) => this._onEditorError(action, error)
        }
      });
    }
    this.editorSession.mount(host);
    await this.editorSession.whenRendered();
    this.customManager?.destroy();
    if (game.user.isGM) {
      this.customManager = new CustomNamesManager({ api: this.api });
      this.customManager.mount(this.element.querySelector("[data-npc-forge-custom-host]"));
    } else {
      this.customManager = null;
      this.element.querySelector('[data-npc-forge-tab="custom"]')?.remove();
    }
    this.element.querySelectorAll("[data-npc-forge-tab]").forEach((tab) => tab.addEventListener("click", () => this._switchTab(tab.dataset.npcForgeTab)));
    this._switchTab(this.activeTab);
    this.unsubscribeCustomNames?.();
    this.unsubscribeCustomNames = this.api.customNames?.subscribe?.(() => {
      const request = this.editorSession?.getRequest();
      if (request) {
        const culture = request.identity?.nameCulture;
        const pack = request.identity?.namePack;
        if (culture && !this.api.registry.get("nameCultures", culture)) request.identity.nameCulture = null;
        if (pack && !this.api.registry.get("namePacks", pack)) request.identity.namePack = null;
        this.editorSession.setRequest(request, { render: true });
      }
      void this.customManager?.render();
    });
  }

  _switchTab(value) {
    this.activeTab = value === "custom" ? "custom" : "generate";
    for (const panel of this.element.querySelectorAll("[data-npc-forge-panel]")) panel.hidden = panel.dataset.npcForgePanel !== this.activeTab;
    for (const tab of this.element.querySelectorAll("[data-npc-forge-tab]")) {
      const selected = tab.dataset.npcForgeTab === this.activeTab;
      tab.classList.toggle("active", selected);
      tab.setAttribute("aria-selected", String(selected));
    }
  }

  _onActorCreated(actor) {
    ui.notifications.info(game.i18n.format("NPCFORGE.Notifications.ActorCreated", { name: actor.name }));
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

  _onEditorError(action, error) {
    console.error(`PF2E NPC Forge | ${action} failed`, error);
    const generationActions = new Set(["generate", "commit"]);
    const key = generationActions.has(action)
      ? "NPCFORGE.Notifications.GenerationFailed"
      : "NPCFORGE.Notifications.ActorCreationFailed";
    ui.notifications.error(game.i18n.localize(key));
  }

  async close(options = {}) {
    this.unsubscribeCustomNames?.();
    this.unsubscribeCustomNames = null;
    this.customManager?.destroy();
    this.customManager = null;
    this.editorSession?.destroy();
    this.editorSession = null;
    return super.close(options);
  }
}
