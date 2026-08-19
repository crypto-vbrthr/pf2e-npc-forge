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

  return {
    schemaVersion: 1,
    seed: request.seed ?? null,
    level,
    ancestry: fixed(request.ancestry, "core.human"),
    classProfile: fixed(request.classProfile, "core.fighter"),
    profession: fixed(request.profession, "core.guard"),
    role: fixed(request.role, "core.ordinary"),
    identity: {
      generateName: request.identity?.generateName !== false,
      name: request.identity?.name ?? null
    },
    appearance: { enabled: request.appearance?.enabled !== false },
    personality: { enabled: request.personality?.enabled !== false },
    inventory: {
      enabled: request.inventory?.enabled !== false,
      personalItems: request.inventory?.personalItems === true,
      allowPoisonedWeapons: request.inventory?.allowPoisonedWeapons === true
    }
  };
}
