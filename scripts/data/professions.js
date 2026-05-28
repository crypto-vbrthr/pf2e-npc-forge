export const PROFESSIONS = {
  blacksmith: {
    label: "Schmied",

    skills: ["crafting", "athletics"],
    lore: "Schmiedekunst",

    weapon: {
      name: "Schmiedehammer",
      category: "martial",
      group: "hammer",
      damageDie: "d8",
      damageType: "bludgeoning",
      traits: ["shove"]
    },

    abilities: [
      {
        name: "Funkenflug",
        actions: 1,
        category: "offensive",
        traits: ["fire"],
        text: "Der Schmied schleudert glühende Funken. Eine Kreatur innerhalb von 3 m muss einen Reflexwurf gegen SG {dc} ablegen oder erleidet {level} Feuerschaden."
      }
    ]
  },

  scholar: {
    label: "Gelehrter",

    skills: ["arcana", "society"],
    lore: "Akademisches Wissen",

    weapon: {
      name: "Dolch",
      category: "simple",
      group: "knife",
      damageDie: "d4",
      damageType: "piercing",
      traits: ["agile", "finesse", "thrown-10"]
    },

    abilities: [
      {
        name: "Belehrender Einwurf",
        actions: 1,
        category: "offensive",
        traits: ["auditory", "mental"],
        text: "Der Gelehrte lenkt ein Ziel mit einem pedantischen Fachkommentar ab.",
      }
    ]
  },

  healer: {
    label: "Heiler",
    skills: ["medicine", "religion"],
    lore: "Heilkunde",

    weapon: {
      name: "Stab",
      category: "simple",
      group: "club",
      damageDie: "d6",
      damageType: "bludgeoning",
      traits: ["two-hand-d8"]
    },

    abilities: [
      {
        name: "Schnelle Behandlung",
        actions: 2,
        category: "defensive",
        traits: ["healing", "manipulate"],
        text: "Der Heiler versorgt eine angrenzende Kreatur. Sie erhält Trefferpunkte in Höhe von {level} + {damageBonus} zurück."
      }
    ]
  }
};
