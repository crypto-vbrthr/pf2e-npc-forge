import { ATTRIBUTE_MODIFIERS, PERCEPTION, AC, SAVES, HP, ruleValue, midpoint } from "../rules/gm-core-tables.js";

const TIERS = ["terrible", "low", "average", "high", "extreme"];
const tierRank = (tier) => TIERS.indexOf(tier);
const strongerTier = (a = "average", b = "average") => tierRank(a) >= tierRank(b) ? a : b;

function mergeAttributeTiers(classProfile, profession) {
  const base = { str: "average", dex: "average", con: "average", int: "average", wis: "average", cha: "average" };
  for (const [ability, tier] of Object.entries(classProfile?.attributeTiers ?? {})) base[ability] = tier;
  for (const [ability, tier] of Object.entries(profession?.attributeBias ?? {})) base[ability] = strongerTier(base[ability], tier);
  return base;
}

function getTier(profileValue, fallback = "average") {
  return typeof profileValue === "string" ? profileValue : fallback;
}

function applyNumericAdjustment(value, adjustment = 0) {
  return Number(value) + (Number(adjustment) || 0);
}

export function buildStatistics({ level, ancestry, classProfile, profession, role }) {
  const attributeTiers = mergeAttributeTiers(classProfile, profession);
  const attributes = Object.fromEntries(Object.entries(attributeTiers).map(([ability, tier]) => [ability, ruleValue(ATTRIBUTE_MODIFIERS, level, tier)]));

  for (const [ability, adjustment] of Object.entries(ancestry?.attributeAdjustments ?? {})) {
    attributes[ability] = applyNumericAdjustment(attributes[ability] ?? 0, adjustment);
  }

  const prefs = classProfile?.statistics ?? {};
  const roleAdjustments = role?.statAdjustments ?? {};
  const perceptionTier = getTier(prefs.perception);
  const acTier = getTier(prefs.ac);
  const hpTier = getTier(prefs.hp);
  const saveTiers = {
    fortitude: getTier(prefs.saves?.fortitude),
    reflex: getTier(prefs.saves?.reflex),
    will: getTier(prefs.saves?.will)
  };

  const hpRange = HP[level]?.[hpTier] ?? HP[level]?.average;
  const statistics = {
    benchmarkSource: "PF2e GM Core creature-building tables",
    tiers: {
      attributes: attributeTiers,
      perception: perceptionTier,
      ac: acTier,
      hp: hpTier,
      saves: saveTiers
    },
    attributes,
    perception: applyNumericAdjustment(ruleValue(PERCEPTION, level, perceptionTier), roleAdjustments.perception),
    ac: applyNumericAdjustment(ruleValue(AC, level, acTier), roleAdjustments.ac),
    hp: Math.max(1, applyNumericAdjustment(midpoint(hpRange), roleAdjustments.hp)),
    saves: {
      fortitude: applyNumericAdjustment(ruleValue(SAVES, level, saveTiers.fortitude), roleAdjustments.fortitude),
      reflex: applyNumericAdjustment(ruleValue(SAVES, level, saveTiers.reflex), roleAdjustments.reflex),
      will: applyNumericAdjustment(ruleValue(SAVES, level, saveTiers.will), roleAdjustments.will)
    },
    speed: Number(ancestry?.speed ?? 25)
  };

  return statistics;
}
