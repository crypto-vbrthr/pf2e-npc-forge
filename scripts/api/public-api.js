import { API_VERSION, CAPABILITIES, SCHEMA_VERSION } from "../constants.js";
import { NpcEditorSession } from "../ui/npc-editor-session.js";
import { availableNamePacks } from "../engine/names/name-generator.js";

export class NpcForgeApi {
  constructor({ engine, registry, documents, integrations, openApplication } = {}) {
    this.version = API_VERSION;
    this.apiVersion = API_VERSION;
    this.schemaVersion = SCHEMA_VERSION;
    this.capabilities = new Set(CAPABILITIES);
    this.engine = engine;
    this.documents = documents;
    this.integrations = Object.freeze({
      afflictions: integrations?.afflictions,
      items: integrations?.items,
      loot: integrations?.loot,
      status: () => ({
        afflictionForge: integrations?.afflictions?.status?.() ?? { available: false, ready: false },
        itemForge: integrations?.items?.status?.() ?? { available: false, ready: false },
        lootForge: integrations?.loot?.status?.() ?? { available: false, ready: false }
      })
    });
    this.openApplication = openApplication;
    this.registry = registry;

    this.content = Object.freeze({
      registerAncestry: (moduleId, definition) => registry.register("ancestries", moduleId, definition),
      registerClassProfile: (moduleId, definition) => registry.register("classProfiles", moduleId, definition),
      registerClassSpecialization: (moduleId, definition) => registry.register("classSpecializations", moduleId, definition),
      registerAbility: (moduleId, definition) => registry.register("abilityDefinitions", moduleId, definition),
      registerProfessionCategory: (moduleId, definition) => registry.register("professionCategories", moduleId, definition),
      registerProfession: (moduleId, definition) => registry.register("professions", moduleId, definition),
      registerProfessionSpecialization: (moduleId, definition) => registry.register("professionSpecializations", moduleId, definition),
      registerRole: (moduleId, definition) => registry.register("roles", moduleId, definition),
      registerNamePack: (moduleId, definition) => registry.register("namePacks", moduleId, definition),
      listNamePacks: (options = {}) => availableNamePacks(registry, options),
      registerPersonalityPack: (moduleId, definition) => registry.register("personalityPacks", moduleId, definition),
      registerAppearancePack: (moduleId, definition) => registry.register("appearancePacks", moduleId, definition),
      registerEquipmentProfile: (moduleId, definition) => registry.register("equipmentProfiles", moduleId, definition),
      registerSpellcastingProfile: (moduleId, definition) => registry.register("spellcastingProfiles", moduleId, definition),
      registerSpellTheme: (moduleId, definition) => registry.register("spellThemes", moduleId, definition),
      registerQuickPreset: (moduleId, definition) => registry.register("quickPresets", moduleId, definition),
      list: (type) => registry.list(type),
      get: (type, id) => registry.get(type, id)
    });

    this.ui = Object.freeze({
      createEditor: (options = {}) => new NpcEditorSession({ engine, adapter: documents, ...options }),
      open: (options = {}) => openApplication(options)
    });
  }
}
