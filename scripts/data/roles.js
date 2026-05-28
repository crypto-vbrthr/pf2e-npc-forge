export const ROLES = {
  brute: {
    label: "Brute",
    description: "Hohe Trefferpunkte und hoher Schaden, aber schwächere Verteidigung.",

    ac: "low",
    hp: "high",
    attack: "high",
    damage: "high",
    perception: "moderate",

    fortitude: "high",
    reflex: "low",
    will: "low",

    dc: "moderate",
    skill: "moderate",

    abilities: [
      {
        name: "Wuchtiger Angriff",
        actions: 2,
        category: "offensive",
        traits: [],
        text: "Der NSC führt einen schweren Angriff aus. Bei einem Treffer verursacht er zusätzlichen Schaden in Höhe seiner Stufe."
      }
    ]
  },

  guard: {
    label: "Wache",
    description: "Defensiver Frontkämpfer mit guter RK und soliden Rettungswürfen.",

    ac: "high",
    hp: "moderate",
    attack: "moderate",
    damage: "moderate",
    perception: "moderate",

    fortitude: "high",
    reflex: "moderate",
    will: "moderate",

    dc: "moderate",
    skill: "moderate",

    abilities: [
      {
        name: "Verteidigungsstellung",
        actions: 1,
        category: "defensive",
        traits: [],
        text: "Der NSC erhält bis zum Beginn seines nächsten Zuges einen Situationsbonus von +1 auf seine RK."
      }
    ]
  },

  skirmisher: {
    label: "Plänkler",
    description: "Beweglicher Kämpfer mit guter Wahrnehmung und Reflexen.",

    ac: "moderate",
    hp: "moderate",
    attack: "high",
    damage: "moderate",
    perception: "high",

    fortitude: "moderate",
    reflex: "high",
    will: "moderate",

    dc: "moderate",
    skill: "high",

    abilities: [
      {
        name: "Schneller Stellungswechsel",
        actions: 1,
        category: "defensive",
        traits: ["move"],
        text: "Der NSC bewegt sich bis zur halben Bewegungsrate. Diese Bewegung löst keine Reaktionen durch das Ziel seines letzten Angriffs aus."
      }
    ]
  },

  artillery: {
    label: "Artillerie",
    description: "Fernkämpfer mit hohem Angriff und gutem Schaden, aber fragiler Verteidigung.",

    ac: "low",
    hp: "low",
    attack: "high",
    damage: "high",
    perception: "high",

    fortitude: "low",
    reflex: "moderate",
    will: "moderate",

    dc: "moderate",
    skill: "moderate",

    abilities: [
      {
        name: "Gezielter Schuss",
        actions: 2,
        category: "offensive",
        traits: ["concentrate"],
        text: "Der NSC führt einen Fernkampfangriff aus. Bei einem Treffer verursacht der Angriff zusätzlichen Schaden in Höhe von {damageBonus}."
      }
    ]
  },

  controller: {
    label: "Kontrolleur",
    description: "Setzt SG-basierte Effekte, Debuffs und Gelände-Kontrolle ein.",

    ac: "moderate",
    hp: "moderate",
    attack: "moderate",
    damage: "low",
    perception: "moderate",

    fortitude: "low",
    reflex: "moderate",
    will: "high",

    dc: "high",
    skill: "high",

    abilities: [
      {
        name: "Behindernde Taktik",
        actions: 2,
        category: "offensive",
        traits: ["concentrate"],
        text: "Eine Kreatur innerhalb von 9 m muss einen Reflexwurf gegen SG {dc} ablegen. Bei einem Fehlschlag erhält sie bis zum Ende ihres nächsten Zuges -3 m auf ihre Bewegungsraten."
      }
    ]
  },

  caster: {
    label: "Zauberwirker",
    description: "Hohe SGs und magische Optionen, aber schwächere körperliche Werte.",

    ac: "low",
    hp: "low",
    attack: "moderate",
    damage: "low",
    perception: "moderate",

    fortitude: "low",
    reflex: "moderate",
    will: "high",

    dc: "high",
    skill: "high",

    abilities: [
      {
        name: "Einfacher Zauber",
        actions: 2,
        category: "offensive",
        traits: ["concentrate", "manipulate", "magical"],
        text: "Eine Kreatur innerhalb von 18 m muss einen Willenswurf gegen SG {dc} ablegen. Bei einem Fehlschlag erleidet sie mentalen Schaden in Höhe von {level} + {damageBonus}."
      }
    ]
  },

  support: {
    label: "Unterstützer",
    description: "Heilung, Buffs und taktische Hilfe für Verbündete.",

    ac: "moderate",
    hp: "moderate",
    attack: "moderate",
    damage: "low",
    perception: "high",

    fortitude: "moderate",
    reflex: "moderate",
    will: "high",

    dc: "moderate",
    skill: "high",

    abilities: [
      {
        name: "Anfeuernde Hilfe",
        actions: 1,
        category: "defensive",
        traits: ["auditory", "concentrate"],
        text: "Ein Verbündeter innerhalb von 9 m erhält bis zum Beginn des nächsten Zuges des NSC einen Situationsbonus von +1 auf seinen nächsten Angriffswurf oder Rettungswurf."
      }
    ]
  }
};
