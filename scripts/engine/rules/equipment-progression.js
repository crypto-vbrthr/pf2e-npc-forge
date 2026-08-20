/**
 * PF2e Remaster level-scaled fundamental equipment progression.
 *
 * These profiles intentionally model only fundamental runes. Property runes,
 * special materials, named magic items, and consumables remain separate
 * content concerns. NPC melee statistics stay creature-benchmark driven, so
 * rune data is applied to inventory documents only and never modifies the
 * generated NPC Strike formula.
 */

export const WEAPON_FUNDAMENTAL_PROFILES = Object.freeze([
  { id: "mundane", level: 0, potency: 0, striking: 0 },
  { id: "potency-1", level: 2, potency: 1, striking: 0 },
  { id: "potency-1-striking", level: 4, potency: 1, striking: 1 },
  { id: "potency-2-striking", level: 10, potency: 2, striking: 1 },
  { id: "potency-2-greater-striking", level: 12, potency: 2, striking: 2 },
  { id: "potency-3-greater-striking", level: 16, potency: 3, striking: 2 },
  { id: "potency-3-major-striking", level: 19, potency: 3, striking: 3 }
]);

export const ARMOR_FUNDAMENTAL_PROFILES = Object.freeze([
  { id: "mundane", level: 0, potency: 0, resilient: 0 },
  { id: "potency-1", level: 5, potency: 1, resilient: 0 },
  { id: "potency-1-resilient", level: 8, potency: 1, resilient: 1 },
  { id: "potency-2-resilient", level: 11, potency: 2, resilient: 1 },
  { id: "potency-2-greater-resilient", level: 14, potency: 2, resilient: 2 },
  { id: "potency-3-greater-resilient", level: 18, potency: 3, resilient: 2 },
  { id: "potency-3-major-resilient", level: 20, potency: 3, resilient: 3 }
]);

export const SHIELD_REINFORCING_PROFILES = Object.freeze([
  { id: "mundane", level: 0, reinforcing: 0 },
  { id: "minor", level: 4, reinforcing: 1 },
  { id: "lesser", level: 7, reinforcing: 2 },
  { id: "moderate", level: 10, reinforcing: 3 },
  { id: "greater", level: 13, reinforcing: 4 },
  { id: "major", level: 16, reinforcing: 5 },
  { id: "supreme", level: 19, reinforcing: 6 }
]);

function profileAtLevel(profiles, level) {
  const target = Number.isFinite(Number(level)) ? Number(level) : 0;
  let result = profiles[0];
  for (const profile of profiles) {
    if (profile.level <= target) result = profile;
    else break;
  }
  return result;
}

export function fundamentalProfileFor(type, level) {
  if (type === "weapon") return profileAtLevel(WEAPON_FUNDAMENTAL_PROFILES, level);
  if (type === "armor") return profileAtLevel(ARMOR_FUNDAMENTAL_PROFILES, level);
  if (type === "shield") return profileAtLevel(SHIELD_REINFORCING_PROFILES, level);
  return null;
}

export function scaleFundamentalRunes(items = [], { level = 0, enabled = true } = {}) {
  return items.map((item) => {
    if (!enabled || item.type === "unarmed" || !["weapon", "armor", "shield"].includes(item.type)) return item;
    if (item.fundamentalRunes?.locked === true) return item;
    const profile = fundamentalProfileFor(item.type, level);
    if (!profile) return item;
    return {
      ...item,
      fundamentalRunes: {
        profileId: profile.id,
        profileLevel: profile.level,
        ...(item.type === "weapon" ? { potency: profile.potency, striking: profile.striking } : {}),
        ...(item.type === "armor" ? { potency: profile.potency, resilient: profile.resilient } : {}),
        ...(item.type === "shield" ? { reinforcing: profile.reinforcing } : {})
      }
    };
  });
}

export function applyFundamentalRunesToSource(source, item) {
  const runes = item?.fundamentalRunes;
  if (!source || !runes || !["weapon", "armor", "shield"].includes(source.type)) return source;
  source.system ??= {};
  source.system.runes ??= {};
  if (source.type === "weapon") {
    source.system.runes.potency = Number(runes.potency ?? 0);
    source.system.runes.striking = Number(runes.striking ?? 0);
    source.system.runes.property ??= [];
  } else if (source.type === "armor") {
    source.system.runes.potency = Number(runes.potency ?? 0);
    source.system.runes.resilient = Number(runes.resilient ?? 0);
    source.system.runes.property ??= [];
  } else if (source.type === "shield") {
    source.system.runes.reinforcing = Number(runes.reinforcing ?? 0);
  }
  return source;
}
