import { SKILLS, ruleValue } from "../rules/gm-core-tables.js";

const STANDARD_SKILLS = new Set([
  "acrobatics", "arcana", "athletics", "crafting", "deception", "diplomacy", "intimidation", "medicine", "nature", "occultism", "performance", "religion", "society", "stealth", "survival", "thievery"
]);

const SKILL_ABILITIES = Object.freeze({
  acrobatics: "dex", arcana: "int", athletics: "str", crafting: "int", deception: "cha", diplomacy: "cha", intimidation: "cha", medicine: "wis", nature: "wis", occultism: "int", performance: "cha", religion: "wis", society: "int", stealth: "dex", survival: "wis", thievery: "dex"
});

const TIER_ORDER = ["low", "average", "high", "extreme"];
const rank = (tier) => TIER_ORDER.indexOf(tier);
function better(a = "average", b = "average") { return rank(a) >= rank(b) ? a : b; }
function normalizeBias(bias) {
  if (bias === "medium") return "average";
  if (bias === "high" || bias === "average" || bias === "low" || bias === "extreme") return bias;
  return "average";
}

function addSkill(map, slug, tier, source, extra = {}) {
  if (!slug) return;
  const normalizedTier = normalizeBias(tier);
  const existing = map.get(slug);
  if (!existing || rank(normalizedTier) > rank(existing.tier)) {
    map.set(slug, { slug, tier: normalizedTier, sources: [source], ...extra });
  } else if (existing) {
    existing.sources.push(source);
  }
}

export function buildSkills({ level, classProfile, profession, role }) {
  const map = new Map();
  for (const skill of classProfile?.preferredSkills ?? []) addSkill(map, skill, "high", `class:${classProfile.id}`);
  for (const [skill, bias] of Object.entries(classProfile?.skillBias ?? {})) addSkill(map, skill, bias, `class:${classProfile.id}`);
  for (const [skill, bias] of Object.entries(profession?.skillBias ?? {})) addSkill(map, skill, bias, `profession:${profession.id}`);
  for (const [skill, bias] of Object.entries(role?.skillBias ?? {})) addSkill(map, skill, bias, `role:${role.id}`);

  for (const lore of profession?.lore ?? []) {
    const slug = lore.slug ?? `${String(lore).toLowerCase().replace(/[^a-z0-9]+/g, "-")}-lore`;
    addSkill(map, slug, lore.tier ?? "high", `profession:${profession.id}`, { type: "lore", label: lore.label ?? lore.slug ?? String(lore), labelKey: lore.labelKey ?? null });
  }

  const modifierAdjustment = Number(role?.skillModifierAdjustment ?? 0) || 0;
  return [...map.values()].map((entry) => {
    const modifier = ruleValue(SKILLS, level, entry.tier) + modifierAdjustment;
    return {
      ...entry,
      type: entry.type ?? (STANDARD_SKILLS.has(entry.slug) ? "standard" : "lore"),
      ability: SKILL_ABILITIES[entry.slug] ?? null,
      modifier
    };
  }).sort((a, b) => b.modifier - a.modifier || a.slug.localeCompare(b.slug));
}
