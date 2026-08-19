export function registerCoreContent(registry) {
  const source = "pf2e-npc-forge";
  registry.register("ancestries", source, {
    id: "core.human", labelKey: "NPCFORGE.Content.Ancestry.Human", weight: 10, speed: 25
  });
  registry.register("ancestries", source, {
    id: "core.dwarf", labelKey: "NPCFORGE.Content.Ancestry.Dwarf", weight: 5, speed: 20,
    attributeAdjustments: { con: 1 }
  });

  const classProfiles = [
    {
      id: "core.fighter", labelKey: "NPCFORGE.Content.ClassProfile.Fighter", tags: ["martial"],
      attributeTiers: { str: "high", dex: "average", con: "high", int: "low", wis: "average", cha: "low" },
      statistics: { perception: "average", ac: "high", hp: "average", attack: "high", saves: { fortitude: "high", reflex: "average", will: "low" } },
      preferredSkills: ["athletics"], skillBias: { intimidation: "average" },
      abilityIds: ["core.ability.reactive-strike", "core.ability.weapon-specialist"], weight: 10
    },
    {
      id: "core.rogue", labelKey: "NPCFORGE.Content.ClassProfile.Rogue", tags: ["martial", "skill"],
      attributeTiers: { str: "low", dex: "high", con: "average", int: "average", wis: "average", cha: "average" },
      statistics: { perception: "high", ac: "average", hp: "low", attack: "high", saves: { fortitude: "low", reflex: "high", will: "average" } },
      preferredSkills: ["stealth", "thievery"], skillBias: { deception: "average", acrobatics: "average" },
      abilityIds: ["core.ability.sneak-attack", "core.ability.surprise-attack"], weight: 8
    },
    {
      id: "core.ranger", labelKey: "NPCFORGE.Content.ClassProfile.Ranger", tags: ["martial", "wilderness"],
      attributeTiers: { str: "average", dex: "high", con: "high", int: "low", wis: "high", cha: "low" },
      statistics: { perception: "high", ac: "average", hp: "average", attack: "high", saves: { fortitude: "high", reflex: "high", will: "average" } },
      preferredSkills: ["nature", "survival"], skillBias: { stealth: "average", athletics: "average" },
      abilityIds: ["core.ability.hunt-prey"], weight: 8
    },
    {
      id: "core.cleric", labelKey: "NPCFORGE.Content.ClassProfile.Cleric", tags: ["divine", "spellcaster"],
      attributeTiers: { str: "low", dex: "low", con: "average", int: "average", wis: "high", cha: "average" },
      statistics: { perception: "average", ac: "average", hp: "average", attack: "low", saves: { fortitude: "average", reflex: "low", will: "high" } },
      preferredSkills: ["religion"], skillBias: { medicine: "average", diplomacy: "average" },
      abilityIds: ["core.ability.divine-font"], weight: 6
    },
    {
      id: "core.wizard", labelKey: "NPCFORGE.Content.ClassProfile.Wizard", tags: ["arcane", "spellcaster"],
      attributeTiers: { str: "low", dex: "average", con: "low", int: "high", wis: "average", cha: "low" },
      statistics: { perception: "average", ac: "low", hp: "low", attack: "low", saves: { fortitude: "low", reflex: "average", will: "high" } },
      preferredSkills: ["arcana"], skillBias: { society: "average", occultism: "average" },
      abilityIds: ["core.ability.arcane-bond"], weight: 5
    }
  ];
  for (const profile of classProfiles) registry.register("classProfiles", source, profile);

  const specializations = [
    { id: "core.fighter.sword-shield", parentId: "core.fighter", labelKey: "NPCFORGE.Content.Specialization.SwordShield", tags: ["shield", "defender"], abilityIds: ["core.ability.shielded-guard"], weight: 10 },
    { id: "core.fighter.two-handed", parentId: "core.fighter", labelKey: "NPCFORGE.Content.Specialization.TwoHanded", tags: ["two-handed", "striker"], abilityIds: ["core.ability.powerful-swing"], weight: 8 },
    { id: "core.rogue.thief", parentId: "core.rogue", labelKey: "NPCFORGE.Content.Specialization.Thief", tags: ["finesse", "skill"], abilityIds: ["core.ability.tactical-step"], weight: 10 },
    { id: "core.rogue.ruffian", parentId: "core.rogue", labelKey: "NPCFORGE.Content.Specialization.Ruffian", tags: ["brutal", "intimidation"], abilityIds: ["core.ability.brutal-ambush"], weight: 6 },
    { id: "core.ranger.precision", parentId: "core.ranger", labelKey: "NPCFORGE.Content.Specialization.Precision", tags: ["precision"], abilityIds: ["core.ability.precision-edge"], weight: 10 },
    { id: "core.ranger.flurry", parentId: "core.ranger", labelKey: "NPCFORGE.Content.Specialization.Flurry", tags: ["multiattack"], abilityIds: ["core.ability.flurry-edge"], weight: 8 },
    { id: "core.cleric.cloistered", parentId: "core.cleric", labelKey: "NPCFORGE.Content.Specialization.Cloistered", tags: ["spellcaster", "support"], abilityIds: ["core.ability.cloistered-doctrine"], weight: 8 },
    { id: "core.cleric.warpriest", parentId: "core.cleric", labelKey: "NPCFORGE.Content.Specialization.Warpriest", tags: ["martial", "divine"], abilityIds: ["core.ability.warpriest-doctrine"], weight: 8 },
    { id: "core.wizard.spell-blender", parentId: "core.wizard", labelKey: "NPCFORGE.Content.Specialization.SpellBlender", tags: ["arcane", "flexible"], abilityIds: ["core.ability.arcane-thesis"], weight: 10 }
  ];
  for (const specialization of specializations) registry.register("classSpecializations", source, specialization);

  const abilities = [
    { id: "core.ability.reactive-strike", labelKey: "NPCFORGE.Abilities.ReactiveStrike.Name", descriptionKey: "NPCFORGE.Abilities.ReactiveStrike.Description", actionType: "reaction", actions: null, traits: ["attack"], minLevel: 1 },
    { id: "core.ability.weapon-specialist", labelKey: "NPCFORGE.Abilities.WeaponSpecialist.Name", descriptionKey: "NPCFORGE.Abilities.WeaponSpecialist.Description", actionType: "passive", traits: [] },
    { id: "core.ability.shielded-guard", labelKey: "NPCFORGE.Abilities.ShieldedGuard.Name", descriptionKey: "NPCFORGE.Abilities.ShieldedGuard.Description", actionType: "passive", traits: [] },
    { id: "core.ability.powerful-swing", labelKey: "NPCFORGE.Abilities.PowerfulSwing.Name", descriptionKey: "NPCFORGE.Abilities.PowerfulSwing.Description", actionType: "action", actions: 2, traits: ["flourish"] },
    { id: "core.ability.sneak-attack", labelKey: "NPCFORGE.Abilities.SneakAttack.Name", descriptionKey: "NPCFORGE.Abilities.SneakAttack.Description", actionType: "passive", scaling: "sneak-attack", traits: ["precision"] },
    { id: "core.ability.surprise-attack", labelKey: "NPCFORGE.Abilities.SurpriseAttack.Name", descriptionKey: "NPCFORGE.Abilities.SurpriseAttack.Description", actionType: "passive", traits: [] },
    { id: "core.ability.tactical-step", labelKey: "NPCFORGE.Abilities.TacticalStep.Name", descriptionKey: "NPCFORGE.Abilities.TacticalStep.Description", actionType: "action", actions: 1, traits: ["move"] },
    { id: "core.ability.brutal-ambush", labelKey: "NPCFORGE.Abilities.BrutalAmbush.Name", descriptionKey: "NPCFORGE.Abilities.BrutalAmbush.Description", actionType: "passive", traits: ["fear", "mental"] },
    { id: "core.ability.hunt-prey", labelKey: "NPCFORGE.Abilities.HuntPrey.Name", descriptionKey: "NPCFORGE.Abilities.HuntPrey.Description", actionType: "action", actions: 1, traits: ["concentrate"] },
    { id: "core.ability.precision-edge", labelKey: "NPCFORGE.Abilities.PrecisionEdge.Name", descriptionKey: "NPCFORGE.Abilities.PrecisionEdge.Description", actionType: "passive", traits: ["precision"] },
    { id: "core.ability.flurry-edge", labelKey: "NPCFORGE.Abilities.FlurryEdge.Name", descriptionKey: "NPCFORGE.Abilities.FlurryEdge.Description", actionType: "passive", traits: [] },
    { id: "core.ability.divine-font", labelKey: "NPCFORGE.Abilities.DivineFont.Name", descriptionKey: "NPCFORGE.Abilities.DivineFont.Description", actionType: "passive", traits: ["divine"] },
    { id: "core.ability.cloistered-doctrine", labelKey: "NPCFORGE.Abilities.CloisteredDoctrine.Name", descriptionKey: "NPCFORGE.Abilities.CloisteredDoctrine.Description", actionType: "passive", traits: ["divine"] },
    { id: "core.ability.warpriest-doctrine", labelKey: "NPCFORGE.Abilities.WarpriestDoctrine.Name", descriptionKey: "NPCFORGE.Abilities.WarpriestDoctrine.Description", actionType: "passive", traits: ["divine"] },
    { id: "core.ability.arcane-bond", labelKey: "NPCFORGE.Abilities.ArcaneBond.Name", descriptionKey: "NPCFORGE.Abilities.ArcaneBond.Description", actionType: "free", actions: null, traits: ["arcane"] },
    { id: "core.ability.arcane-thesis", labelKey: "NPCFORGE.Abilities.ArcaneThesis.Name", descriptionKey: "NPCFORGE.Abilities.ArcaneThesis.Description", actionType: "passive", traits: ["arcane"] }
  ];
  for (const ability of abilities) registry.register("abilityDefinitions", source, ability);

  registry.register("professionCategories", source, { id: "core.profession-category.civic", labelKey: "NPCFORGE.Content.Category.Civic", weight: 10 });
  registry.register("professionCategories", source, { id: "core.profession-category.artisan", labelKey: "NPCFORGE.Content.Category.Artisan", weight: 10 });
  registry.register("professionCategories", source, { id: "core.profession-category.criminal", labelKey: "NPCFORGE.Content.Category.Criminal", weight: 6 });

  registry.register("professions", source, { id: "core.guard", parentId: "core.profession-category.civic", labelKey: "NPCFORGE.Content.Profession.Guard", tags: ["civic", "martial", "security"], skillBias: { athletics: "high", society: "average", intimidation: "average" }, lore: [{ slug: "legal-lore", label: "Legal Lore", labelKey: "NPCFORGE.Lore.Legal", tier: "average" }], attributeBias: { str: "high" }, weight: 10 });
  registry.register("professions", source, { id: "core.blacksmith", parentId: "core.profession-category.artisan", labelKey: "NPCFORGE.Content.Profession.Blacksmith", tags: ["artisan", "craft"], skillBias: { crafting: "high", athletics: "average" }, lore: [{ slug: "blacksmithing-lore", label: "Blacksmithing Lore", labelKey: "NPCFORGE.Lore.Blacksmithing", tier: "high" }], attributeBias: { str: "high", con: "high" }, weight: 10 });
  registry.register("professions", source, { id: "core.thief", parentId: "core.profession-category.criminal", labelKey: "NPCFORGE.Content.Profession.Thief", tags: ["criminal", "stealth"], skillBias: { thievery: "high", stealth: "high", deception: "average" }, lore: [{ slug: "underworld-lore", label: "Underworld Lore", labelKey: "NPCFORGE.Lore.Underworld", tier: "average" }], attributeBias: { dex: "high" }, weight: 8 });
  registry.register("professions", source, { id: "core.highwayman", parentId: "core.profession-category.criminal", labelKey: "NPCFORGE.Content.Profession.Highwayman", tags: ["criminal", "robber", "martial"], skillBias: { intimidation: "high", athletics: "average", survival: "average" }, lore: [{ slug: "roads-lore", label: "Roads Lore", labelKey: "NPCFORGE.Lore.Roads", tier: "average" }], attributeBias: { str: "high" }, weight: 4 });
  registry.register("professions", source, { id: "core.assassin", parentId: "core.profession-category.criminal", labelKey: "NPCFORGE.Content.Profession.Assassin", tags: ["criminal", "assassin", "stealth"], skillBias: { stealth: "high", deception: "high", thievery: "average" }, lore: [{ slug: "underworld-lore", label: "Underworld Lore", labelKey: "NPCFORGE.Lore.Underworld", tier: "high" }], attributeBias: { dex: "high" }, weight: 1 });

  registry.register("roles", source, { id: "core.veteran", labelKey: "NPCFORGE.Content.Role.Veteran", statAdjustments: { perception: 1, fortitude: 1 }, skillModifierAdjustment: 1, weight: 5 });
  registry.register("roles", source, { id: "core.ordinary", labelKey: "NPCFORGE.Content.Role.Ordinary", weight: 10 });

  registry.register("namePacks", source, { id: "core.generic-human", ancestryIds: ["core.human"], given: ["Alden", "Mira", "Tarin", "Lysa", "Bren"], family: ["Miller", "Warden", "Stone", "Reed", "Vale"], weight: 10 });
  registry.register("namePacks", source, { id: "core.generic-dwarf", ancestryIds: ["core.dwarf"], given: ["Hargun", "Dagna", "Borin", "Runa", "Keld"], family: ["Ironhand", "Stonehelm", "Deepdelver", "Forgeheart"], weight: 10 });
}
