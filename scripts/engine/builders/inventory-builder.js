import { ruleValue, ATTACK_BONUS, weaponScaledDamageFormula, weakerDamageTier } from "../rules/gm-core-tables.js";

const PACK = "pf2e.equipment-srd";

const FALLBACK_WEAPONS = Object.freeze({
  club: { slug: "club", labelKey: "NPCFORGE.Weapons.Club", damage: { dice: 1, die: "d6", type: "bludgeoning" }, traits: [] },
  dagger: { slug: "dagger", labelKey: "NPCFORGE.Weapons.Dagger", damage: { dice: 1, die: "d4", type: "piercing" }, traits: ["agile", "finesse"] },
  spear: { slug: "spear", labelKey: "NPCFORGE.Weapons.Spear", damage: { dice: 1, die: "d6", type: "piercing" }, traits: ["thrown-20"] },
  longsword: { slug: "longsword", labelKey: "NPCFORGE.Weapons.Longsword", damage: { dice: 1, die: "d8", type: "slashing" }, traits: ["versatile-p"] },
  rapier: { slug: "rapier", labelKey: "NPCFORGE.Weapons.Rapier", damage: { dice: 1, die: "d6", type: "piercing" }, traits: ["deadly-d8", "disarm", "finesse"] },
  fist: { slug: null, labelKey: "NPCFORGE.Weapons.Fist", damage: { dice: 1, die: "d6", type: "bludgeoning" }, traits: ["agile", "finesse", "unarmed"] }
});

function itemFromProfileEntry(entry, origin) {
  return {
    id: entry.id ?? `${origin}-${entry.slug ?? entry.labelKey ?? "item"}`,
    name: entry.name ?? entry.slug ?? "Item",
    labelKey: entry.labelKey ?? null,
    type: entry.type ?? "equipment",
    source: entry.slug ? "compendium" : "generated",
    ...(entry.slug ? { compendium: { packId: entry.packId ?? PACK, slug: entry.slug, itemType: entry.itemType ?? null } } : {}),
    quantity: Math.max(1, Number(entry.quantity ?? 1)),
    purpose: entry.purpose ?? "general",
    equipped: entry.equipped ?? false,
    handsHeld: entry.handsHeld ?? null,
    origin,
    damage: entry.damage ?? null,
    traits: [...(entry.traits ?? [])]
  };
}

function baselineWeaponKey(profession, classProfile) {
  const classId = classProfile?.id;
  if (classId === "core.monk") return "fist";
  if (["core.barbarian", "core.champion"].includes(classId)) return "longsword";
  if (classId === "core.swashbuckler") return "rapier";
  if (classId === "core.alchemist") return "dagger";
  if (profession?.id === "core.guard" || profession?.tags?.includes("military")) return "spear";
  if (classProfile?.attributeTiers?.dex === "high" || profession?.attributeBias?.dex === "high") return "dagger";
  return "club";
}

function defaultDamageTier(classProfile) {
  if (classProfile?.statistics?.damage) return classProfile.statistics.damage;
  const id = classProfile?.id;
  if (id === "core.barbarian") return "extreme";
  if (["core.fighter", "core.ranger", "core.champion", "core.rogue", "core.monk"].includes(id)) return "high";
  if (["core.swashbuckler", "core.investigator"].includes(id)) return "average";
  if (classProfile?.tags?.includes("spellcaster")) return "low";
  return classProfile?.statistics?.attack === "high" ? "high" : "average";
}

function strikeDamageTier({ classProfile, traits = [], ranged = false } = {}) {
  let tier = defaultDamageTier(classProfile);
  // GM Core recommends one category lower for agile melee Strikes and generally average/low for ranged Strikes.
  if (traits.includes("agile")) tier = weakerDamageTier(tier, 1);
  if (ranged) tier = weakerDamageTier(tier, 1);
  return tier;
}

function buildAttackDamage({ level, classProfile, weaponDamage, traits = [], ranged = false } = {}) {
  const tier = strikeDamageTier({ classProfile, traits, ranged });
  return weaponScaledDamageFormula({ level, tier, die: weaponDamage?.die ?? "d6" });
}

function buildBaselineWeapon(level, profession, classProfile) {
  const key = baselineWeaponKey(profession, classProfile);
  const definition = FALLBACK_WEAPONS[key];
  const weapon = {
    id: "primary-weapon",
    name: key === "fist" ? "Fist" : key.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
    labelKey: definition.labelKey,
    type: key === "fist" ? "unarmed" : "weapon",
    source: definition.slug ? "compendium" : "generated",
    ...(definition.slug ? { compendium: { packId: PACK, slug: definition.slug, itemType: "weapon" } } : {}),
    quantity: 1,
    purpose: "primary-weapon",
    equipped: true,
    handsHeld: 1,
    origin: "class-profile",
    damage: definition.damage,
    traits: [...definition.traits]
  };
  const scaledDamage = buildAttackDamage({ level, classProfile, weaponDamage: weapon.damage, traits: weapon.traits });
  const attack = {
    id: "primary-attack",
    sourceWeaponId: weapon.id,
    label: weapon.name,
    labelKey: weapon.labelKey,
    modifier: ruleValue(ATTACK_BONUS, level, classProfile?.statistics?.attack ?? "average"),
    attackTier: classProfile?.statistics?.attack ?? "average",
    damage: {
      formula: scaledDamage.formula,
      type: weapon.damage.type,
      benchmarkTier: scaledDamage.tier,
      expectedAverage: scaledDamage.expectedAverage,
      actualAverage: scaledDamage.actualAverage,
      benchmarkFormula: scaledDamage.benchmarkFormula
    },
    traits: [...weapon.traits]
  };
  return { weapon, attack };
}
function profileEntries(registry, ids = []) {
  return ids.flatMap((id) => registry.get("equipmentProfiles", id)?.items ?? []);
}

export function buildInventory({ level, profession, specialization, classProfile, registry, enabled = true } = {}) {
  if (!enabled) return { inventory: [], attacks: [] };

  const { weapon, attack } = buildBaselineWeapon(level, profession, classProfile);
  const inventory = [weapon];
  const seen = new Set([weapon.compendium?.slug ?? weapon.id]);

  const equipmentProfileIds = [
    ...(classProfile?.equipmentProfileIds ?? []),
    ...(profession?.equipmentProfileIds ?? []),
    ...(specialization?.equipmentProfileIds ?? [])
  ];

  for (const entry of profileEntries(registry, equipmentProfileIds)) {
    if (Number.isFinite(entry.minLevel) && level < Number(entry.minLevel)) continue;
    if (Number.isFinite(entry.maxLevel) && level > Number(entry.maxLevel)) continue;
    const key = entry.slug ?? entry.id ?? entry.labelKey;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    inventory.push(itemFromProfileEntry(entry, entry.origin ?? "profession"));
  }

  return { inventory, attacks: [attack] };
}


export function buildAncestryAttacks({ level, ancestry, classProfile } = {}) {
  return (ancestry?.naturalAttacks ?? []).map((definition, index) => {
    const traits = [...(definition.traits ?? ["unarmed"])];
    const scaledDamage = buildAttackDamage({ level, classProfile, weaponDamage: definition.damage, traits });
    return {
      id: `ancestry-attack-${definition.id ?? index}`,
      sourceWeaponId: null,
      sourceType: "ancestry",
      label: definition.id ?? "Natural Attack",
      labelKey: definition.labelKey ?? null,
      modifier: ruleValue(ATTACK_BONUS, level, classProfile?.statistics?.attack ?? "average"),
      attackTier: classProfile?.statistics?.attack ?? "average",
      damage: {
        formula: scaledDamage.formula,
        type: definition.damage?.type ?? "bludgeoning",
        benchmarkTier: scaledDamage.tier,
        expectedAverage: scaledDamage.expectedAverage,
        actualAverage: scaledDamage.actualAverage,
        benchmarkFormula: scaledDamage.benchmarkFormula
      },
      traits
    };
  });
}
