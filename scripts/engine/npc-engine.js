import { SCHEMA_VERSION } from "../constants.js";
import { SeededRandom } from "./random/seeded-random.js";
import { WeightedResolver } from "./resolver/weighted-resolver.js";
import { normalizeRequest } from "./pipeline/normalize-request.js";
import { validateNpcModel } from "./validation/npc-validator.js";
import { deepClone } from "./utils.js";

function resolveLevel(level, random) {
  if (level.mode === "range") {
    const min = Number.isInteger(level.min) ? level.min : 0;
    const max = Number.isInteger(level.max) ? level.max : Math.max(min, 5);
    return random.int(min, max);
  }
  return Number.isInteger(level.value) ? level.value : 1;
}

function resolveDefinition(registry, resolver, type, requestPart) {
  if (requestPart?.mode === "fixed") return registry.get(type, requestPart.id);
  if (requestPart?.mode === "category" && type === "professions") {
    return resolver.resolve(registry.children("professions", requestPart.id));
  }
  return resolver.resolve(registry.list(type));
}

function generateName(registry, resolver, ancestry, random) {
  const packs = registry.list("namePacks").filter((pack) => !pack.ancestryIds?.length || pack.ancestryIds.includes(ancestry?.id));
  const pack = resolver.resolve(packs);
  if (!pack) return "Unnamed NPC";
  const given = random.pick(pack.given) ?? "Unnamed";
  const family = random.pick(pack.family);
  return family ? `${given} ${family}` : given;
}

function baseStats(level) {
  const l = Number(level) || 0;
  return {
    attributes: { str: 3, dex: 1, con: 2, int: 0, wis: 1, cha: 0 },
    perception: 6 + l,
    ac: 16 + l,
    hp: Math.max(10, 20 + l * 15),
    saves: { fortitude: 7 + l, reflex: 5 + l, will: 5 + l },
    speed: 25
  };
}

function generateSkills(level, classProfile, profession) {
  const entries = new Map();
  for (const skill of classProfile?.preferredSkills ?? []) entries.set(skill, 6 + level);
  for (const [skill, bias] of Object.entries(profession?.skillBias ?? {})) {
    const bonus = bias === "high" ? 7 + level : bias === "medium" ? 5 + level : 3 + level;
    entries.set(skill, Math.max(entries.get(skill) ?? -999, bonus));
  }
  return [...entries].map(([slug, modifier]) => ({ slug, modifier }));
}

function generateBaselineLoadout(level, profession) {
  const isGuard = profession?.id === "core.guard";
  const weapon = isGuard
    ? { id: "primary-weapon", name: "Spear", type: "weapon", source: "baseline", damage: { dice: 1, die: "d6", type: "piercing" }, traits: ["thrown-20"] }
    : { id: "primary-weapon", name: "Dagger", type: "weapon", source: "baseline", damage: { dice: 1, die: "d4", type: "piercing" }, traits: ["agile", "finesse"] };
  const attack = {
    id: "primary-attack",
    sourceWeaponId: weapon.id,
    label: weapon.name,
    modifier: 7 + level,
    damage: { formula: `${weapon.damage.dice}${weapon.damage.die}+${Math.max(1, 2 + Math.floor(level / 3))}`, type: weapon.damage.type },
    traits: [...weapon.traits]
  };
  return { inventory: [weapon], attacks: [attack] };
}

export class NpcEngine {
  constructor({ registry, randomFactory = (seed) => new SeededRandom(seed) } = {}) {
    this.registry = registry;
    this.randomFactory = randomFactory;
  }

  normalize(request) {
    return normalizeRequest(request);
  }

  generate(request = {}) {
    const normalized = this.normalize(request);
    const seed = normalized.seed ?? `npc-${Date.now()}-${Math.random()}`;
    const random = this.randomFactory(seed);
    const resolver = new WeightedResolver(random);
    const level = resolveLevel(normalized.level, random);
    const ancestry = resolveDefinition(this.registry, resolver, "ancestries", normalized.ancestry);
    const classProfile = resolveDefinition(this.registry, resolver, "classProfiles", normalized.classProfile);
    const profession = resolveDefinition(this.registry, resolver, "professions", normalized.profession);
    const role = resolveDefinition(this.registry, resolver, "roles", normalized.role);
    const name = normalized.identity.name || (normalized.identity.generateName ? generateName(this.registry, resolver, ancestry, random) : "Unnamed NPC");
    const loadout = normalized.inventory.enabled ? generateBaselineLoadout(level, profession) : { inventory: [], attacks: [] };

    const npc = {
      schemaVersion: SCHEMA_VERSION,
      generation: { seed, sources: [ancestry?.sourceModule, classProfile?.sourceModule, profession?.sourceModule].filter(Boolean) },
      identity: { name, ancestry, appearance: normalized.appearance.enabled ? { generated: false, traits: [] } : null },
      build: { level, classProfile, profession, professionCategory: profession?.parentId ? this.registry.get("professionCategories", profession.parentId) : null, role },
      personality: normalized.personality.enabled ? { generated: false, traits: [] } : null,
      statistics: baseStats(level),
      skills: generateSkills(level, classProfile, profession),
      abilities: [],
      spellcasting: [],
      inventory: loadout.inventory,
      attacks: loadout.attacks,
      relationships: [],
      biography: {},
      diagnostics: { warnings: [], fallbacks: [] }
    };

    const validation = validateNpcModel(npc);
    npc.diagnostics.warnings.push(...validation.warnings);
    if (!validation.valid) {
      const error = new Error(`Generated NPC is invalid: ${validation.errors.join("; ")}`);
      error.validation = validation;
      throw error;
    }
    return deepClone(npc);
  }

  validate(npc) {
    return validateNpcModel(npc);
  }
}
