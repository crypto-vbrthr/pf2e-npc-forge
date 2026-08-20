import { MODULE_ID } from "../constants.js";

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
    this.editorSession?.destroy();
    this.editorSession = null;
    return super.close(options);
  }
}
