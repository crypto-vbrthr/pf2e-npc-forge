export function registerCoreContent(registry) {
  const source = "pf2e-npc-forge";
  registry.register("ancestries", source, {
    id: "core.human", labelKey: "NPCFORGE.Content.Ancestry.Human", weight: 10, speed: 25
  });
  registry.register("ancestries", source, {
    id: "core.dwarf", labelKey: "NPCFORGE.Content.Ancestry.Dwarf", weight: 5, speed: 20,
    attributeAdjustments: { con: 1 }
  });

  // Class profiles are NPC-facing analogues of the Player Core / Player Core 2 class identities.
  // They intentionally describe benchmark preferences and signature concepts rather than PC progression.
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
    },
    {
      id: "core.bard", labelKey: "NPCFORGE.Content.ClassProfile.Bard", tags: ["occult", "spellcaster", "support", "social"],
      attributeTiers: { str: "low", dex: "average", con: "average", int: "average", wis: "average", cha: "high" },
      statistics: { perception: "high", ac: "average", hp: "low", attack: "low", saves: { fortitude: "low", reflex: "average", will: "high" } },
      preferredSkills: ["performance"], skillBias: { diplomacy: "high", occultism: "average", society: "average" },
      abilityIds: ["core.ability.bardic-composition"], weight: 6
    },
    {
      id: "core.druid", labelKey: "NPCFORGE.Content.ClassProfile.Druid", tags: ["primal", "spellcaster", "wilderness"],
      attributeTiers: { str: "low", dex: "average", con: "average", int: "low", wis: "high", cha: "average" },
      statistics: { perception: "high", ac: "average", hp: "average", attack: "low", saves: { fortitude: "average", reflex: "average", will: "high" } },
      preferredSkills: ["nature"], skillBias: { survival: "high", medicine: "average" },
      abilityIds: ["core.ability.primal-caster"], weight: 6
    },
    {
      id: "core.witch", labelKey: "NPCFORGE.Content.ClassProfile.Witch", tags: ["spellcaster", "familiar", "hex"],
      attributeTiers: { str: "low", dex: "average", con: "low", int: "high", wis: "average", cha: "average" },
      statistics: { perception: "average", ac: "low", hp: "low", attack: "low", saves: { fortitude: "low", reflex: "average", will: "high" } },
      preferredSkills: ["occultism"], skillBias: { arcana: "average", nature: "average", religion: "average" },
      abilityIds: ["core.ability.familiar-patron", "core.ability.hex-magic"], weight: 5
    },
    {
      id: "core.alchemist", labelKey: "NPCFORGE.Content.ClassProfile.Alchemist", tags: ["alchemical", "skill", "support"],
      attributeTiers: { str: "low", dex: "average", con: "average", int: "high", wis: "average", cha: "low" },
      statistics: { perception: "average", ac: "average", hp: "average", attack: "average", saves: { fortitude: "average", reflex: "average", will: "average" } },
      preferredSkills: ["crafting"], skillBias: { medicine: "average", nature: "average" },
      abilityIds: ["core.ability.quick-alchemy"], weight: 5
    },
    {
      id: "core.barbarian", labelKey: "NPCFORGE.Content.ClassProfile.Barbarian", tags: ["martial", "striker"],
      attributeTiers: { str: "high", dex: "average", con: "high", int: "low", wis: "average", cha: "low" },
      statistics: { perception: "average", ac: "average", hp: "high", attack: "high", saves: { fortitude: "high", reflex: "average", will: "average" } },
      preferredSkills: ["athletics"], skillBias: { intimidation: "high", survival: "average" },
      abilityIds: ["core.ability.rage"], weight: 7
    },
    {
      id: "core.investigator", labelKey: "NPCFORGE.Content.ClassProfile.Investigator", tags: ["skill", "investigation", "martial"],
      attributeTiers: { str: "low", dex: "average", con: "average", int: "high", wis: "high", cha: "average" },
      statistics: { perception: "high", ac: "average", hp: "average", attack: "average", saves: { fortitude: "average", reflex: "average", will: "high" } },
      preferredSkills: ["society"], skillBias: { medicine: "average", deception: "average", thievery: "average" },
      abilityIds: ["core.ability.devise-stratagem", "core.ability.pursue-lead"], weight: 5
    },
    {
      id: "core.swashbuckler", labelKey: "NPCFORGE.Content.ClassProfile.Swashbuckler", tags: ["martial", "finesse", "mobile", "social"],
      attributeTiers: { str: "low", dex: "high", con: "average", int: "low", wis: "average", cha: "high" },
      statistics: { perception: "average", ac: "high", hp: "average", attack: "high", saves: { fortitude: "low", reflex: "high", will: "average" } },
      preferredSkills: ["acrobatics"], skillBias: { diplomacy: "average", intimidation: "average", deception: "average" },
      abilityIds: ["core.ability.panache", "core.ability.finisher"], weight: 5
    },
    {
      id: "core.monk", labelKey: "NPCFORGE.Content.ClassProfile.Monk", tags: ["martial", "unarmed", "mobile"],
      attributeTiers: { str: "average", dex: "high", con: "high", int: "low", wis: "high", cha: "low" },
      statistics: { perception: "high", ac: "high", hp: "average", attack: "high", saves: { fortitude: "high", reflex: "high", will: "high" } },
      preferredSkills: ["acrobatics", "athletics"], skillBias: { religion: "average" },
      abilityIds: ["core.ability.flurry-of-blows", "core.ability.incredible-movement"], weight: 6
    },
    {
      id: "core.oracle", labelKey: "NPCFORGE.Content.ClassProfile.Oracle", tags: ["divine", "spellcaster", "curse"],
      attributeTiers: { str: "low", dex: "average", con: "average", int: "average", wis: "average", cha: "high" },
      statistics: { perception: "average", ac: "low", hp: "average", attack: "low", saves: { fortitude: "average", reflex: "low", will: "high" } },
      preferredSkills: ["religion"], skillBias: { occultism: "average", medicine: "average" },
      abilityIds: ["core.ability.oracle-mystery", "core.ability.cursebound"], weight: 4
    },
    {
      id: "core.champion", labelKey: "NPCFORGE.Content.ClassProfile.Champion", tags: ["divine", "martial", "defender"],
      attributeTiers: { str: "high", dex: "low", con: "high", int: "low", wis: "average", cha: "high" },
      statistics: { perception: "average", ac: "high", hp: "high", attack: "average", saves: { fortitude: "high", reflex: "low", will: "high" } },
      preferredSkills: ["religion"], skillBias: { athletics: "average", diplomacy: "average", intimidation: "average" },
      abilityIds: ["core.ability.champion-reaction", "core.ability.devoted-armament"], weight: 6
    },
    {
      id: "core.sorcerer", labelKey: "NPCFORGE.Content.ClassProfile.Sorcerer", tags: ["spellcaster", "spontaneous"],
      attributeTiers: { str: "low", dex: "average", con: "average", int: "low", wis: "average", cha: "high" },
      statistics: { perception: "average", ac: "low", hp: "low", attack: "low", saves: { fortitude: "low", reflex: "average", will: "high" } },
      preferredSkills: ["arcana"], skillBias: { deception: "average", diplomacy: "average", occultism: "average" },
      abilityIds: ["core.ability.bloodline-magic"], weight: 5
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
    { id: "core.wizard.spell-blender", parentId: "core.wizard", labelKey: "NPCFORGE.Content.Specialization.SpellBlender", tags: ["arcane", "flexible"], abilityIds: ["core.ability.arcane-thesis"], weight: 10 },
    { id: "core.bard.maestro", parentId: "core.bard", labelKey: "NPCFORGE.Content.Specialization.Maestro", tags: ["support", "performance"], abilityIds: ["core.ability.inspiring-performance"], weight: 10 },
    { id: "core.bard.polymath", parentId: "core.bard", labelKey: "NPCFORGE.Content.Specialization.Polymath", tags: ["skill", "knowledge"], abilityIds: ["core.ability.versatile-performance"], weight: 8 },
    { id: "core.druid.leaf", parentId: "core.druid", labelKey: "NPCFORGE.Content.Specialization.LeafOrder", tags: ["plant", "support"], abilityIds: ["core.ability.leaf-order"], weight: 8 },
    { id: "core.druid.storm", parentId: "core.druid", labelKey: "NPCFORGE.Content.Specialization.StormOrder", tags: ["air", "electricity"], abilityIds: ["core.ability.storm-order"], weight: 8 },
    { id: "core.witch.fate", parentId: "core.witch", labelKey: "NPCFORGE.Content.Specialization.FatePatron", tags: ["occult", "fate"], abilityIds: ["core.ability.fate-hex"], weight: 8 },
    { id: "core.witch.wild", parentId: "core.witch", labelKey: "NPCFORGE.Content.Specialization.WildPatron", tags: ["primal", "wild"], abilityIds: ["core.ability.wild-hex"], weight: 8 },
    { id: "core.alchemist.bomber", parentId: "core.alchemist", labelKey: "NPCFORGE.Content.Specialization.Bomber", tags: ["bomb", "ranged"], abilityIds: ["core.ability.bomber-field"], weight: 10 },
    { id: "core.alchemist.chirurgeon", parentId: "core.alchemist", labelKey: "NPCFORGE.Content.Specialization.Chirurgeon", tags: ["medicine", "support"], abilityIds: ["core.ability.chirurgeon-field"], weight: 8 },
    { id: "core.alchemist.toxicologist", parentId: "core.alchemist", labelKey: "NPCFORGE.Content.Specialization.Toxicologist", tags: ["poison"], abilityIds: ["core.ability.toxicologist-field"], weight: 5 },
    { id: "core.barbarian.fury", parentId: "core.barbarian", labelKey: "NPCFORGE.Content.Specialization.FuryInstinct", tags: ["rage", "weapon"], abilityIds: ["core.ability.fury-instinct"], weight: 10 },
    { id: "core.barbarian.giant", parentId: "core.barbarian", labelKey: "NPCFORGE.Content.Specialization.GiantInstinct", tags: ["rage", "heavy"], abilityIds: ["core.ability.giant-instinct"], weight: 6 },
    { id: "core.investigator.empiricism", parentId: "core.investigator", labelKey: "NPCFORGE.Content.Specialization.Empiricism", tags: ["knowledge", "investigation"], abilityIds: ["core.ability.empiricism-methodology"], weight: 10 },
    { id: "core.investigator.forensic", parentId: "core.investigator", labelKey: "NPCFORGE.Content.Specialization.ForensicMedicine", tags: ["medicine", "investigation"], abilityIds: ["core.ability.forensic-methodology"], weight: 8 },
    { id: "core.swashbuckler.braggart", parentId: "core.swashbuckler", labelKey: "NPCFORGE.Content.Specialization.Braggart", tags: ["intimidation", "panache"], abilityIds: ["core.ability.braggart-style"], weight: 8 },
    { id: "core.swashbuckler.fencer", parentId: "core.swashbuckler", labelKey: "NPCFORGE.Content.Specialization.Fencer", tags: ["deception", "finesse"], abilityIds: ["core.ability.fencer-style"], weight: 8 },
    { id: "core.monk.mobile", parentId: "core.monk", labelKey: "NPCFORGE.Content.Specialization.MobileMonk", tags: ["mobile", "agile"], abilityIds: ["core.ability.mobile-stance"], weight: 10 },
    { id: "core.monk.mountain", parentId: "core.monk", labelKey: "NPCFORGE.Content.Specialization.MountainMonk", tags: ["defender", "strength"], abilityIds: ["core.ability.mountain-stance"], weight: 7 },
    { id: "core.oracle.battle", parentId: "core.oracle", labelKey: "NPCFORGE.Content.Specialization.BattleMystery", tags: ["divine", "martial"], abilityIds: ["core.ability.battle-mystery"], weight: 7 },
    { id: "core.oracle.life", parentId: "core.oracle", labelKey: "NPCFORGE.Content.Specialization.LifeMystery", tags: ["divine", "healing"], abilityIds: ["core.ability.life-mystery"], weight: 8 },
    { id: "core.champion.redeemer", parentId: "core.champion", labelKey: "NPCFORGE.Content.Specialization.Redeemer", tags: ["defender", "mercy"], abilityIds: ["core.ability.redeemer-cause"], weight: 8 },
    { id: "core.champion.liberator", parentId: "core.champion", labelKey: "NPCFORGE.Content.Specialization.Liberator", tags: ["defender", "freedom"], abilityIds: ["core.ability.liberator-cause"], weight: 8 },
    { id: "core.sorcerer.draconic", parentId: "core.sorcerer", labelKey: "NPCFORGE.Content.Specialization.DraconicBloodline", tags: ["arcane", "dragon"], abilityIds: ["core.ability.draconic-bloodline"], weight: 8 },
    { id: "core.sorcerer.elemental", parentId: "core.sorcerer", labelKey: "NPCFORGE.Content.Specialization.ElementalBloodline", tags: ["primal", "elemental"], abilityIds: ["core.ability.elemental-bloodline"], weight: 8 }
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
    { id: "core.ability.arcane-thesis", labelKey: "NPCFORGE.Abilities.ArcaneThesis.Name", descriptionKey: "NPCFORGE.Abilities.ArcaneThesis.Description", actionType: "passive", traits: ["arcane"] },

    { id: "core.ability.bardic-composition", labelKey: "NPCFORGE.Abilities.BardicComposition.Name", descriptionKey: "NPCFORGE.Abilities.BardicComposition.Description", actionType: "action", actions: 1, traits: ["auditory", "concentrate", "occult"] },
    { id: "core.ability.inspiring-performance", labelKey: "NPCFORGE.Abilities.InspiringPerformance.Name", descriptionKey: "NPCFORGE.Abilities.InspiringPerformance.Description", actionType: "action", actions: 1, traits: ["auditory", "emotion", "mental"] },
    { id: "core.ability.versatile-performance", labelKey: "NPCFORGE.Abilities.VersatilePerformance.Name", descriptionKey: "NPCFORGE.Abilities.VersatilePerformance.Description", actionType: "passive", traits: [] },
    { id: "core.ability.primal-caster", labelKey: "NPCFORGE.Abilities.PrimalCaster.Name", descriptionKey: "NPCFORGE.Abilities.PrimalCaster.Description", actionType: "passive", traits: ["primal"] },
    { id: "core.ability.leaf-order", labelKey: "NPCFORGE.Abilities.LeafOrder.Name", descriptionKey: "NPCFORGE.Abilities.LeafOrder.Description", actionType: "passive", traits: ["plant", "primal"] },
    { id: "core.ability.storm-order", labelKey: "NPCFORGE.Abilities.StormOrder.Name", descriptionKey: "NPCFORGE.Abilities.StormOrder.Description", actionType: "passive", traits: ["air", "electricity", "primal"] },
    { id: "core.ability.familiar-patron", labelKey: "NPCFORGE.Abilities.FamiliarPatron.Name", descriptionKey: "NPCFORGE.Abilities.FamiliarPatron.Description", actionType: "passive", traits: [] },
    { id: "core.ability.hex-magic", labelKey: "NPCFORGE.Abilities.HexMagic.Name", descriptionKey: "NPCFORGE.Abilities.HexMagic.Description", actionType: "passive", traits: ["hex"] },
    { id: "core.ability.fate-hex", labelKey: "NPCFORGE.Abilities.FateHex.Name", descriptionKey: "NPCFORGE.Abilities.FateHex.Description", actionType: "reaction", traits: ["fortune", "hex"] },
    { id: "core.ability.wild-hex", labelKey: "NPCFORGE.Abilities.WildHex.Name", descriptionKey: "NPCFORGE.Abilities.WildHex.Description", actionType: "action", actions: 1, traits: ["hex", "primal"] },
    { id: "core.ability.quick-alchemy", labelKey: "NPCFORGE.Abilities.QuickAlchemy.Name", descriptionKey: "NPCFORGE.Abilities.QuickAlchemy.Description", actionType: "action", actions: 1, traits: ["alchemical", "manipulate"] },
    { id: "core.ability.bomber-field", labelKey: "NPCFORGE.Abilities.BomberField.Name", descriptionKey: "NPCFORGE.Abilities.BomberField.Description", actionType: "passive", traits: ["alchemical"] },
    { id: "core.ability.chirurgeon-field", labelKey: "NPCFORGE.Abilities.ChirurgeonField.Name", descriptionKey: "NPCFORGE.Abilities.ChirurgeonField.Description", actionType: "passive", traits: ["alchemical", "healing"] },
    { id: "core.ability.toxicologist-field", labelKey: "NPCFORGE.Abilities.ToxicologistField.Name", descriptionKey: "NPCFORGE.Abilities.ToxicologistField.Description", actionType: "passive", traits: ["alchemical", "poison"] },
    { id: "core.ability.rage", labelKey: "NPCFORGE.Abilities.Rage.Name", descriptionKey: "NPCFORGE.Abilities.Rage.Description", actionType: "action", actions: 1, traits: ["emotion", "mental", "rage"] },
    { id: "core.ability.fury-instinct", labelKey: "NPCFORGE.Abilities.FuryInstinct.Name", descriptionKey: "NPCFORGE.Abilities.FuryInstinct.Description", actionType: "passive", traits: ["rage"] },
    { id: "core.ability.giant-instinct", labelKey: "NPCFORGE.Abilities.GiantInstinct.Name", descriptionKey: "NPCFORGE.Abilities.GiantInstinct.Description", actionType: "passive", traits: ["rage"] },
    { id: "core.ability.devise-stratagem", labelKey: "NPCFORGE.Abilities.DeviseStratagem.Name", descriptionKey: "NPCFORGE.Abilities.DeviseStratagem.Description", actionType: "action", actions: 1, traits: ["concentrate", "fortune"] },
    { id: "core.ability.pursue-lead", labelKey: "NPCFORGE.Abilities.PursueLead.Name", descriptionKey: "NPCFORGE.Abilities.PursueLead.Description", actionType: "passive", traits: ["concentrate", "exploration"] },
    { id: "core.ability.empiricism-methodology", labelKey: "NPCFORGE.Abilities.EmpiricismMethodology.Name", descriptionKey: "NPCFORGE.Abilities.EmpiricismMethodology.Description", actionType: "passive", traits: [] },
    { id: "core.ability.forensic-methodology", labelKey: "NPCFORGE.Abilities.ForensicMethodology.Name", descriptionKey: "NPCFORGE.Abilities.ForensicMethodology.Description", actionType: "passive", traits: ["healing"] },
    { id: "core.ability.panache", labelKey: "NPCFORGE.Abilities.Panache.Name", descriptionKey: "NPCFORGE.Abilities.Panache.Description", actionType: "passive", traits: [] },
    { id: "core.ability.finisher", labelKey: "NPCFORGE.Abilities.Finisher.Name", descriptionKey: "NPCFORGE.Abilities.Finisher.Description", actionType: "action", actions: 1, traits: ["finisher"] },
    { id: "core.ability.braggart-style", labelKey: "NPCFORGE.Abilities.BraggartStyle.Name", descriptionKey: "NPCFORGE.Abilities.BraggartStyle.Description", actionType: "passive", traits: ["emotion", "mental"] },
    { id: "core.ability.fencer-style", labelKey: "NPCFORGE.Abilities.FencerStyle.Name", descriptionKey: "NPCFORGE.Abilities.FencerStyle.Description", actionType: "passive", traits: [] },
    { id: "core.ability.flurry-of-blows", labelKey: "NPCFORGE.Abilities.FlurryOfBlows.Name", descriptionKey: "NPCFORGE.Abilities.FlurryOfBlows.Description", actionType: "action", actions: 1, traits: ["flourish"] },
    { id: "core.ability.incredible-movement", labelKey: "NPCFORGE.Abilities.IncredibleMovement.Name", descriptionKey: "NPCFORGE.Abilities.IncredibleMovement.Description", actionType: "passive", traits: [] },
    { id: "core.ability.mobile-stance", labelKey: "NPCFORGE.Abilities.MobileStance.Name", descriptionKey: "NPCFORGE.Abilities.MobileStance.Description", actionType: "action", actions: 1, traits: ["stance"] },
    { id: "core.ability.mountain-stance", labelKey: "NPCFORGE.Abilities.MountainStance.Name", descriptionKey: "NPCFORGE.Abilities.MountainStance.Description", actionType: "action", actions: 1, traits: ["stance"] },
    { id: "core.ability.oracle-mystery", labelKey: "NPCFORGE.Abilities.OracleMystery.Name", descriptionKey: "NPCFORGE.Abilities.OracleMystery.Description", actionType: "passive", traits: ["divine"] },
    { id: "core.ability.cursebound", labelKey: "NPCFORGE.Abilities.Cursebound.Name", descriptionKey: "NPCFORGE.Abilities.Cursebound.Description", actionType: "passive", traits: ["curse", "divine"] },
    { id: "core.ability.battle-mystery", labelKey: "NPCFORGE.Abilities.BattleMystery.Name", descriptionKey: "NPCFORGE.Abilities.BattleMystery.Description", actionType: "passive", traits: ["divine", "martial"] },
    { id: "core.ability.life-mystery", labelKey: "NPCFORGE.Abilities.LifeMystery.Name", descriptionKey: "NPCFORGE.Abilities.LifeMystery.Description", actionType: "passive", traits: ["divine", "healing"] },
    { id: "core.ability.champion-reaction", labelKey: "NPCFORGE.Abilities.ChampionReaction.Name", descriptionKey: "NPCFORGE.Abilities.ChampionReaction.Description", actionType: "reaction", traits: ["divine"] },
    { id: "core.ability.devoted-armament", labelKey: "NPCFORGE.Abilities.DevotedArmament.Name", descriptionKey: "NPCFORGE.Abilities.DevotedArmament.Description", actionType: "passive", traits: ["divine"] },
    { id: "core.ability.redeemer-cause", labelKey: "NPCFORGE.Abilities.RedeemerCause.Name", descriptionKey: "NPCFORGE.Abilities.RedeemerCause.Description", actionType: "passive", traits: ["divine"] },
    { id: "core.ability.liberator-cause", labelKey: "NPCFORGE.Abilities.LiberatorCause.Name", descriptionKey: "NPCFORGE.Abilities.LiberatorCause.Description", actionType: "passive", traits: ["divine"] },
    { id: "core.ability.bloodline-magic", labelKey: "NPCFORGE.Abilities.BloodlineMagic.Name", descriptionKey: "NPCFORGE.Abilities.BloodlineMagic.Description", actionType: "passive", traits: [] },
    { id: "core.ability.draconic-bloodline", labelKey: "NPCFORGE.Abilities.DraconicBloodline.Name", descriptionKey: "NPCFORGE.Abilities.DraconicBloodline.Description", actionType: "passive", traits: ["arcane", "dragon"] },
    { id: "core.ability.elemental-bloodline", labelKey: "NPCFORGE.Abilities.ElementalBloodline.Name", descriptionKey: "NPCFORGE.Abilities.ElementalBloodline.Description", actionType: "passive", traits: ["elemental", "primal"] }
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
