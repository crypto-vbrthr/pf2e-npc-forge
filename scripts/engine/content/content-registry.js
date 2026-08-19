import { deepClone } from "../utils.js";

const TYPES = Object.freeze([
  "ancestries",
  "classProfiles",
  "classSpecializations",
  "abilityDefinitions",
  "professionCategories",
  "professions",
  "professionSpecializations",
  "roles",
  "namePacks",
  "personalityPacks",
  "appearancePacks",
  "equipmentProfiles",
  "spellcastingProfiles",
  "spellThemes",
  "quickPresets"
]);

export class ContentRegistry {
  constructor() {
    this.maps = Object.fromEntries(TYPES.map((type) => [type, new Map()]));
  }

  register(type, moduleId, definition) {
    if (!TYPES.includes(type)) throw new Error(`Unknown NPC Forge content type: ${type}`);
    if (!moduleId || typeof moduleId !== "string") throw new Error("moduleId is required");
    if (!definition?.id || typeof definition.id !== "string") throw new Error(`${type} definition requires an id`);
    const map = this.maps[type];
    if (map.has(definition.id)) throw new Error(`Duplicate ${type} id: ${definition.id}`);
    const stored = { ...deepClone(definition), sourceModule: moduleId };
    map.set(stored.id, stored);
    return deepClone(stored);
  }

  unregisterModule(moduleId) {
    for (const map of Object.values(this.maps)) {
      for (const [id, entry] of map.entries()) if (entry.sourceModule === moduleId) map.delete(id);
    }
  }

  get(type, id) {
    return deepClone(this.maps[type]?.get(id) ?? null);
  }

  list(type) {
    return [...(this.maps[type]?.values() ?? [])].map(deepClone);
  }

  children(type, parentId) {
    return this.list(type).filter((entry) => entry.parentId === parentId);
  }

  validateHierarchy(type, { parentType = type } = {}) {
    const entries = this.list(type);
    const parentEntries = parentType === type ? entries : this.list(parentType);
    const ids = new Set(parentEntries.map((entry) => entry.id));
    const errors = [];
    for (const entry of entries) {
      if (entry.parentId && !ids.has(entry.parentId)) errors.push(`Missing parent ${entry.parentId} for ${entry.id}`);
      const seen = new Set([entry.id]);
      let current = entry;
      while (current?.parentId) {
        if (seen.has(current.parentId)) {
          errors.push(`Circular hierarchy at ${entry.id}`);
          break;
        }
        seen.add(current.parentId);
        current = parentType === type ? entries.find((candidate) => candidate.id === current.parentId) : null;
        if (!current) break;
      }
    }
    return { valid: errors.length === 0, errors };
  }
}
