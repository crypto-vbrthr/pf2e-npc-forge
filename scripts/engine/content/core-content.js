export function registerCoreContent(registry) {
  const source = "pf2e-npc-forge";
  // Player Core and Player Core 2 ancestry profiles. These are NPC-facing identity profiles,
  // not full PC ancestry progression. They preserve size, Speed, common senses/languages,
  // broad physical identity, and a few signature natural attacks where those are intrinsic.
  const ancestries = [
    { id: "core.elf", labelKey: "NPCFORGE.Content.Ancestry.Elf", weight: 7, baseHp: 6, size: "med", speed: 30, traits: ["elf", "humanoid"], languages: ["common", "elven"], senses: ["low-light-vision"], attributeAdjustments: { dex: 1, int: 1, con: -1 }, ageRanges: { youngAdult:{min:20,max:40}, adult:{min:41,max:150}, middleAged:{min:151,max:350}, elder:{min:351,max:700} } },
    { id: "core.gnome", labelKey: "NPCFORGE.Content.Ancestry.Gnome", weight: 5, baseHp: 8, size: "sm", speed: 25, traits: ["gnome", "humanoid"], languages: ["common", "gnomish", "fey"], senses: ["low-light-vision"], attributeAdjustments: { con: 1, cha: 1, str: -1 }, ageRanges: { youngAdult:{min:18,max:30}, adult:{min:31,max:120}, middleAged:{min:121,max:250}, elder:{min:251,max:400} } },
    { id: "core.goblin", labelKey: "NPCFORGE.Content.Ancestry.Goblin", weight: 7, baseHp: 6, size: "sm", speed: 25, traits: ["goblin", "humanoid"], languages: ["common", "goblin"], senses: ["darkvision"], attributeAdjustments: { dex: 1, cha: 1, wis: -1 }, ageRanges: { youngAdult:{min:12,max:18}, adult:{min:19,max:35}, middleAged:{min:36,max:50}, elder:{min:51,max:70} } },
    { id: "core.halfling", labelKey: "NPCFORGE.Content.Ancestry.Halfling", weight: 7, baseHp: 6, size: "sm", speed: 25, traits: ["halfling", "humanoid"], languages: ["common", "halfling"], senses: [], attributeAdjustments: { dex: 1, wis: 1, str: -1 }, ageRanges: { youngAdult:{min:18,max:30}, adult:{min:31,max:70}, middleAged:{min:71,max:110}, elder:{min:111,max:150} } },
    { id: "core.leshy", labelKey: "NPCFORGE.Content.Ancestry.Leshy", weight: 4, baseHp: 8, size: "sm", speed: 25, traits: ["leshy", "plant"], languages: ["common", "fey"], senses: ["low-light-vision"], attributeAdjustments: { con: 1, wis: 1, int: -1 }, ageRanges: { youngAdult:{min:1,max:5}, adult:{min:6,max:40}, middleAged:{min:41,max:100}, elder:{min:101,max:300} } },
    { id: "core.human", labelKey: "NPCFORGE.Content.Ancestry.Human", weight: 14, baseHp: 8, size: "med", speed: 25, traits: ["human", "humanoid"], languages: ["common"], senses: [], ageRanges: { youngAdult:{min:16,max:24}, adult:{min:25,max:44}, middleAged:{min:45,max:64}, elder:{min:65,max:95} } },
    { id: "core.orc", labelKey: "NPCFORGE.Content.Ancestry.Orc", weight: 6, baseHp: 10, size: "med", speed: 25, traits: ["orc", "humanoid"], languages: ["common", "orcish"], senses: ["darkvision"], attributeAdjustments: { str: 1, con: 1 }, ageRanges: { youngAdult:{min:14,max:20}, adult:{min:21,max:40}, middleAged:{min:41,max:60}, elder:{min:61,max:85} } },
    { id: "core.dwarf", labelKey: "NPCFORGE.Content.Ancestry.Dwarf", weight: 7, baseHp: 10, size: "med", speed: 20, traits: ["dwarf", "humanoid"], languages: ["common", "dwarven"], senses: ["darkvision"], attributeAdjustments: { con: 1, wis: 1, cha: -1 }, ageRanges: { youngAdult:{min:20,max:40}, adult:{min:41,max:120}, middleAged:{min:121,max:250}, elder:{min:251,max:400} } },

    { id: "core.catfolk", labelKey: "NPCFORGE.Content.Ancestry.Catfolk", weight: 5, baseHp: 8, size: "med", speed: 25, traits: ["catfolk", "humanoid"], languages: ["common", "amurrun"], senses: ["low-light-vision"], attributeAdjustments: { dex: 1, cha: 1, wis: -1 }, ageRanges: { youngAdult:{min:14,max:20}, adult:{min:21,max:45}, middleAged:{min:46,max:65}, elder:{min:66,max:90} } },
    { id: "core.hobgoblin", labelKey: "NPCFORGE.Content.Ancestry.Hobgoblin", weight: 4, baseHp: 8, size: "med", speed: 25, traits: ["hobgoblin", "humanoid"], languages: ["common", "goblin"], senses: ["darkvision"], attributeAdjustments: { con: 1, int: 1, wis: -1 }, ageRanges: { youngAdult:{min:14,max:20}, adult:{min:21,max:45}, middleAged:{min:46,max:65}, elder:{min:66,max:90} } },
    { id: "core.lizardfolk", labelKey: "NPCFORGE.Content.Ancestry.Lizardfolk", weight: 4, baseHp: 8, size: "med", speed: 25, traits: ["humanoid", "lizardfolk"], languages: ["common", "iruxi"], senses: [], attributeAdjustments: { str: 1, wis: 1, int: -1 }, naturalAttacks: [{ id:"claws", labelKey:"NPCFORGE.AncestryAttacks.Claws", damage:{dice:1,die:"d4",type:"slashing"}, traits:["agile","finesse","unarmed"] }], ageRanges: { youngAdult:{min:14,max:22}, adult:{min:23,max:60}, middleAged:{min:61,max:100}, elder:{min:101,max:150} } },
    { id: "core.kholo", labelKey: "NPCFORGE.Content.Ancestry.Kholo", weight: 4, baseHp: 8, size: "med", speed: 25, traits: ["humanoid", "kholo"], languages: ["common", "kholo"], senses: ["darkvision"], attributeAdjustments: { str: 1, int: 1, wis: -1 }, ageRanges: { youngAdult:{min:12,max:18}, adult:{min:19,max:40}, middleAged:{min:41,max:60}, elder:{min:61,max:80} } },
    { id: "core.kobold", labelKey: "NPCFORGE.Content.Ancestry.Kobold", weight: 5, baseHp: 6, size: "sm", speed: 25, traits: ["humanoid", "kobold"], languages: ["common", "sakvroth"], senses: ["darkvision"], attributeAdjustments: { dex: 1, cha: 1, con: -1 }, ageRanges: { youngAdult:{min:6,max:12}, adult:{min:13,max:35}, middleAged:{min:36,max:70}, elder:{min:71,max:120} } },
    { id: "core.tengu", labelKey: "NPCFORGE.Content.Ancestry.Tengu", weight: 4, baseHp: 6, size: "med", speed: 25, traits: ["humanoid", "tengu"], languages: ["common", "tengu"], senses: ["low-light-vision"], attributeAdjustments: { dex: 1 }, naturalAttacks: [{ id:"beak", labelKey:"NPCFORGE.AncestryAttacks.Beak", damage:{dice:1,die:"d6",type:"piercing"}, traits:["finesse","unarmed"] }], ageRanges: { youngAdult:{min:14,max:22}, adult:{min:23,max:55}, middleAged:{min:56,max:85}, elder:{min:86,max:120} } },
    { id: "core.tripkee", labelKey: "NPCFORGE.Content.Ancestry.Tripkee", weight: 3, baseHp: 6, size: "sm", speed: 25, traits: ["humanoid", "tripkee"], languages: ["common", "tripkee"], senses: ["low-light-vision"], attributeAdjustments: { dex: 1, wis: 1, str: -1 }, ageRanges: { youngAdult:{min:10,max:16}, adult:{min:17,max:40}, middleAged:{min:41,max:65}, elder:{min:66,max:90} } },
    { id: "core.ratfolk", labelKey: "NPCFORGE.Content.Ancestry.Ratfolk", weight: 4, baseHp: 6, size: "sm", speed: 25, traits: ["humanoid", "ratfolk"], languages: ["common", "ysoki"], senses: ["low-light-vision"], attributeAdjustments: { dex: 1, int: 1, str: -1 }, naturalAttacks: [{ id:"bite", labelKey:"NPCFORGE.AncestryAttacks.Bite", damage:{dice:1,die:"d4",type:"piercing"}, traits:["agile","finesse","unarmed"] }], ageRanges: { youngAdult:{min:8,max:14}, adult:{min:15,max:35}, middleAged:{min:36,max:50}, elder:{min:51,max:70} } }
  ];
  for (const ancestry of ancestries) registry.register("ancestries", source, ancestry);

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
      statistics: { perception: "average", ac: "average", hp: "high", attack: "average", damage: "extreme", saves: { fortitude: "high", reflex: "average", will: "average" } },
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

  const equipmentProfiles = [
    { id: "core.equipment.guard", items: [
      { id: "guard-armor", labelKey: "NPCFORGE.Equipment.ChainShirt", slug: "chain-shirt", itemType: "armor", type: "armor", purpose: "armor", equipped: true, origin: "profession" },
      { id: "guard-shield", labelKey: "NPCFORGE.Equipment.SteelShield", slug: "steel-shield", itemType: "shield", type: "shield", purpose: "shield", equipped: true, origin: "profession" },
      { id: "guard-lantern", labelKey: "NPCFORGE.Equipment.HoodedLantern", slug: "hooded-lantern", itemType: "equipment", type: "equipment", purpose: "professional", origin: "profession" }
    ] },
    { id: "core.equipment.blacksmith", items: [
      { id: "blacksmith-tools", labelKey: "NPCFORGE.Equipment.ArtisansToolkit", slug: "artisans-toolkit", itemType: "equipment", type: "equipment", purpose: "professional", origin: "profession" },
    ] },
    { id: "core.equipment.thief", items: [
      { id: "thieves-tools", labelKey: "NPCFORGE.Equipment.ThievesToolkit", slug: "thieves-toolkit", itemType: "equipment", type: "equipment", purpose: "professional", origin: "profession" },
      { id: "thief-armor", labelKey: "NPCFORGE.Equipment.LeatherArmor", slug: "leather-armor", itemType: "armor", type: "armor", purpose: "armor", equipped: true, origin: "profession" }
    ] },
    { id: "core.equipment.scholar", items: [
      { id: "writing-set", labelKey: "NPCFORGE.Equipment.WritingSet", slug: "writing-set", itemType: "equipment", type: "equipment", purpose: "professional", origin: "profession" },
      { id: "scholarly-journal", labelKey: "NPCFORGE.Equipment.ScholarlyJournal", slug: "scholarly-journal", itemType: "equipment", type: "equipment", purpose: "professional", origin: "profession" }
    ] },
    { id: "core.equipment.merchant", items: [
      { id: "merchant-scale", labelKey: "NPCFORGE.Equipment.MerchantsScale", slug: "merchants-scale", itemType: "equipment", type: "equipment", purpose: "professional", origin: "profession" },
      { id: "writing-set", labelKey: "NPCFORGE.Equipment.WritingSet", slug: "writing-set", itemType: "equipment", type: "equipment", purpose: "professional", origin: "profession" }
    ] },
    { id: "core.equipment.healer", items: [
      { id: "healers-tools", labelKey: "NPCFORGE.Equipment.HealersToolkit", slug: "healers-toolkit", itemType: "equipment", type: "equipment", purpose: "professional", origin: "profession" }
    ] },
    { id: "core.equipment.priest", items: [
      { id: "religious-symbol", labelKey: "NPCFORGE.Equipment.ReligiousSymbol", slug: "religious-symbol-wooden", itemType: "equipment", type: "equipment", purpose: "professional", origin: "profession" }
    ] },
    { id: "core.equipment.rural", items: [
      { id: "rope", labelKey: "NPCFORGE.Equipment.Rope", slug: "rope", itemType: "equipment", type: "equipment", purpose: "professional", origin: "profession" }
    ] },
    { id: "core.equipment.sailor", items: [
      { id: "rope", labelKey: "NPCFORGE.Equipment.Rope", slug: "rope", itemType: "equipment", type: "equipment", purpose: "professional", origin: "profession" },
      { id: "waterskin", labelKey: "NPCFORGE.Equipment.Waterskin", slug: "waterskin", itemType: "equipment", type: "equipment", purpose: "general", origin: "profession" }
    ] },
    { id: "core.equipment.entertainer", items: [
      { id: "musical-instrument", labelKey: "NPCFORGE.Equipment.MusicalInstrument", slug: "musical-instrument-handheld", itemType: "equipment", type: "equipment", purpose: "professional", origin: "profession" }
    ] }
  ];
  for (const profile of equipmentProfiles) registry.register("equipmentProfiles", source, profile);

  const professionCategories = [
    ["core.profession-category.civic", "NPCFORGE.Content.Category.Civic", 10],
    ["core.profession-category.artisan", "NPCFORGE.Content.Category.Artisan", 10],
    ["core.profession-category.criminal", "NPCFORGE.Content.Category.Criminal", 6],
    ["core.profession-category.military", "NPCFORGE.Content.Category.Military", 8],
    ["core.profession-category.religious", "NPCFORGE.Content.Category.Religious", 6],
    ["core.profession-category.scholarly", "NPCFORGE.Content.Category.Scholarly", 6],
    ["core.profession-category.mercantile", "NPCFORGE.Content.Category.Mercantile", 8],
    ["core.profession-category.rural", "NPCFORGE.Content.Category.Rural", 10],
    ["core.profession-category.maritime", "NPCFORGE.Content.Category.Maritime", 5],
    ["core.profession-category.medical", "NPCFORGE.Content.Category.Medical", 5],
    ["core.profession-category.entertainment", "NPCFORGE.Content.Category.Entertainment", 5]
  ];
  for (const [id, labelKey, weight] of professionCategories) registry.register("professionCategories", source, { id, labelKey, weight });

  const professions = [
    { id: "core.guard", parentId: "core.profession-category.civic", labelKey: "NPCFORGE.Content.Profession.Guard", tags: ["civic", "martial", "security"], skillBias: { athletics: "high", society: "average", intimidation: "average" }, lore: [{ slug: "legal-lore", labelKey: "NPCFORGE.Lore.Legal", tier: "average" }], attributeBias: { str: "high" }, equipmentProfileIds: ["core.equipment.guard"], weight: 10 },
    { id: "core.bailiff", parentId: "core.profession-category.civic", labelKey: "NPCFORGE.Content.Profession.Bailiff", tags: ["civic", "legal"], skillBias: { society: "high", intimidation: "average", diplomacy: "average" }, lore: [{ slug: "legal-lore", labelKey: "NPCFORGE.Lore.Legal", tier: "high" }], weight: 4 },
    { id: "core.scribe", parentId: "core.profession-category.civic", labelKey: "NPCFORGE.Content.Profession.Scribe", tags: ["civic", "scholarly"], skillBias: { society: "high", crafting: "average" }, lore: [{ slug: "bureaucracy-lore", labelKey: "NPCFORGE.Lore.Bureaucracy", tier: "high" }], equipmentProfileIds: ["core.equipment.scholar"], weight: 6 },

    { id: "core.blacksmith", parentId: "core.profession-category.artisan", labelKey: "NPCFORGE.Content.Profession.Blacksmith", tags: ["artisan", "craft"], skillBias: { crafting: "high", athletics: "average" }, lore: [{ slug: "blacksmithing-lore", labelKey: "NPCFORGE.Lore.Blacksmithing", tier: "high" }], attributeBias: { str: "high", con: "high" }, equipmentProfileIds: ["core.equipment.blacksmith"], weight: 10 },
    { id: "core.carpenter", parentId: "core.profession-category.artisan", labelKey: "NPCFORGE.Content.Profession.Carpenter", tags: ["artisan", "craft"], skillBias: { crafting: "high", athletics: "average" }, lore: [{ slug: "carpentry-lore", labelKey: "NPCFORGE.Lore.Carpentry", tier: "high" }], equipmentProfileIds: ["core.equipment.blacksmith"], weight: 8 },
    { id: "core.jeweler", parentId: "core.profession-category.artisan", labelKey: "NPCFORGE.Content.Profession.Jeweler", tags: ["artisan", "craft", "wealth"], skillBias: { crafting: "high", society: "average" }, lore: [{ slug: "jewelry-lore", labelKey: "NPCFORGE.Lore.Jewelry", tier: "high" }], equipmentProfileIds: ["core.equipment.blacksmith"], weight: 4 },

    { id: "core.thief", parentId: "core.profession-category.criminal", labelKey: "NPCFORGE.Content.Profession.Thief", tags: ["criminal", "stealth"], skillBias: { thievery: "high", stealth: "high", deception: "average" }, lore: [{ slug: "underworld-lore", labelKey: "NPCFORGE.Lore.Underworld", tier: "average" }], attributeBias: { dex: "high" }, equipmentProfileIds: ["core.equipment.thief"], weight: 8 },
    { id: "core.highwayman", parentId: "core.profession-category.criminal", labelKey: "NPCFORGE.Content.Profession.Highwayman", tags: ["criminal", "robber", "martial"], skillBias: { intimidation: "high", athletics: "average", survival: "average" }, lore: [{ slug: "roads-lore", labelKey: "NPCFORGE.Lore.Roads", tier: "average" }], attributeBias: { str: "high" }, weight: 4 },
    { id: "core.assassin", parentId: "core.profession-category.criminal", labelKey: "NPCFORGE.Content.Profession.Assassin", tags: ["criminal", "assassin", "stealth"], skillBias: { stealth: "high", deception: "high", thievery: "average" }, lore: [{ slug: "underworld-lore", labelKey: "NPCFORGE.Lore.Underworld", tier: "high" }], attributeBias: { dex: "high" }, equipmentProfileIds: ["core.equipment.thief"], weight: 1 },
    { id: "core.smuggler", parentId: "core.profession-category.criminal", labelKey: "NPCFORGE.Content.Profession.Smuggler", tags: ["criminal", "social", "maritime"], skillBias: { deception: "high", society: "average", stealth: "average" }, lore: [{ slug: "underworld-lore", labelKey: "NPCFORGE.Lore.Underworld", tier: "average" }], weight: 4 },

    { id: "core.soldier", parentId: "core.profession-category.military", labelKey: "NPCFORGE.Content.Profession.Soldier", tags: ["military", "martial"], skillBias: { athletics: "high", intimidation: "average" }, lore: [{ slug: "warfare-lore", labelKey: "NPCFORGE.Lore.Warfare", tier: "average" }], attributeBias: { str: "high", con: "high" }, equipmentProfileIds: ["core.equipment.guard"], weight: 10 },
    { id: "core.officer", parentId: "core.profession-category.military", labelKey: "NPCFORGE.Content.Profession.Officer", tags: ["military", "leader", "social"], skillBias: { diplomacy: "high", intimidation: "high", society: "average" }, lore: [{ slug: "warfare-lore", labelKey: "NPCFORGE.Lore.Warfare", tier: "high" }], equipmentProfileIds: ["core.equipment.guard"], weight: 4 },
    { id: "core.mercenary", parentId: "core.profession-category.military", labelKey: "NPCFORGE.Content.Profession.Mercenary", tags: ["military", "martial", "travel"], skillBias: { athletics: "high", survival: "average", intimidation: "average" }, lore: [{ slug: "warfare-lore", labelKey: "NPCFORGE.Lore.Warfare", tier: "average" }], equipmentProfileIds: ["core.equipment.guard"], weight: 6 },

    { id: "core.priest", parentId: "core.profession-category.religious", labelKey: "NPCFORGE.Content.Profession.Priest", tags: ["religious", "social"], skillBias: { religion: "high", diplomacy: "average" }, lore: [{ slug: "temple-lore", labelKey: "NPCFORGE.Lore.Temple", tier: "average" }], equipmentProfileIds: ["core.equipment.priest"], weight: 8 },
    { id: "core.acolyte", parentId: "core.profession-category.religious", labelKey: "NPCFORGE.Content.Profession.Acolyte", tags: ["religious"], skillBias: { religion: "high", medicine: "average" }, lore: [{ slug: "temple-lore", labelKey: "NPCFORGE.Lore.Temple", tier: "average" }], equipmentProfileIds: ["core.equipment.priest"], weight: 8 },

    { id: "core.scholar", parentId: "core.profession-category.scholarly", labelKey: "NPCFORGE.Content.Profession.Scholar", tags: ["scholarly", "knowledge"], skillBias: { society: "high", arcana: "average", occultism: "average" }, lore: [{ slug: "academia-lore", labelKey: "NPCFORGE.Lore.Academia", tier: "high" }], attributeBias: { int: "high" }, equipmentProfileIds: ["core.equipment.scholar"], weight: 8 },
    { id: "core.librarian", parentId: "core.profession-category.scholarly", labelKey: "NPCFORGE.Content.Profession.Librarian", tags: ["scholarly", "knowledge"], skillBias: { society: "high", occultism: "average" }, lore: [{ slug: "library-lore", labelKey: "NPCFORGE.Lore.Library", tier: "high" }], attributeBias: { int: "high" }, equipmentProfileIds: ["core.equipment.scholar"], weight: 6 },

    { id: "core.merchant", parentId: "core.profession-category.mercantile", labelKey: "NPCFORGE.Content.Profession.Merchant", tags: ["mercantile", "social"], skillBias: { diplomacy: "high", society: "high", deception: "average" }, lore: [{ slug: "mercantile-lore", labelKey: "NPCFORGE.Lore.Mercantile", tier: "high" }], attributeBias: { cha: "high" }, equipmentProfileIds: ["core.equipment.merchant"], weight: 10 },
    { id: "core.innkeeper", parentId: "core.profession-category.mercantile", labelKey: "NPCFORGE.Content.Profession.Innkeeper", tags: ["mercantile", "social"], skillBias: { diplomacy: "high", society: "average" }, lore: [{ slug: "hospitality-lore", labelKey: "NPCFORGE.Lore.Hospitality", tier: "high" }], equipmentProfileIds: ["core.equipment.merchant"], weight: 8 },

    { id: "core.farmer", parentId: "core.profession-category.rural", labelKey: "NPCFORGE.Content.Profession.Farmer", tags: ["rural", "labor"], skillBias: { nature: "high", athletics: "average", survival: "average" }, lore: [{ slug: "farming-lore", labelKey: "NPCFORGE.Lore.Farming", tier: "high" }], attributeBias: { con: "high" }, equipmentProfileIds: ["core.equipment.rural"], weight: 12 },
    { id: "core.hunter", parentId: "core.profession-category.rural", labelKey: "NPCFORGE.Content.Profession.Hunter", tags: ["rural", "wilderness", "martial"], skillBias: { survival: "high", nature: "average", stealth: "average" }, lore: [{ slug: "hunting-lore", labelKey: "NPCFORGE.Lore.Hunting", tier: "high" }], attributeBias: { dex: "high", wis: "high" }, equipmentProfileIds: ["core.equipment.rural"], weight: 7 },

    { id: "core.sailor", parentId: "core.profession-category.maritime", labelKey: "NPCFORGE.Content.Profession.Sailor", tags: ["maritime", "travel"], skillBias: { athletics: "high", survival: "average" }, lore: [{ slug: "sailing-lore", labelKey: "NPCFORGE.Lore.Sailing", tier: "high" }], equipmentProfileIds: ["core.equipment.sailor"], weight: 10 },
    { id: "core.captain", parentId: "core.profession-category.maritime", labelKey: "NPCFORGE.Content.Profession.Captain", tags: ["maritime", "leader", "social"], skillBias: { diplomacy: "high", intimidation: "average", survival: "average" }, lore: [{ slug: "sailing-lore", labelKey: "NPCFORGE.Lore.Sailing", tier: "high" }], equipmentProfileIds: ["core.equipment.sailor"], weight: 3 },

    { id: "core.healer", parentId: "core.profession-category.medical", labelKey: "NPCFORGE.Content.Profession.Healer", tags: ["medical", "support"], skillBias: { medicine: "high", nature: "average" }, lore: [{ slug: "medicine-lore", labelKey: "NPCFORGE.Lore.Medicine", tier: "high" }], attributeBias: { wis: "high" }, equipmentProfileIds: ["core.equipment.healer"], weight: 10 },
    { id: "core.apothecary", parentId: "core.profession-category.medical", labelKey: "NPCFORGE.Content.Profession.Apothecary", tags: ["medical", "craft"], skillBias: { crafting: "high", medicine: "high", nature: "average" }, lore: [{ slug: "apothecary-lore", labelKey: "NPCFORGE.Lore.Apothecary", tier: "high" }], attributeBias: { int: "high" }, equipmentProfileIds: ["core.equipment.healer"], weight: 6 },

    { id: "core.musician", parentId: "core.profession-category.entertainment", labelKey: "NPCFORGE.Content.Profession.Musician", tags: ["entertainment", "social"], skillBias: { performance: "high", diplomacy: "average" }, lore: [{ slug: "music-lore", labelKey: "NPCFORGE.Lore.Music", tier: "high" }], attributeBias: { cha: "high" }, equipmentProfileIds: ["core.equipment.entertainer"], weight: 10 },
    { id: "core.actor", parentId: "core.profession-category.entertainment", labelKey: "NPCFORGE.Content.Profession.Actor", tags: ["entertainment", "social"], skillBias: { performance: "high", deception: "average", diplomacy: "average" }, lore: [{ slug: "theater-lore", labelKey: "NPCFORGE.Lore.Theater", tier: "high" }], attributeBias: { cha: "high" }, weight: 7 }
  ];
  for (const profession of professions) registry.register("professions", source, profession);

  const professionSpecializations = [
    { id: "core.thief.pickpocket", parentId: "core.thief", labelKey: "NPCFORGE.Content.ProfessionSpecialization.Pickpocket", skillBias: { thievery: "high", stealth: "average" }, weight: 6 },
    { id: "core.thief.burglar", parentId: "core.thief", labelKey: "NPCFORGE.Content.ProfessionSpecialization.Burglar", skillBias: { thievery: "high", athletics: "average" }, weight: 5 },
    { id: "core.blacksmith.weaponsmith", parentId: "core.blacksmith", labelKey: "NPCFORGE.Content.ProfessionSpecialization.Weaponsmith", weight: 5 },
    { id: "core.blacksmith.armorsmith", parentId: "core.blacksmith", labelKey: "NPCFORGE.Content.ProfessionSpecialization.Armorsmith", weight: 5 },
    { id: "core.soldier.infantry", parentId: "core.soldier", labelKey: "NPCFORGE.Content.ProfessionSpecialization.Infantry", weight: 7 },
    { id: "core.soldier.archer", parentId: "core.soldier", labelKey: "NPCFORGE.Content.ProfessionSpecialization.Archer", attributeBias: { dex: "high" }, weight: 4 }
  ];
  for (const specialization of professionSpecializations) registry.register("professionSpecializations", source, specialization);

  registry.register("roles", source, { id: "core.veteran", labelKey: "NPCFORGE.Content.Role.Veteran", statAdjustments: { perception: 1, fortitude: 1 }, skillModifierAdjustment: 1, weight: 5 });
  registry.register("roles", source, { id: "core.ordinary", labelKey: "NPCFORGE.Content.Role.Ordinary", weight: 10 });

  const speakingFamilies = {
    human: [
      { id:"ashwood", labelKey:"NPCFORGE.Names.Family.Ashwood", fallback:"Ashwood" },
      { id:"brightwater", labelKey:"NPCFORGE.Names.Family.Brightwater", fallback:"Brightwater" },
      { id:"stonebridge", labelKey:"NPCFORGE.Names.Family.Stonebridge", fallback:"Stonebridge" },
      { id:"reed", labelKey:"NPCFORGE.Names.Family.Reed", fallback:"Reed" }
    ],
    dwarf: [
      { id:"ironhand", labelKey:"NPCFORGE.Names.Family.Ironhand", fallback:"Ironhand" },
      { id:"stonehelm", labelKey:"NPCFORGE.Names.Family.Stonehelm", fallback:"Stonehelm" },
      { id:"deepdelver", labelKey:"NPCFORGE.Names.Family.Deepdelver", fallback:"Deepdelver" },
      { id:"forgeheart", labelKey:"NPCFORGE.Names.Family.Forgeheart", fallback:"Forgeheart" }
    ],
    halfling: [
      { id:"bramblefoot", labelKey:"NPCFORGE.Names.Family.Bramblefoot", fallback:"Bramblefoot" },
      { id:"greenbottle", labelKey:"NPCFORGE.Names.Family.Greenbottle", fallback:"Greenbottle" },
      { id:"goodbarrel", labelKey:"NPCFORGE.Names.Family.Goodbarrel", fallback:"Goodbarrel" }
    ],
    gnome: [
      { id:"copperbutton", labelKey:"NPCFORGE.Names.Family.Copperbutton", fallback:"Copperbutton" },
      { id:"quickgear", labelKey:"NPCFORGE.Names.Family.Quickgear", fallback:"Quickgear" }
    ]
  };

  const namePacks = [
    { id:"core.generic-human", labelKey:"NPCFORGE.NamePacks.Human", ancestryIds:["core.human"], supportedLocales:["en","de"], given:{ female:["Mira","Lysa","Elena","Sera"], male:["Alden","Tarin","Bren","Daren"], neutral:["Ryn","Vale"] }, family:speakingFamilies.human },
    { id:"core.generic-elf", labelKey:"NPCFORGE.NamePacks.Elf", ancestryIds:["core.elf"], supportedLocales:["en","de"], given:{ female:["Lethira","Syla","Nimriel"], male:["Aelar","Thalan","Vaelis"], neutral:["Ilyra"] }, family:["Aelion","Caladrel","Ilyren"] },
    { id:"core.generic-gnome", labelKey:"NPCFORGE.NamePacks.Gnome", ancestryIds:["core.gnome"], supportedLocales:["en","de"], given:{ female:["Nissa","Tivvi","Zanna"], male:["Pim","Orlo","Nib"], neutral:["Tilli"] }, family:speakingFamilies.gnome },
    { id:"core.generic-goblin", labelKey:"NPCFORGE.NamePacks.Goblin", ancestryIds:["core.goblin"], supportedLocales:["en","de"], given:{ female:["Rikka","Ketta","Zibbi"], male:["Mog","Brix","Zik"], neutral:["Nib","Scrap"] }, family:[] },
    { id:"core.generic-halfling", labelKey:"NPCFORGE.NamePacks.Halfling", ancestryIds:["core.halfling"], supportedLocales:["en","de"], given:{ female:["Tessa","Lina","Miri"], male:["Milo","Perrin","Corin"], neutral:["Pip"] }, family:speakingFamilies.halfling },
    { id:"core.generic-leshy", labelKey:"NPCFORGE.NamePacks.Leshy", ancestryIds:["core.leshy"], supportedLocales:["en","de"], given:{ neutral:["Briar","Moss","Pip","Reed","Thistle"] }, family:[] },
    { id:"core.generic-orc", labelKey:"NPCFORGE.NamePacks.Orc", ancestryIds:["core.orc"], supportedLocales:["en","de"], given:{ female:["Morga","Vesha","Rakka"], male:["Ghar","Rask","Drok"], neutral:["Kesh"] }, family:[] },
    { id:"core.generic-dwarf", labelKey:"NPCFORGE.NamePacks.Dwarf", ancestryIds:["core.dwarf"], supportedLocales:["en","de"], given:{ female:["Dagna","Runa","Hilda"], male:["Hargun","Borin","Keld"], neutral:["Dori"] }, family:speakingFamilies.dwarf },
    { id:"core.generic-catfolk", labelKey:"NPCFORGE.NamePacks.Catfolk", ancestryIds:["core.catfolk"], supportedLocales:["en","de"], given:{ female:["Sahri","Rasha","Nim"], male:["Meris","Tavi","Kesh"], neutral:["Miraal"] }, family:["Kesh","Miraal","Sahm"] },
    { id:"core.generic-hobgoblin", labelKey:"NPCFORGE.NamePacks.Hobgoblin", ancestryIds:["core.hobgoblin"], supportedLocales:["en","de"], given:{ female:["Varka","Kassa","Torga"], male:["Dren","Mek","Vorg"], neutral:["Kren"] }, family:[] },
    { id:"core.generic-lizardfolk", labelKey:"NPCFORGE.NamePacks.Lizardfolk", ancestryIds:["core.lizardfolk"], supportedLocales:["en","de"], given:{ female:["Sseska","Vess","Tassa"], male:["Irrek","Tassk","Korr"], neutral:["Sirr"] }, family:[] },
    { id:"core.generic-kholo", labelKey:"NPCFORGE.NamePacks.Kholo", ancestryIds:["core.kholo"], supportedLocales:["en","de"], given:{ female:["Mava","Zuri","Rokha"], male:["Aru","Kesh","Varr"], neutral:["Naru"] }, family:[] },
    { id:"core.generic-kobold", labelKey:"NPCFORGE.NamePacks.Kobold", ancestryIds:["core.kobold"], supportedLocales:["en","de"], given:{ female:["Tikka","Suri","Vexa"], male:["Krix","Vek","Zik"], neutral:["Rik"] }, family:[] },
    { id:"core.generic-tengu", labelKey:"NPCFORGE.NamePacks.Tengu", ancestryIds:["core.tengu"], supportedLocales:["en","de"], given:{ female:["Miya","Sora","Aki"], male:["Kuro","Raku","Teki"], neutral:["Haru"] }, family:["Aki","Haru","Yori"] },
    { id:"core.generic-tripkee", labelKey:"NPCFORGE.NamePacks.Tripkee", ancestryIds:["core.tripkee"], supportedLocales:["en","de"], given:{ female:["Kiri","Rilli","Pli"], male:["Plo","Tup","Bok"], neutral:["Kip"] }, family:[] },
    { id:"core.generic-ratfolk", labelKey:"NPCFORGE.NamePacks.Ratfolk", ancestryIds:["core.ratfolk"], supportedLocales:["en","de"], given:{ female:["Nikka","Vessa","Rizzi"], male:["Rizz","Skit","Tekk"], neutral:["Tavi"] }, family:["Nim","Rik","Tekk"] }
  ];
  for (const pack of namePacks) registry.register("namePacks", source, { ...pack, weight: 10 });

  registry.register("personalityPacks", source, {
    id: "core.personality.general",
    labelKey: "NPCFORGE.Personality.Packs.General",
    weight: 10,
    traits: [
      { id:"core.personality.demeanor.reserved", category:"demeanor", labelKey:"NPCFORGE.Personality.Traits.Reserved.Name", descriptionKey:"NPCFORGE.Personality.Traits.Reserved.Description", weight:9, preferredTags:["scholar","knowledge"] },
      { id:"core.personality.demeanor.warm", category:"demeanor", labelKey:"NPCFORGE.Personality.Traits.Warm.Name", descriptionKey:"NPCFORGE.Personality.Traits.Warm.Description", weight:8, preferredTags:["support","medical","social"] },
      { id:"core.personality.demeanor.stern", category:"demeanor", labelKey:"NPCFORGE.Personality.Traits.Stern.Name", descriptionKey:"NPCFORGE.Personality.Traits.Stern.Description", weight:8, preferredTags:["military","martial","leader"] },
      { id:"core.personality.demeanor.alert", category:"demeanor", labelKey:"NPCFORGE.Personality.Traits.Alert.Name", descriptionKey:"NPCFORGE.Personality.Traits.Alert.Description", weight:7, preferredTags:["criminal","wilderness","military"] },
      { id:"core.personality.demeanor.cheerful", category:"demeanor", labelKey:"NPCFORGE.Personality.Traits.Cheerful.Name", descriptionKey:"NPCFORGE.Personality.Traits.Cheerful.Description", weight:6, preferredTags:["entertainment","social"] },
      { id:"core.personality.demeanor.weary", category:"demeanor", labelKey:"NPCFORGE.Personality.Traits.Weary.Name", descriptionKey:"NPCFORGE.Personality.Traits.Weary.Description", weight:5, preferredTags:["labor","veteran","maritime"] },

      { id:"core.personality.trait.practical", category:"trait", labelKey:"NPCFORGE.Personality.Traits.Practical.Name", descriptionKey:"NPCFORGE.Personality.Traits.Practical.Description", weight:9, preferredTags:["artisan","labor","medical"] },
      { id:"core.personality.trait.loyal", category:"trait", labelKey:"NPCFORGE.Personality.Traits.Loyal.Name", descriptionKey:"NPCFORGE.Personality.Traits.Loyal.Description", weight:8, preferredTags:["military","support"] },
      { id:"core.personality.trait.curious", category:"trait", labelKey:"NPCFORGE.Personality.Traits.Curious.Name", descriptionKey:"NPCFORGE.Personality.Traits.Curious.Description", weight:8, preferredTags:["scholar","knowledge","arcane"] },
      { id:"core.personality.trait.patient", category:"trait", labelKey:"NPCFORGE.Personality.Traits.Patient.Name", descriptionKey:"NPCFORGE.Personality.Traits.Patient.Description", weight:7, preferredTags:["artisan","medical","scholar"] },
      { id:"core.personality.trait.ambitious", category:"trait", labelKey:"NPCFORGE.Personality.Traits.Ambitious.Name", descriptionKey:"NPCFORGE.Personality.Traits.Ambitious.Description", weight:6, preferredTags:["leader","social","criminal"] },
      { id:"core.personality.trait.generous", category:"trait", labelKey:"NPCFORGE.Personality.Traits.Generous.Name", descriptionKey:"NPCFORGE.Personality.Traits.Generous.Description", weight:6, preferredTags:["support","religious","social"] },
      { id:"core.personality.trait.suspicious", category:"trait", labelKey:"NPCFORGE.Personality.Traits.Suspicious.Name", descriptionKey:"NPCFORGE.Personality.Traits.Suspicious.Description", weight:6, preferredTags:["criminal","military","wilderness"] },
      { id:"core.personality.trait.disciplined", category:"trait", labelKey:"NPCFORGE.Personality.Traits.Disciplined.Name", descriptionKey:"NPCFORGE.Personality.Traits.Disciplined.Description", weight:7, preferredTags:["military","martial","monk"] },
      { id:"core.personality.trait.witty", category:"trait", labelKey:"NPCFORGE.Personality.Traits.Witty.Name", descriptionKey:"NPCFORGE.Personality.Traits.Witty.Description", weight:5, preferredTags:["entertainment","social","finesse"] },
      { id:"core.personality.trait.compassionate", category:"trait", labelKey:"NPCFORGE.Personality.Traits.Compassionate.Name", descriptionKey:"NPCFORGE.Personality.Traits.Compassionate.Description", weight:7, preferredTags:["medical","support","divine"] },
      { id:"core.personality.trait.stubborn", category:"trait", labelKey:"NPCFORGE.Personality.Traits.Stubborn.Name", descriptionKey:"NPCFORGE.Personality.Traits.Stubborn.Description", weight:6, preferredTags:["labor","martial"] },
      { id:"core.personality.trait.meticulous", category:"trait", labelKey:"NPCFORGE.Personality.Traits.Meticulous.Name", descriptionKey:"NPCFORGE.Personality.Traits.Meticulous.Description", weight:6, preferredTags:["craft","scholar","investigator"] },

      { id:"core.personality.motivation.family", category:"motivation", labelKey:"NPCFORGE.Personality.Traits.Family.Name", descriptionKey:"NPCFORGE.Personality.Traits.Family.Description", weight:10 },
      { id:"core.personality.motivation.duty", category:"motivation", labelKey:"NPCFORGE.Personality.Traits.Duty.Name", descriptionKey:"NPCFORGE.Personality.Traits.Duty.Description", weight:8, preferredTags:["military","religious","leader"] },
      { id:"core.personality.motivation.wealth", category:"motivation", labelKey:"NPCFORGE.Personality.Traits.Wealth.Name", descriptionKey:"NPCFORGE.Personality.Traits.Wealth.Description", weight:7, preferredTags:["trade","criminal"] },
      { id:"core.personality.motivation.knowledge", category:"motivation", labelKey:"NPCFORGE.Personality.Traits.Knowledge.Name", descriptionKey:"NPCFORGE.Personality.Traits.Knowledge.Description", weight:7, preferredTags:["scholar","knowledge","arcane"] },
      { id:"core.personality.motivation.recognition", category:"motivation", labelKey:"NPCFORGE.Personality.Traits.Recognition.Name", descriptionKey:"NPCFORGE.Personality.Traits.Recognition.Description", weight:5, preferredTags:["entertainment","leader","social"] },
      { id:"core.personality.motivation.faith", category:"motivation", labelKey:"NPCFORGE.Personality.Traits.Faith.Name", descriptionKey:"NPCFORGE.Personality.Traits.Faith.Description", weight:6, preferredTags:["divine","religious"] },
      { id:"core.personality.motivation.freedom", category:"motivation", labelKey:"NPCFORGE.Personality.Traits.Freedom.Name", descriptionKey:"NPCFORGE.Personality.Traits.Freedom.Description", weight:5, preferredTags:["criminal","maritime","wilderness"] },
      { id:"core.personality.motivation.redemption", category:"motivation", labelKey:"NPCFORGE.Personality.Traits.Redemption.Name", descriptionKey:"NPCFORGE.Personality.Traits.Redemption.Description", weight:3, preferredTags:["criminal","veteran"] },

      { id:"core.personality.flaw.pride", category:"flaw", labelKey:"NPCFORGE.Personality.Traits.Pride.Name", descriptionKey:"NPCFORGE.Personality.Traits.Pride.Description", weight:7, preferredTags:["leader","martial","artisan"] },
      { id:"core.personality.flaw.impatient", category:"flaw", labelKey:"NPCFORGE.Personality.Traits.Impatient.Name", descriptionKey:"NPCFORGE.Personality.Traits.Impatient.Description", weight:7, preferredTags:["mobile","rage"] },
      { id:"core.personality.flaw.greedy", category:"flaw", labelKey:"NPCFORGE.Personality.Traits.Greedy.Name", descriptionKey:"NPCFORGE.Personality.Traits.Greedy.Description", weight:5, preferredTags:["trade","criminal"] },
      { id:"core.personality.flaw.gullible", category:"flaw", labelKey:"NPCFORGE.Personality.Traits.Gullible.Name", descriptionKey:"NPCFORGE.Personality.Traits.Gullible.Description", weight:4, avoidsTags:["criminal","investigator"] },
      { id:"core.personality.flaw.cowardly", category:"flaw", labelKey:"NPCFORGE.Personality.Traits.Cowardly.Name", descriptionKey:"NPCFORGE.Personality.Traits.Cowardly.Description", weight:3, avoidsTags:["martial","military"] },
      { id:"core.personality.flaw.vindictive", category:"flaw", labelKey:"NPCFORGE.Personality.Traits.Vindictive.Name", descriptionKey:"NPCFORGE.Personality.Traits.Vindictive.Description", weight:4, preferredTags:["criminal","martial"] },
      { id:"core.personality.flaw.rigid", category:"flaw", labelKey:"NPCFORGE.Personality.Traits.Rigid.Name", descriptionKey:"NPCFORGE.Personality.Traits.Rigid.Description", weight:6, preferredTags:["military","religious","scholar"] },
      { id:"core.personality.flaw.reckless", category:"flaw", labelKey:"NPCFORGE.Personality.Traits.Reckless.Name", descriptionKey:"NPCFORGE.Personality.Traits.Reckless.Description", weight:5, preferredTags:["rage","maritime","criminal"] },

      { id:"core.personality.quirk.proverbs", category:"quirk", labelKey:"NPCFORGE.Personality.Traits.Proverbs.Name", descriptionKey:"NPCFORGE.Personality.Traits.Proverbs.Description", weight:6 },
      { id:"core.personality.quirk.coin", category:"quirk", labelKey:"NPCFORGE.Personality.Traits.Coin.Name", descriptionKey:"NPCFORGE.Personality.Traits.Coin.Description", weight:4, preferredTags:["trade","criminal"] },
      { id:"core.personality.quirk.hands", category:"quirk", labelKey:"NPCFORGE.Personality.Traits.BusyHands.Name", descriptionKey:"NPCFORGE.Personality.Traits.BusyHands.Description", weight:6, preferredTags:["artisan","craft"] },
      { id:"core.personality.quirk.notes", category:"quirk", labelKey:"NPCFORGE.Personality.Traits.Notes.Name", descriptionKey:"NPCFORGE.Personality.Traits.Notes.Description", weight:5, preferredTags:["scholar","investigator"] },
      { id:"core.personality.quirk.eyecontact", category:"quirk", labelKey:"NPCFORGE.Personality.Traits.EyeContact.Name", descriptionKey:"NPCFORGE.Personality.Traits.EyeContact.Description", weight:5, preferredTags:["criminal","reserved"] },
      { id:"core.personality.quirk.animals", category:"quirk", labelKey:"NPCFORGE.Personality.Traits.Animals.Name", descriptionKey:"NPCFORGE.Personality.Traits.Animals.Description", weight:5, preferredTags:["wilderness","rural"] },
      { id:"core.personality.quirk.cleaning", category:"quirk", labelKey:"NPCFORGE.Personality.Traits.Cleaning.Name", descriptionKey:"NPCFORGE.Personality.Traits.Cleaning.Description", weight:4, preferredTags:["medical","meticulous"] },
      { id:"core.personality.quirk.humming", category:"quirk", labelKey:"NPCFORGE.Personality.Traits.Humming.Name", descriptionKey:"NPCFORGE.Personality.Traits.Humming.Description", weight:4, preferredTags:["entertainment"] },

      { id:"core.personality.secret.debt", category:"secret", labelKey:"NPCFORGE.Personality.Traits.Debt.Name", descriptionKey:"NPCFORGE.Personality.Traits.Debt.Description", weight:8, preferredTags:["trade","criminal"] },
      { id:"core.personality.secret.crime", category:"secret", labelKey:"NPCFORGE.Personality.Traits.HiddenCrime.Name", descriptionKey:"NPCFORGE.Personality.Traits.HiddenCrime.Description", weight:5, preferredTags:["criminal"] },
      { id:"core.personality.secret.informant", category:"secret", labelKey:"NPCFORGE.Personality.Traits.Informant.Name", descriptionKey:"NPCFORGE.Personality.Traits.Informant.Description", weight:4, preferredTags:["criminal","military","social"] },
      { id:"core.personality.secret.forbidden-love", category:"secret", labelKey:"NPCFORGE.Personality.Traits.ForbiddenLove.Name", descriptionKey:"NPCFORGE.Personality.Traits.ForbiddenLove.Description", weight:5 },
      { id:"core.personality.secret.false-identity", category:"secret", labelKey:"NPCFORGE.Personality.Traits.FalseIdentity.Name", descriptionKey:"NPCFORGE.Personality.Traits.FalseIdentity.Description", weight:3, preferredTags:["criminal","social"] },
      { id:"core.personality.secret.failure", category:"secret", labelKey:"NPCFORGE.Personality.Traits.HiddenFailure.Name", descriptionKey:"NPCFORGE.Personality.Traits.HiddenFailure.Description", weight:6, preferredTags:["veteran","leader","artisan"] },
      { id:"core.personality.secret.heresy", category:"secret", labelKey:"NPCFORGE.Personality.Traits.Heresy.Name", descriptionKey:"NPCFORGE.Personality.Traits.Heresy.Description", weight:3, preferredTags:["religious","divine"] },
      { id:"core.personality.secret.stolen-item", category:"secret", labelKey:"NPCFORGE.Personality.Traits.StolenItem.Name", descriptionKey:"NPCFORGE.Personality.Traits.StolenItem.Description", weight:4, preferredTags:["criminal","trade"] }
    ]
  });

  registry.register("appearancePacks", source, {
    id: "core.appearance.general",
    labelKey: "NPCFORGE.Appearance.Packs.General",
    weight: 10,
    traits: [
      { id:"core.appearance.build.slight", category:"build", labelKey:"NPCFORGE.Appearance.Traits.Slight", weight:7, preferredTags:["finesse","agile","spellcaster"] },
      { id:"core.appearance.build.lean", category:"build", labelKey:"NPCFORGE.Appearance.Traits.Lean", weight:9, preferredTags:["wilderness","maritime","mobile"] },
      { id:"core.appearance.build.average", category:"build", labelKey:"NPCFORGE.Appearance.Traits.AverageBuild", weight:14 },
      { id:"core.appearance.build.sturdy", category:"build", labelKey:"NPCFORGE.Appearance.Traits.Sturdy", weight:9, preferredTags:["labor","artisan","martial"] },
      { id:"core.appearance.build.muscular", category:"build", labelKey:"NPCFORGE.Appearance.Traits.Muscular", weight:5, preferredTags:["martial","labor","rage"] },
      { id:"core.appearance.build.heavyset", category:"build", labelKey:"NPCFORGE.Appearance.Traits.Heavyset", weight:5, excludesTags:["mobile"] },
      { id:"core.appearance.build.gaunt", category:"build", labelKey:"NPCFORGE.Appearance.Traits.Gaunt", weight:4, preferredTags:["scholar","occult"] },

      { id:"core.appearance.face.bushy-brows", category:"facial", labelKey:"NPCFORGE.Appearance.Traits.BushyBrows", weight:7 },
      { id:"core.appearance.face.deep-set-eyes", category:"facial", labelKey:"NPCFORGE.Appearance.Traits.DeepSetEyes", weight:7 },
      { id:"core.appearance.face.drooping-mouth", category:"facial", labelKey:"NPCFORGE.Appearance.Traits.DroopingMouth", weight:5 },
      { id:"core.appearance.face.high-cheekbones", category:"facial", labelKey:"NPCFORGE.Appearance.Traits.HighCheekbones", weight:6 },
      { id:"core.appearance.face.broken-nose", category:"facial", labelKey:"NPCFORGE.Appearance.Traits.BrokenNose", weight:3, preferredTags:["martial","criminal"] },
      { id:"core.appearance.face.missing-tooth", category:"facial", labelKey:"NPCFORGE.Appearance.Traits.MissingTooth", weight:3, preferredTags:["criminal","maritime","martial"] },
      { id:"core.appearance.face.warm-eyes", category:"facial", labelKey:"NPCFORGE.Appearance.Traits.WarmEyes", weight:7, preferredTags:["support","medical","social"] },
      { id:"core.appearance.face.stern-gaze", category:"facial", labelKey:"NPCFORGE.Appearance.Traits.SternGaze", weight:7, preferredTags:["military","martial","leader"] },

      { id:"core.appearance.complexion.freckled", category:"complexion", labelKey:"NPCFORGE.Appearance.Traits.Freckled", weight:6, excludeAncestryIds:["core.leshy"] },
      { id:"core.appearance.complexion.weathered", category:"complexion", labelKey:"NPCFORGE.Appearance.Traits.Weathered", weight:7, preferredTags:["rural","wilderness","maritime"] },
      { id:"core.appearance.complexion.pale", category:"complexion", labelKey:"NPCFORGE.Appearance.Traits.Pale", weight:5, excludeAncestryIds:["core.leshy"] },
      { id:"core.appearance.complexion.ruddy", category:"complexion", labelKey:"NPCFORGE.Appearance.Traits.Ruddy", weight:5, preferredTags:["labor","maritime"], excludeAncestryIds:["core.leshy"] },

      { id:"core.appearance.age.forehead-lines", category:"age", labelKey:"NPCFORGE.Appearance.Traits.ForeheadLines", weight:9, ageCategories:["middleAged","elder"] },
      { id:"core.appearance.age.laugh-lines", category:"age", labelKey:"NPCFORGE.Appearance.Traits.LaughLines", weight:8, ageCategories:["adult","middleAged","elder"] },
      { id:"core.appearance.age.greying-hair", category:"age", labelKey:"NPCFORGE.Appearance.Traits.GreyingHair", weight:8, ageCategories:["middleAged","elder"], excludeAncestryIds:["core.leshy"] },
      { id:"core.appearance.age.tired-eyes", category:"age", labelKey:"NPCFORGE.Appearance.Traits.TiredEyes", weight:7, ageCategories:["adult","middleAged","elder"] },

      { id:"core.appearance.scar.brow", category:"scar", labelKey:"NPCFORGE.Appearance.Traits.ScarBrow", weight:4, preferredTags:["martial","criminal","military"] },
      { id:"core.appearance.scar.cheek", category:"scar", labelKey:"NPCFORGE.Appearance.Traits.ScarCheek", weight:4, preferredTags:["martial","criminal","maritime"] },
      { id:"core.appearance.scar.burn-hand", category:"scar", labelKey:"NPCFORGE.Appearance.Traits.BurnScarHand", weight:2, preferredTags:["artisan","craft","alchemical"] },

      { id:"core.appearance.hands.calloused", category:"hands", labelKey:"NPCFORGE.Appearance.Traits.CallousedHands", weight:7, preferredTags:["labor","artisan","rural","maritime"] },
      { id:"core.appearance.hands.soot-stained", category:"hands", labelKey:"NPCFORGE.Appearance.Traits.SootStainedHands", weight:2, requiresTags:["artisan"] },
      { id:"core.appearance.hands.ink-stained", category:"hands", labelKey:"NPCFORGE.Appearance.Traits.InkStainedFingers", weight:3, preferredTags:["scholar","knowledge"] },
      { id:"core.appearance.hands.well-kept", category:"hands", labelKey:"NPCFORGE.Appearance.Traits.WellKeptHands", weight:5, preferredTags:["social","leader","entertainment"] },

      { id:"core.appearance.posture.upright", category:"posture", labelKey:"NPCFORGE.Appearance.Traits.UprightPosture", weight:7, preferredTags:["military","leader","martial"] },
      { id:"core.appearance.posture.stooped", category:"posture", labelKey:"NPCFORGE.Appearance.Traits.StoopedPosture", weight:4, ageCategories:["middleAged","elder"] },
      { id:"core.appearance.posture.measured", category:"posture", labelKey:"NPCFORGE.Appearance.Traits.MeasuredMovements", weight:7, preferredTags:["scholar","medical","leader"] },
      { id:"core.appearance.posture.restless", category:"posture", labelKey:"NPCFORGE.Appearance.Traits.RestlessGestures", weight:5, preferredTags:["criminal","entertainment"] },
      { id:"core.appearance.posture.slight-limp", category:"posture", labelKey:"NPCFORGE.Appearance.Traits.SlightLimp", weight:2, preferredTags:["veteran","martial"] }
    ]
  });
}
