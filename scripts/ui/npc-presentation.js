import { renderGeneratedName } from "../engine/names/name-renderer.js";
const SKILL_KEYS = {
  acrobatics: "NPCFORGE.Skills.Acrobatics",
  arcana: "NPCFORGE.Skills.Arcana",
  athletics: "NPCFORGE.Skills.Athletics",
  crafting: "NPCFORGE.Skills.Crafting",
  deception: "NPCFORGE.Skills.Deception",
  diplomacy: "NPCFORGE.Skills.Diplomacy",
  intimidation: "NPCFORGE.Skills.Intimidation",
  medicine: "NPCFORGE.Skills.Medicine",
  nature: "NPCFORGE.Skills.Nature",
  occultism: "NPCFORGE.Skills.Occultism",
  performance: "NPCFORGE.Skills.Performance",
  religion: "NPCFORGE.Skills.Religion",
  society: "NPCFORGE.Skills.Society",
  stealth: "NPCFORGE.Skills.Stealth",
  survival: "NPCFORGE.Skills.Survival",
  thievery: "NPCFORGE.Skills.Thievery",
  "legal-lore": "NPCFORGE.Lore.Legal",
  "blacksmithing-lore": "NPCFORGE.Lore.Blacksmithing",
  "underworld-lore": "NPCFORGE.Lore.Underworld",
  "roads-lore": "NPCFORGE.Lore.Roads",
  "bureaucracy-lore": "NPCFORGE.Lore.Bureaucracy",
  "carpentry-lore": "NPCFORGE.Lore.Carpentry",
  "jewelry-lore": "NPCFORGE.Lore.Jewelry",
  "warfare-lore": "NPCFORGE.Lore.Warfare",
  "temple-lore": "NPCFORGE.Lore.Temple",
  "academia-lore": "NPCFORGE.Lore.Academia",
  "library-lore": "NPCFORGE.Lore.Library",
  "mercantile-lore": "NPCFORGE.Lore.Mercantile",
  "hospitality-lore": "NPCFORGE.Lore.Hospitality",
  "farming-lore": "NPCFORGE.Lore.Farming",
  "hunting-lore": "NPCFORGE.Lore.Hunting",
  "sailing-lore": "NPCFORGE.Lore.Sailing",
  "medicine-lore": "NPCFORGE.Lore.Medicine",
  "apothecary-lore": "NPCFORGE.Lore.Apothecary",
  "music-lore": "NPCFORGE.Lore.Music",
  "theater-lore": "NPCFORGE.Lore.Theater"
};

const DAMAGE_KEYS = {
  bludgeoning: "NPCFORGE.Damage.Bludgeoning",
  piercing: "NPCFORGE.Damage.Piercing",
  slashing: "NPCFORGE.Damage.Slashing"
};

const GENDER_KEYS = { female: "NPCFORGE.Identity.GenderFemale", male: "NPCFORGE.Identity.GenderMale", nonbinary: "NPCFORGE.Identity.GenderNonbinary" };
const AGE_KEYS = { youngAdult: "NPCFORGE.Identity.AgeYoungAdult", adult: "NPCFORGE.Identity.AgeAdult", middleAged: "NPCFORGE.Identity.AgeMiddleAged", elder: "NPCFORGE.Identity.AgeElder" };
const SENSE_KEYS = { "low-light-vision": "NPCFORGE.Senses.LowLightVision", darkvision: "NPCFORGE.Senses.Darkvision" };
const LANGUAGE_KEYS = { common:"NPCFORGE.Languages.Common", elven:"NPCFORGE.Languages.Elven", gnomish:"NPCFORGE.Languages.Gnomish", fey:"NPCFORGE.Languages.Fey", goblin:"NPCFORGE.Languages.Goblin", halfling:"NPCFORGE.Languages.Halfling", orcish:"NPCFORGE.Languages.Orcish", dwarven:"NPCFORGE.Languages.Dwarven", amurrun:"NPCFORGE.Languages.Amurrun", iruxi:"NPCFORGE.Languages.Iruxi", kholo:"NPCFORGE.Languages.Kholo", sakvroth:"NPCFORGE.Languages.Sakvroth", tengu:"NPCFORGE.Languages.Tengu", tripkee:"NPCFORGE.Languages.Tripkee", ysoki:"NPCFORGE.Languages.Ysoki" };

const WEAPON_KEYS = {
  spear: "NPCFORGE.Weapons.Spear",
  dagger: "NPCFORGE.Weapons.Dagger",
  club: "NPCFORGE.Weapons.Club",
  longsword: "NPCFORGE.Weapons.Longsword",
  rapier: "NPCFORGE.Weapons.Rapier",
  fist: "NPCFORGE.Weapons.Fist"
};

function signed(value) {
  const number = Number(value ?? 0);
  return number >= 0 ? `+${number}` : `${number}`;
}

function localizeDefinition(definition, localize) {
  if (!definition) return "";
  if (definition.labelKey) return localize(definition.labelKey);
  return definition.label ?? definition.id ?? "";
}

function localizeWeapon(item, localize) {
  const key = item?.labelKey ?? WEAPON_KEYS[String(item?.name ?? "").toLowerCase()];
  return key ? localize(key) : (item?.name ?? "");
}

function localizeDamageFormula(formula, localize) {
  const text = String(formula ?? "");
  const dieLetter = localize("NPCFORGE.Notation.DieLetter");
  if (!dieLetter || dieLetter === "NPCFORGE.Notation.DieLetter" || dieLetter === "d") return text;
  return text.replace(/(\d+)d(\d+)/gi, `$1${dieLetter}$2`);
}

export function presentNpc(npc, localize = (key) => key) {
  if (!npc) return null;
  const profession = localizeDefinition(npc.build?.profession, localize);
  const classProfile = localizeDefinition(npc.build?.classProfile, localize);
  const ancestry = localizeDefinition(npc.identity?.ancestry, localize);
  const role = localizeDefinition(npc.build?.role, localize);
  const classSpecialization = localizeDefinition(npc.build?.classSpecialization, localize);
  const professionSpecialization = localizeDefinition(npc.build?.professionSpecialization, localize);

  const skills = (npc.skills ?? []).map((skill) => ({
    ...skill,
    displayName: skill.labelKey ? localize(skill.labelKey) : (SKILL_KEYS[skill.slug] ? localize(SKILL_KEYS[skill.slug]) : (skill.label ?? skill.slug)),
    displayModifier: signed(skill.modifier)
  })).sort((a, b) => b.modifier - a.modifier || a.displayName.localeCompare(b.displayName));

  const inventoryById = new Map((npc.inventory ?? []).map((item) => [item.id, item]));
  const attacks = (npc.attacks ?? []).map((attack) => {
    const weapon = inventoryById.get(attack.sourceWeaponId);
    const damageKey = DAMAGE_KEYS[attack.damage?.type];
    return {
      ...attack,
      displayName: attack.labelKey ? localize(attack.labelKey) : localizeWeapon(weapon ?? { name: attack.label }, localize),
      displayModifier: signed(attack.modifier),
      displayDamage: localizeDamageFormula(attack.damage?.formula ?? "", localize),
      displayDamageType: damageKey ? localize(damageKey) : (attack.damage?.type ?? "")
    };
  });


  const inventory = (npc.inventory ?? []).map((item) => ({
    ...item,
    displayName: item.type === "weapon" ? localizeWeapon(item, localize) : (item.labelKey ? localize(item.labelKey) : (item.name ?? item.id)),
    displayType: localize(`NPCFORGE.InventoryTypes.${item.type === "unarmed" ? "Unarmed" : item.type === "weapon" ? "Weapon" : item.type === "armor" ? "Armor" : item.type === "shield" ? "Shield" : item.type === "consumable" ? "Consumable" : "Equipment"}`),
    quantity: Number(item.quantity ?? 1)
  }));

  const abilities = (npc.abilities ?? []).map((ability) => ({
    ...ability,
    displayName: ability.labelKey ? localize(ability.labelKey) : (ability.label ?? ability.id),
    displayDescription: ability.descriptionKey ? localize(ability.descriptionKey).replace("{dice}", ability.parameters?.dice ?? "") : (ability.description ?? ""),
    displayAction: ability.actionType === "reaction" ? localize("NPCFORGE.AbilityTypes.Reaction")
      : ability.actionType === "free" ? localize("NPCFORGE.AbilityTypes.FreeAction")
      : ability.actionType === "passive" ? localize("NPCFORGE.AbilityTypes.Passive")
      : ability.actions === 2 ? localize("NPCFORGE.AbilityTypes.TwoActions")
      : ability.actions === 3 ? localize("NPCFORGE.AbilityTypes.ThreeActions")
      : localize("NPCFORGE.AbilityTypes.OneAction")
  }));

  const attributes = npc.statistics?.attributes ?? {};
  const saves = npc.statistics?.saves ?? {};

  const renderedName = npc.identity?.nameParts ? renderGeneratedName(npc.identity.nameParts, localize) : (npc.identity?.name ?? "");

  return {
    name: renderedName,
    ancestry,
    profession,
    classProfile,
    classSpecialization,
    professionSpecialization,
    role,
    level: npc.build?.level ?? 0,
    identityLine: [ancestry, profession, professionSpecialization, classProfile, classSpecialization].filter(Boolean).join(" · "),
    identity: {
      gender: GENDER_KEYS[npc.identity?.gender] ? localize(GENDER_KEYS[npc.identity.gender]) : (npc.identity?.gender ?? ""),
      ageCategory: AGE_KEYS[npc.identity?.age?.category] ? localize(AGE_KEYS[npc.identity.age.category]) : (npc.identity?.age?.category ?? ""),
      ageYears: npc.identity?.age?.years ?? null,
      size: localize(npc.identity?.size === "sm" ? "NPCFORGE.Sizes.Small" : "NPCFORGE.Sizes.Medium"),
      languages: (npc.identity?.languages ?? []).map((language) => LANGUAGE_KEYS[language] ? localize(LANGUAGE_KEYS[language]) : language),
      senses: (npc.identity?.senses ?? []).map((sense) => SENSE_KEYS[sense] ? localize(SENSE_KEYS[sense]) : sense)
    },
    statistics: {
      ac: npc.statistics?.ac,
      hp: npc.statistics?.hp,
      perception: signed(npc.statistics?.perception),
      speed: npc.statistics?.speed,
      saves: {
        fortitude: signed(saves.fortitude),
        reflex: signed(saves.reflex),
        will: signed(saves.will)
      },
      attributes: Object.fromEntries(Object.entries(attributes).map(([key, value]) => [key, signed(value)]))
    },
    skills,
    inventory,
    attacks,
    abilities
  };
}

export const presentationKeys = { SKILL_KEYS, DAMAGE_KEYS, WEAPON_KEYS };
