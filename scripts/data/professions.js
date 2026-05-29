export const PROFESSIONS = {
  blacksmith: {
    label: "Schmied",
    skills: ["crafting", "athletics"],
    lore: "Schmiedekunst",

    weapon: {
      name: "Schmiedehammer",
      kind: "melee",
      damageDie: "d8",
      damageType: "bludgeoning",
      traits: ["shove"],
      group: "hammer"
    },

    equipment: {
      compendiumItems: [
        { pack: "pf2e.equipment-srd", name: "Repair Toolkit", quantity: 1 }
      ],
      fallbackLoot: [
        { name: "Schmiedewerkzeug", quantity: 1 },
        { name: "Eisenbarren", quantity: 2 }
      ]
    },

    abilities: [
      {
        name: "Funkenflug",
        actions: 1,
        traits: ["manipulate", "fire"],
        text: "Der Schmied schleudert glühende Funken. Eine Kreatur innerhalb von 3 m muss einen Reflexwurf gegen SG {dc} ablegen oder erleidet {level} Feuerschaden."
      }
    ]
  },

  guard: {
    label: "Stadtwache",
    skills: ["athletics", "intimidation"],
    lore: "Wachdienst",

    weapon: {
      name: "Kurzschwert",
      kind: "melee",
      damageDie: "d6",
      damageType: "piercing",
      traits: ["agile", "finesse"],
      group: "sword"
    },

    equipment: {
      compendiumItems: [
        { pack: "pf2e.equipment-srd", name: "Steel Shield", quantity: 1 },
        { pack: "pf2e.equipment-srd", name: "Chain Mail", quantity: 1 }
      ],
      fallbackLoot: [
        { name: "Wachabzeichen", quantity: 1 }
      ]
    },

    abilities: [
      {
        name: "Festsetzen",
        actions: 1,
        traits: ["attack"],
        text: "Die Wache versucht, ein Ziel an der Flucht zu hindern. Lege Athletik mit +{skill} gegen den Reflex-SG des Ziels ab."
      }
    ]
  },

  hunter: {
    label: "Jäger",
    skills: ["survival", "stealth"],
    lore: "Jagd",

    weapon: {
      name: "Kurzbogen",
      kind: "ranged",
      range: 60,
      damageDie: "d6",
      damageType: "piercing",
      traits: [],
      group: "bow"
    },

    equipment: {
      compendiumItems: [
        { pack: "pf2e.equipment-srd", name: "Arrows", quantity: 20 },
        { pack: "pf2e.equipment-srd", name: "Leather Armor", quantity: 1 }
      ],
      fallbackLoot: [
        { name: "Jagdmesser", quantity: 1 },
        { name: "Tierfalle", quantity: 1 }
      ]
    },

    abilities: [
      {
        name: "Beute im Blick",
        actions: 1,
        traits: ["concentrate"],
        text: "Der Jäger markiert eine Kreatur, die er sehen kann. Bis zum Ende seines nächsten Zuges erhält er +1 auf seinen nächsten Angriff gegen dieses Ziel."
      }
    ]
  },

  scholar: {
    label: "Gelehrter",
    skills: ["arcana", "society"],
    lore: "Akademisches Wissen",

    weapon: {
      name: "Dolch",
      kind: "melee",
      damageDie: "d4",
      damageType: "piercing",
      traits: ["agile", "finesse", "thrown-10"],
      group: "knife"
    },

    equipment: {
      compendiumItems: [
        { pack: "pf2e.equipment-srd", name: "Writing Set", quantity: 1 }
      ],
      fallbackLoot: [
        { name: "Notizbuch", quantity: 1 },
        { name: "Akademische Unterlagen", quantity: 1 }
      ]
    },

    abilities: [
      {
        name: "Belehrender Einwurf",
        actions: 1,
        traits: ["auditory", "linguistic", "mental"],
        text: "Der Gelehrte verwirrt ein Ziel mit Fachsprache. Eine Kreatur innerhalb von 9 m muss einen Willenswurf gegen SG {dc} ablegen oder erhält bis zum Beginn des nächsten Zuges des Gelehrten einen Malus von -1 auf Wahrnehmung."
      }
    ]
  },

  healer: {
    label: "Heiler",
    skills: ["medicine", "religion"],
    lore: "Heilkunde",

    weapon: {
      name: "Stab",
      kind: "melee",
      damageDie: "d6",
      damageType: "bludgeoning",
      traits: ["two-hand-d8"],
      group: "club"
    },

    spellcasting: {
      profile: "divine",
      attackName: "Göttliche Flamme",
      damageType: "spirit",

      spells: [
        {
          name: "Heilender Segen",
          actions: 2,
          traits: ["healing"],
          text: "Der Heiler heilt eine Kreatur innerhalb von 9 m um {spellHealing} Trefferpunkte."
        },
        {
          name: "Schützendes Gebet",
          actions: 1,
          traits: [],
          text: "Ein Verbündeter innerhalb von 9 m erhält bis zum Beginn des nächsten Zuges des Heilers +1 auf RK."
        }
      ]
    },

    equipment: {
      compendiumItems: [
        { pack: "pf2e.equipment-srd", name: "Healer's Toolkit", quantity: 1 },
        { pack: "pf2e.equipment-srd", name: "Minor Healing Potion", quantity: 1 }
      ],
      fallbackLoot: [
        { name: "Verbandszeug", quantity: 2 }
      ]
    },

    abilities: [
      {
        name: "Schnelle Behandlung",
        actions: 2,
        traits: ["healing", "manipulate"],
        text: "Der Heiler versorgt eine angrenzende Kreatur. Sie erhält Trefferpunkte in Höhe von {level} + {damageBonus} zurück."
      }
    ]
  },

  cultist: {
    label: "Kultist",
    skills: ["religion", "deception"],
    lore: "Kulte",

    weapon: {
      name: "Krummer Dolch",
      kind: "melee",
      damageDie: "d4",
      damageType: "piercing",
      traits: ["agile", "finesse"],
      group: "knife"
    },

    spellcasting: {
      profile: "occult",
      attackName: "Unheiliges Flüstern",
      damageType: "mental",

      spells: [
        {
          name: "Dunkler Zwang",
          actions: 2,
          traits: ["mental", "auditory"],
          text: "Eine Kreatur innerhalb von 9 m muss einen Willenswurf gegen SG {dc} ablegen. Bei einem Fehlschlag ist sie für 1 Runde benommen 1."
        }
      ]
    },

    equipment: {
      compendiumItems: [
        { pack: "pf2e.equipment-srd", name: "Religious Symbol", quantity: 1 }
      ],
      fallbackLoot: [
        { name: "Unheimliches Amulett", quantity: 1 },
        { name: "Ritualnotizen", quantity: 1 }
      ]
    },

    abilities: [
      {
        name: "Dunkles Murmeln",
        actions: 2,
        traits: ["auditory", "concentrate", "mental"],
        text: "Eine Kreatur innerhalb von 9 m muss einen Willenswurf gegen SG {dc} ablegen. Bei einem Fehlschlag ist sie bis zum Beginn des nächsten Zuges des Kultisten verängstigt 1."
      }
    ]
  },

  mage: {
    label: "Magier",
    skills: ["arcana", "society"],
    lore: "Magietheorie",

    weapon: {
      name: "Stab",
      kind: "melee",
      damageDie: "d6",
      damageType: "bludgeoning",
      traits: ["two-hand-d8"],
      group: "club"
    },

    spellcasting: {
      profile: "arcane",
      attackName: "Arkane Entladung",
      damageType: "force",

      spells: [
        {
          name: "Magisches Geschoss",
          actions: 2,
          traits: ["force"],
          text: "Der Magier schleudert magische Energie auf eine Kreatur innerhalb von 18 m. Zauberangriff +{attack}, Schaden {spellDamage} Kraftschaden."
        },
        {
          name: "Schimmernder Schild",
          actions: 1,
          traits: ["force"],
          text: "Der Magier erhält bis zum Beginn seines nächsten Zuges einen Situationsbonus von +1 auf RK."
        },
        {
          name: "Erschütternde Rune",
          actions: 2,
          traits: ["force"],
          text: "Eine Kreatur innerhalb von 9 m muss einen Reflexwurf gegen SG {dc} ablegen. Bei einem Fehlschlag erleidet sie {spellDamage} Kraftschaden."
        }
      ]
    },

    equipment: {
      compendiumItems: [
        { pack: "pf2e.equipment-srd", name: "Writing Set", quantity: 1 }
      ],
      fallbackLoot: [
        { name: "Zaubernotizen", quantity: 1 },
        { name: "Kreidestaub", quantity: 1 }
      ]
    },

    abilities: []
  },

  druid: {
    label: "Druide",
    skills: ["nature", "survival"],
    lore: "Wildnis",

    weapon: {
      name: "Speer",
      kind: "melee",
      damageDie: "d6",
      damageType: "piercing",
      traits: ["thrown-20"],
      group: "spear"
    },

    spellcasting: {
      profile: "primal",
      attackName: "Dornenstoß",
      damageType: "piercing",

      spells: [
        {
          name: "Rankengriff",
          actions: 2,
          traits: ["plant"],
          text: "Eine Kreatur innerhalb von 9 m muss einen Reflexwurf gegen SG {dc} ablegen. Bei einem Fehlschlag erhält sie bis zum Ende ihres nächsten Zuges -3 m auf ihre Bewegungsraten."
        },
        {
          name: "Lebenshauch",
          actions: 2,
          traits: ["healing", "vitality"],
          text: "Der Druide heilt eine Kreatur innerhalb von 9 m um {spellHealing} Trefferpunkte."
        }
      ]
    },

    equipment: {
      compendiumItems: [
        { pack: "pf2e.equipment-srd", name: "Leather Armor", quantity: 1 }
      ],
      fallbackLoot: [
        { name: "Kräuterbeutel", quantity: 1 }
      ]
    },

    abilities: []
  }
};
