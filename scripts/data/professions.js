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

    abilities: [
      {
        name: "Funkenflug",
        actions: 1,
        traits: ["manipulate"],
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

    abilities: [
      {
        name: "Dunkles Murmeln",
        actions: 2,
        traits: ["auditory", "concentrate", "mental"],
        text: "Eine Kreatur innerhalb von 9 m muss einen Willenswurf gegen SG {dc} ablegen. Bei einem Fehlschlag ist sie bis zum Beginn des nächsten Zuges des Kultisten verängstigt 1."
      }
    ]
  }
};
