import { SCHEMA_VERSION } from "../constants.js";
import { SeededRandom } from "./random/seeded-random.js";
import { WeightedResolver } from "./resolver/weighted-resolver.js";
import { normalizeRequest } from "./pipeline/normalize-request.js";
import { validateNpcModel } from "./validation/npc-validator.js";
import { deepClone } from "./utils.js";
import { buildStatistics } from "./builders/statistics-builder.js";
import { buildSkills } from "./builders/skill-builder.js";
import { buildAbilities } from "./builders/ability-builder.js";
import { buildInventory, buildAncestryAttacks } from "./builders/inventory-builder.js";
import { buildIdentity, resolveGender } from "./builders/identity-builder.js";
import { generateNameData } from "./names/name-generator.js";
import { buildAppearance } from "./builders/appearance-builder.js";
import { buildPersonality } from "./builders/personality-builder.js";

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
    let professionSpecialization = null;
    if (normalized.professionSpecialization?.mode === "fixed" && normalized.professionSpecialization.id) {
      professionSpecialization = this.registry.get("professionSpecializations", normalized.professionSpecialization.id);
    } else {
      const candidates = this.registry.children("professionSpecializations", profession?.id);
      professionSpecialization = candidates.length ? resolver.resolve(candidates) : null;
    }
    let classSpecialization = null;
    if (normalized.classSpecialization?.mode === "fixed" && normalized.classSpecialization.id) {
      classSpecialization = this.registry.get("classSpecializations", normalized.classSpecialization.id);
    } else {
      const candidates = this.registry.children("classSpecializations", classProfile?.id);
      classSpecialization = candidates.length ? resolver.resolve(candidates) : null;
    }
    const role = resolveDefinition(this.registry, resolver, "roles", normalized.role);
    const resolvedGender = resolveGender(normalized.identity, random);
    let nameData = { name: normalized.identity.name ?? "Unnamed NPC", nameParts: normalized.identity.name ? { manual: normalized.identity.name } : null, pack: null };
    if (!normalized.identity.name && normalized.identity.generateName) {
      nameData = generateNameData({ registry: this.registry, resolver, ancestry, random, gender: resolvedGender, request: normalized.identity });
    }
    const statistics = buildStatistics({ level, ancestry, classProfile, profession, professionSpecialization, role });
    const skills = buildSkills({ level, classProfile, profession, professionSpecialization, role });
    const loadout = buildInventory({ level, profession, specialization: professionSpecialization, classProfile, registry: this.registry, enabled: normalized.inventory.enabled });
    const abilities = buildAbilities({ level, classProfile, specialization: classSpecialization, registry: this.registry });
    const ancestryAttacks = buildAncestryAttacks({ level, ancestry, classProfile });
    const identity = buildIdentity({ normalizedIdentity: normalized.identity, ancestry, random, name: nameData.name, nameParts: nameData.nameParts, resolvedGender });
    identity.appearance = buildAppearance({
      request: normalized.appearance,
      ancestry,
      profession,
      professionSpecialization,
      classProfile,
      age: identity.age,
      random,
      resolver,
      registry: this.registry
    });

    const personality = buildPersonality({
      request: normalized.personality,
      ancestry,
      profession,
      professionSpecialization,
      classProfile,
      role,
      age: identity.age,
      resolver,
      registry: this.registry
    });

    const npc = {
      schemaVersion: SCHEMA_VERSION,
      generation: {
        seed,
        sources: [ancestry?.sourceModule, classProfile?.sourceModule, profession?.sourceModule, role?.sourceModule].filter(Boolean),
        benchmark: "PF2e GM Core creature-building guidance"
      },
      identity,
      build: {
        level,
        classProfile,
        classSpecialization,
        profession,
        professionSpecialization,
        professionCategory: profession?.parentId ? this.registry.get("professionCategories", profession.parentId) : null,
        role
      },
      personality,
      statistics,
      skills,
      abilities,
      spellcasting: [],
      inventory: loadout.inventory,
      attacks: [...loadout.attacks, ...ancestryAttacks],
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
