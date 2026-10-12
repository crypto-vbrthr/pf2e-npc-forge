import { API_VERSION, MODULE_ID } from "./constants.js";
import { ContentRegistry } from "./engine/content/content-registry.js";
import { registerCoreContent } from "./engine/content/core-content.js";
import { NpcEngine } from "./engine/npc-engine.js";
import { Pf2eDocumentAdapter } from "./adapters/pf2e-document-adapter.js";
import { createExternalIntegrations } from "./integrations/integration-service.js";
import { NpcForgeApi } from "./api/public-api.js";
import { NpcForgeApp } from "./ui/npc-forge-app.js";
import { CustomNameLibrary, CUSTOM_NAMES_SETTING, emptyCustomNameLibrary } from "./custom-names/custom-name-library.js";

let api = null;
let customNames = null;

function findTargetFolder(app) {
  return app?.folder?.id ?? app?.currentFolder?.id ?? null;
}

function installDirectoryButton(app, html) {
  if (!game.user.isGM) return;
  const root = html instanceof HTMLElement ? html : html?.[0];
  if (!root || root.querySelector(".pf2e-npc-forge-directory-button")) return;

  const createButton = root.querySelector('button[data-action="createEntry"], button[data-action="createDocument"], .create-entry');
  const button = document.createElement("button");
  button.type = "button";
  button.className = "pf2e-npc-forge-directory-button icon fa-solid fa-user-gear";
  button.dataset.tooltip = "NPCFORGE.Controls.Open";
  button.setAttribute("aria-label", game.i18n.localize("NPCFORGE.Controls.Open"));
  button.addEventListener("click", () => api.ui.open({ targetFolderId: findTargetFolder(app) }));

  if (createButton?.parentElement) createButton.insertAdjacentElement("afterend", button);
  else root.querySelector(".directory-header")?.append(button);
}

Hooks.once("init", () => {
  console.log(`PF2E NPC Forge | Initializing ${API_VERSION}`);
  const registry = new ContentRegistry();
  registerCoreContent(registry);
  game.settings.register(MODULE_ID, CUSTOM_NAMES_SETTING, {
    name: "NPCFORGE.CustomNames.Title",
    scope: "world", config: false, type: Object,
    default: emptyCustomNameLibrary(),
    onChange: (value) => {
      try { customNames?.apply(value); }
      catch (error) { console.error("PF2E NPC Forge | Could not load custom names", error); }
    }
  });
  customNames = new CustomNameLibrary({
    registry,
    getSetting: () => game.settings.get(MODULE_ID, CUSTOM_NAMES_SETTING),
    setSetting: (value) => game.settings.set(MODULE_ID, CUSTOM_NAMES_SETTING, value)
  });
  const integrations = createExternalIntegrations();
  const engine = new NpcEngine({ registry });
  const documents = new Pf2eDocumentAdapter({ integrations });
  const openApplication = ({ targetFolderId = null } = {}) => {
    const app = new NpcForgeApp({ api, targetFolderId });
    app.render(true);
    return app;
  };
  api = new NpcForgeApi({ engine, registry, documents, integrations, openApplication, customNames });
  const module = game.modules.get(MODULE_ID);
  if (module) module.api = api;
  Hooks.callAll("pf2eNpcForgeReady", api);
});

Hooks.on("renderActorDirectory", installDirectoryButton);

Hooks.once("ready", () => {
  try { customNames?.load(); }
  catch (error) { console.error("PF2E NPC Forge | Failed to load world name library", error); }
});
