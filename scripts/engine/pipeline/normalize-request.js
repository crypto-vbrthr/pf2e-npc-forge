import { clamp } from "../utils.js";

export function normalizeRequest(request = {}) {
  const fixed = (value, fallbackId = null) => {
    if (typeof value === "string") return { mode: "fixed", id: value };
    if (value && typeof value === "object") return { ...value };
    return fallbackId ? { mode: "fixed", id: fallbackId } : { mode: "weighted" };
  };
  const rawLevel = request.level;
  const level = typeof rawLevel === "number"
    ? { mode: "fixed", value: clamp(Math.trunc(rawLevel), -1, 24) }
    : { mode: rawLevel?.mode ?? "fixed", value: clamp(Math.trunc(rawLevel?.value ?? 1), -1, 24), min: rawLevel?.min, max: rawLevel?.max };

  const professionCategory = fixed(request.professionCategory, null);
  let profession = fixed(request.profession, null);
  if (profession.mode === "weighted" && professionCategory?.id) profession = { mode: "category", id: professionCategory.id };
  if (!request.profession && !professionCategory?.id) profession = { mode: "fixed", id: "core.guard" };

  return {
    schemaVersion: 1,
    seed: request.seed ?? null,
    level,
    ancestry: fixed(request.ancestry, "core.human"),
    classProfile: fixed(request.classProfile, "core.fighter"),
    classSpecialization: fixed(request.classSpecialization, null),
    professionCategory,
    profession,
    professionSpecialization: fixed(request.professionSpecialization, null),
    role: fixed(request.role, "core.ordinary"),
    identity: {
      generateName: request.identity?.generateName !== false,
      name: request.identity?.name ?? null,
      gender: request.identity?.gender ?? "random",
      ageCategory: request.identity?.ageCategory ?? "random",
      ageYears: Number.isFinite(request.identity?.ageYears) ? Math.max(0, Math.trunc(request.identity.ageYears)) : null,
      nameLocale: request.identity?.nameLocale ?? "en",
      namePack: fixed(request.identity?.namePack, null),
      allowUntranslatedNamePacks: request.identity?.allowUntranslatedNamePacks === true
    },
    appearance: {
      enabled: request.appearance?.enabled !== false,
      intensity: ["low", "medium", "high"].includes(request.appearance?.intensity) ? request.appearance.intensity : "medium",
      allowScars: request.appearance?.allowScars !== false,
      allowAgeFeatures: request.appearance?.allowAgeFeatures !== false,
      allowBodyShape: request.appearance?.allowBodyShape !== false,
      allowPosture: request.appearance?.allowPosture !== false,
      maxTraits: Number.isInteger(request.appearance?.maxTraits) ? Math.max(1, Math.min(6, request.appearance.maxTraits)) : null
    },
    personality: {
      enabled: request.personality?.enabled !== false,
      intensity: ["low", "medium", "high"].includes(request.personality?.intensity) ? request.personality.intensity : "medium",
      allowSecrets: request.personality?.allowSecrets !== false
    },
    background: {
      enabled: request.background?.enabled !== false,
      intensity: ["low", "medium", "high"].includes(request.background?.intensity) ? request.background.intensity : "medium",
      allowPrivateHooks: request.background?.allowPrivateHooks !== false,
      generateRelationships: request.background?.generateRelationships !== false,
      generateSocialContext: request.background?.generateSocialContext !== false,
      relationshipCount: Number.isInteger(request.background?.relationshipCount) ? Math.max(0, Math.min(6, request.background.relationshipCount)) : null
    },
    inventory: {
      enabled: request.inventory?.enabled !== false,
      scaleFundamentalRunes: request.inventory?.scaleFundamentalRunes !== false,
      personalItems: request.inventory?.personalItems === true,
      allowPoisonedWeapons: request.inventory?.allowPoisonedWeapons === true,
      poisonPolicy: ["automatic", "always"].includes(request.inventory?.poisonPolicy) ? request.inventory.poisonPolicy : "automatic",
      poisonCharges: Number.isInteger(request.inventory?.poisonCharges) ? Math.max(1, Math.min(20, request.inventory.poisonCharges)) : null,
      personalItemCategory: typeof request.inventory?.personalItemCategory === "string" && request.inventory.personalItemCategory ? request.inventory.personalItemCategory : null,
      personalItemTargetValue: Number.isFinite(request.inventory?.personalItemTargetValue) ? Math.max(0.1, Number(request.inventory.personalItemTargetValue)) : null
    }
  };
}
