import { SCHEMA_VERSION } from "../constants.js";
import { SeededRandom } from "./random/seeded-random.js";
import { WeightedResolver } from "./resolver/weighted-resolver.js";
import { normalizeRequest } from "./pipeline/normalize-request.js";
import { validateNpcModel } from "./validation/npc-validator.js";
import { deepClone } from "./utils.js";
import { buildStatistics } from "./builders/statistics-builder.js";
import { buildSkills } from "./builders/skill-builder.js";
import { buildAbilities } from "./builders/ability-builder.js";
import { ruleValue, ATTACK_BONUS } from "./rules/gm-core-tables.js";

function resolveLevel(level, random) {
  if (level.mode === "range") {
    const min = Number.isInteger(level.min) ? Math.max(-1, level.min) : 0;
    const max = Number.isInteger(level.max) ? Math.min(24, level.max) : Math.max(min, 5);
    return random.int(Math.min(min, max), Math.max(min, max));
  }
  return Number.isInteger(level.value) ? Math.max(-1, Math.min(24, level.value)) : 1;
}

function resolveDefinition(registry, resolver, type, requestPart) {
  if (requestPart?.mode === "fixed") return registry.get(type, requestPart.id);
  if (requestPart?.mode === "category" && type === "professions") return resolver.resolve(registry.children("professions", requestPart.id));
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

function generateBaselineLoadout(level, profession, classProfile) {
  const isGuard = profession?.id === "core.guard";
  const classId = classProfile?.id;
  const isDexterityFocused = classProfile?.attributeTiers?.dex === "high" || profession?.attributeBias?.dex === "high";
  const semanticWeapon = classId === "core.monk"
    ? { name: "Fist", labelKey: "NPCFORGE.Weapons.Fist", slug: null, damage: { dice: 1, die: "d6", type: "bludgeoning" }, traits: ["agile", "finesse", "unarmed"] }
    : ["core.barbarian", "core.champion"].includes(classId)
      ? { name: "Longsword", labelKey: "NPCFORGE.Weapons.Longsword", slug: "longsword", damage: { dice: 1, die: "d8", type: "slashing" }, traits: ["versatile-p"] }
      : classId === "core.swashbuckler"
        ? { name: "Rapier", labelKey: "NPCFORGE.Weapons.Rapier", slug: "rapier", damage: { dice: 1, die: "d6", type: "piercing" }, traits: ["deadly-d8", "disarm", "finesse"] }
        : classId === "core.alchemist"
          ? { name: "Dagger", labelKey: "NPCFORGE.Weapons.Dagger", slug: "dagger", damage: { dice: 1, die: "d4", type: "piercing" }, traits: ["agile", "finesse"] }
          : isGuard
            ? { name: "Spear", labelKey: "NPCFORGE.Weapons.Spear", slug: "spear", damage: { dice: 1, die: "d6", type: "piercing" }, traits: ["thrown-20"] }
            : isDexterityFocused
              ? { name: "Dagger", labelKey: "NPCFORGE.Weapons.Dagger", slug: "dagger", damage: { dice: 1, die: "d4", type: "piercing" }, traits: ["agile", "finesse"] }
              : { name: "Club", labelKey: "NPCFORGE.Weapons.Club", slug: "club", damage: { dice: 1, die: "d6", type: "bludgeoning" }, traits: [] };
  const weapon = {
    id: "primary-weapon", name: semanticWeapon.name, labelKey: semanticWeapon.labelKey, type: classId === "core.monk" ? "unarmed" : "weapon",
    source: semanticWeapon.slug ? "compendium" : "generated",
    ...(semanticWeapon.slug ? { compendium: { packId: "pf2e.equipment-srd", slug: semanticWeapon.slug } } : {}),
    damage: semanticWeapon.damage, traits: semanticWeapon.traits
  };
  const attack = {
    id: "primary-attack",
    sourceWeaponId: weapon.id,
    label: weapon.name,
    labelKey: weapon.labelKey,
    modifier: ruleValue(ATTACK_BONUS, level, classProfile?.statistics?.attack ?? "average"),
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

  normalize(request) { return normalizeRequest(request); }

  generate(request = {}) {
    const normalized = this.normalize(request);
    const seed = normalized.seed ?? `npc-${Date.now()}-${Math.random()}`;
    const random = this.randomFactory(seed);
    const resolver = new WeightedResolver(random);
    const level = resolveLevel(normalized.level, random);
    const ancestry = resolveDefinition(this.registry, resolver, "ancestries", normalized.ancestry);
    const classProfile = resolveDefinition(this.registry, resolver, "classProfiles", normalized.classProfile);
    const profession = resolveDefinition(this.registry, resolver, "professions", normalized.profession);
    let classSpecialization = null;
    if (normalized.classSpecialization?.mode === "fixed" && normalized.classSpecialization.id) {
      classSpecialization = this.registry.get("classSpecializations", normalized.classSpecialization.id);
    } else {
      const candidates = this.registry.children("classSpecializations", classProfile?.id);
      classSpecialization = candidates.length ? resolver.resolve(candidates) : null;
    }
    const role = resolveDefinition(this.registry, resolver, "roles", normalized.role);
    const name = normalized.identity.name || (normalized.identity.generateName ? generateName(this.registry, resolver, ancestry, random) : "Unnamed NPC");
    const statistics = buildStatistics({ level, ancestry, classProfile, profession, role });
    const skills = buildSkills({ level, classProfile, profession, role });
    const loadout = normalized.inventory.enabled ? generateBaselineLoadout(level, profession, classProfile) : { inventory: [], attacks: [] };
    const abilities = buildAbilities({ level, classProfile, specialization: classSpecialization, registry: this.registry });

    const npc = {
      schemaVersion: SCHEMA_VERSION,
      generation: {
        seed,
        sources: [ancestry?.sourceModule, classProfile?.sourceModule, profession?.sourceModule, role?.sourceModule].filter(Boolean),
        benchmark: "PF2e GM Core creature-building guidance"
      },
      identity: { name, ancestry, appearance: normalized.appearance.enabled ? { generated: false, traits: [] } : null },
      build: {
        level,
        classProfile,
        classSpecialization,
        profession,
        professionCategory: profession?.parentId ? this.registry.get("professionCategories", profession.parentId) : null,
        role
      },
      personality: normalized.personality.enabled ? { generated: false, traits: [] } : null,
      statistics,
      skills,
      abilities,
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

  validate(npc) { return validateNpcModel(npc); }
}
