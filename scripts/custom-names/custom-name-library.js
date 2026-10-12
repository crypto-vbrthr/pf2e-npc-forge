import { MODULE_ID } from "../constants.js";
import { deepClone } from "../engine/utils.js";

export const CUSTOM_NAME_MODULE = `${MODULE_ID}.user`;
export const CUSTOM_NAMES_SETTING = "customNameLibrary";
const BASE_ID = `${CUSTOM_NAME_MODULE}.`;
const MAX_ENTRIES = 200;
const MAX_PARTS = 300;
const MAX_PART_LENGTH = 80;

function ensureId(type, value) {
  if (typeof value !== "string" || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(value)) {
    throw new Error(`Invalid ${type} ID`);
  }
  return value;
}

function safeTitle(value) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > 100) {
    throw new Error("Name culture and pack titles must be between 1 and 100 characters");
  }
  return value.trim();
}

function sanitizeAncestries(value, allowed, { optional = false } = {}) {
  if (!Array.isArray(value)) throw new Error("Ancestries must be an array");
  const ids = [...new Set(value.map(String))];
  if (!ids.length && !optional) throw new Error("Select at least one ancestry");
  for (const id of ids) if (!allowed.has(id)) throw new Error(`Unknown ancestry: ${id}`);
  return ids;
}

export function parseNameParts(value) {
  const raw = Array.isArray(value) ? value : String(value ?? "").split(/[\r\n,;]+/u);
  if (raw.length > MAX_PARTS * 2) throw new Error("Too many name parts");
  const result = [];
  const seen = new Set();
  for (const item of raw) {
    if (typeof item !== "string") throw new Error("Name parts must be strings");
    const part = item.trim().normalize("NFC");
    if (!part) continue;
    if (part.length > MAX_PART_LENGTH || /[<>\u0000-\u001F\u007F]/u.test(part)) throw new Error(`Invalid name part: ${part.slice(0, 30)}`);
    const key = part.toLocaleLowerCase();
    if (!seen.has(key)) { seen.add(key); result.push(part); }
    if (result.length > MAX_PARTS) throw new Error(`Maximum ${MAX_PARTS} entries per list`);
  }
  return result;
}

function normalizeParts(source = {}) {
  return {
    male: parseNameParts(source.male),
    female: parseNameParts(source.female),
    neutral: parseNameParts(source.neutral)
  };
}

function normalizeComposites(value = {}) {
  return {
    male: { prefix: parseNameParts(value.male?.prefix), suffix: parseNameParts(value.male?.suffix) },
    female: { prefix: parseNameParts(value.female?.prefix), suffix: parseNameParts(value.female?.suffix) },
    neutral: { prefix: parseNameParts(value.neutral?.prefix), suffix: parseNameParts(value.neutral?.suffix) },
    family: { prefix: parseNameParts(value.family?.prefix), suffix: parseNameParts(value.family?.suffix) }
  };
}

function pairGenerator(pair) {
  if (!pair.prefix.length && !pair.suffix.length) return null;
  if (!pair.prefix.length || !pair.suffix.length) throw new Error("A name component generator needs both prefixes and suffixes");
  return { type: "components", patterns: [["prefix", "suffix"]], components: { prefix: pair.prefix, suffix: pair.suffix } };
}

function normalizeLibrary(input, allowed) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Invalid name library");
  if (input.version !== 1) throw new Error("Unsupported custom name library version");
  if (!Array.isArray(input.cultures) || !Array.isArray(input.packs)) throw new Error("Malformed custom name library");
  if (input.cultures.length > MAX_ENTRIES || input.packs.length > MAX_ENTRIES) throw new Error("Custom name library exceeds entry limit");
  const cultures = input.cultures.map((entry) => ({
    id: ensureId("culture", entry.id),
    title: safeTitle(entry.title),
    ancestryIds: sanitizeAncestries(entry.ancestryIds, allowed),
    automatic: entry.automatic === true
  }));
  const cultureIds = new Set(cultures.map((entry) => entry.id));
  if (cultureIds.size !== cultures.length) throw new Error("Duplicate custom name culture IDs");

  const packs = input.packs.map((entry) => {
    const id = ensureId("pack", entry.id);
    const title = safeTitle(entry.title);
    const ancestryIds = sanitizeAncestries(entry.ancestryIds, allowed);
    const cultureId = entry.cultureId == null || entry.cultureId === "" ? null : ensureId("culture", entry.cultureId);
    if (cultureId && !cultureIds.has(cultureId)) throw new Error(`Unknown custom name culture ${cultureId}`);
    if (cultureId) {
      const culture = cultures.find((item) => item.id === cultureId);
      if (ancestryIds.some((id) => !culture.ancestryIds.includes(id))) throw new Error(`Pack ancestries must be included in culture ${culture.title}`);
    }
    const given = normalizeParts(entry.given);
    const composites = normalizeComposites(entry.composites);
    const family = parseNameParts(entry.family);
    const epithets = parseNameParts(entry.epithets);
    const hasNames = Object.values(given).some((list) => list.length)
      || Object.values(composites).slice(0, 3).some((pair) => pair.prefix.length && pair.suffix.length);
    if (!hasNames) throw new Error(`Pack ${title} needs given names or complete given-name components`);
    // Validate all component pairs before writing to settings.
    for (const pair of Object.values(composites)) pairGenerator(pair);
    return { id, title, cultureId, ancestryIds, given, composites, family, epithets };
  });
  if (new Set(packs.map((entry) => entry.id)).size !== packs.length) throw new Error("Duplicate custom name pack IDs");
  return { version: 1, cultures, packs };
}

export function emptyCustomNameLibrary() { return { version: 1, cultures: [], packs: [] }; }

export function toRegisteredDefinitions(data) {
  const cultures = data.cultures.map((entry) => ({
    id: `${BASE_ID}culture.${entry.id}`,
    label: entry.title,
    ancestryIds: entry.ancestryIds,
    automaticAncestryIds: entry.automatic ? entry.ancestryIds : [],
    weight: 10
  }));
  const packs = data.packs.map((entry) => {
    const generators = { givenByGender: {} };
    for (const gender of ["male", "female", "neutral"]) {
      const generator = pairGenerator(entry.composites[gender]);
      if (generator) generators.givenByGender[gender] = generator;
    }
    const family = pairGenerator(entry.composites.family);
    if (family) generators.family = family;
    return {
      id: `${BASE_ID}pack.${entry.id}`,
      label: entry.title,
      ancestryIds: entry.ancestryIds,
      cultureIds: entry.cultureId ? [`${BASE_ID}culture.${entry.cultureId}`] : [],
      weight: 10,
      given: entry.given,
      family: entry.family,
      epithets: entry.epithets,
      epithetChance: entry.epithets.length ? 0.15 : 0,
      ...(Object.keys(generators.givenByGender).length || generators.family ? { generators } : {})
    };
  });
  return { cultures, packs };
}

export class CustomNameLibrary {
  constructor({ registry, getSetting, setSetting } = {}) {
    this.registry = registry;
    this.getSetting = getSetting;
    this.setSetting = setSetting;
    this.data = emptyCustomNameLibrary();
    this.listeners = new Set();
    this._lastSerialized = JSON.stringify(this.data);
  }

  ancestryOptions() { return this.registry.list("ancestries"); }
  list() { return deepClone(this.data); }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  apply(input) {
    const allowed = new Set(this.ancestryOptions().map((item) => item.id));
    const data = normalizeLibrary(input, allowed);
    const serialized = JSON.stringify(data);
    if (serialized === this._lastSerialized) return this.list();
    const previous = this.data;
    const registerAll = (value) => {
      this.registry.unregisterModule(CUSTOM_NAME_MODULE);
      const definitions = toRegisteredDefinitions(value);
      for (const entry of definitions.cultures) this.registry.register("nameCultures", CUSTOM_NAME_MODULE, entry);
      for (const entry of definitions.packs) this.registry.register("namePacks", CUSTOM_NAME_MODULE, entry);
    };
    try { registerAll(data); }
    catch (error) { registerAll(previous); throw error; }
    this.data = deepClone(data);
    this._lastSerialized = serialized;
    for (const callback of this.listeners) callback(this.list());
    return this.list();
  }

  load() { return this.apply(this.getSetting() ?? emptyCustomNameLibrary()); }

  async replace(next) {
    if (globalThis.game?.user?.isGM !== true) throw new Error("Only GMs can edit world name libraries");
    const allowed = new Set(this.ancestryOptions().map((item) => item.id));
    const normalized = normalizeLibrary(next, allowed);
    // Avoid persisting data that cannot be registered.
    const defs = toRegisteredDefinitions(normalized);
    const working = new Map();
    for (const def of [...defs.cultures, ...defs.packs]) {
      if (working.has(def.id)) throw new Error(`Duplicate name definition: ${def.id}`);
      working.set(def.id, true);
    }
    await this.setSetting(deepClone(normalized));
    return this.apply(normalized);
  }

  async saveCulture(entry) {
    const data = this.list();
    const index = data.cultures.findIndex((item) => item.id === entry.id);
    if (index >= 0) data.cultures[index] = entry;
    else data.cultures.push(entry);
    return this.replace(data);
  }

  async deleteCulture(id) {
    const data = this.list();
    data.cultures = data.cultures.filter((entry) => entry.id !== id);
    data.packs = data.packs.filter((entry) => entry.cultureId !== id);
    return this.replace(data);
  }

  async savePack(entry) {
    const data = this.list();
    const index = data.packs.findIndex((item) => item.id === entry.id);
    if (index >= 0) data.packs[index] = entry;
    else data.packs.push(entry);
    return this.replace(data);
  }

  async deletePack(id) {
    const data = this.list();
    data.packs = data.packs.filter((entry) => entry.id !== id);
    return this.replace(data);
  }
}
