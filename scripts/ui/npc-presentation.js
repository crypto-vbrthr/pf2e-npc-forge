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
  "roads-lore": "NPCFORGE.Lore.Roads"
};

const DAMAGE_KEYS = {
  bludgeoning: "NPCFORGE.Damage.Bludgeoning",
  piercing: "NPCFORGE.Damage.Piercing",
  slashing: "NPCFORGE.Damage.Slashing"
};

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
      displayName: localizeWeapon(weapon ?? { name: attack.label }, localize),
      displayModifier: signed(attack.modifier),
      displayDamage: localizeDamageFormula(attack.damage?.formula ?? "", localize),
      displayDamageType: damageKey ? localize(damageKey) : (attack.damage?.type ?? "")
    };
  });


  const inventory = (npc.inventory ?? []).map((item) => ({
    ...item,
    displayName: item.type === "weapon" ? localizeWeapon(item, localize) : (item.labelKey ? localize(item.labelKey) : (item.name ?? item.id))
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

  return {
    name: npc.identity?.name ?? "",
    ancestry,
    profession,
    classProfile,
    classSpecialization,
    role,
    level: npc.build?.level ?? 0,
    identityLine: [ancestry, profession, classProfile, classSpecialization].filter(Boolean).join(" · "),
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
