import test from "node:test";
import assert from "node:assert/strict";
import { presentNpc } from "../../scripts/ui/npc-presentation.js";

const dictionary = {
  "NPCFORGE.Content.Ancestry.Human": "Mensch",
  "NPCFORGE.Content.Profession.Guard": "Stadtwache",
  "NPCFORGE.Content.ClassProfile.Fighter": "Kämpfer",
  "NPCFORGE.Content.Role.Ordinary": "Gewöhnlich",
  "NPCFORGE.Skills.Athletics": "Athletik",
  "NPCFORGE.Lore.Legal": "Rechtskunde",
  "NPCFORGE.Weapons.Spear": "Speer",
  "NPCFORGE.Damage.Piercing": "Stichschaden",
  "NPCFORGE.EquipmentProgression.Potency": "Potenz",
  "NPCFORGE.EquipmentProgression.Striking": "Schlagend"
};
const localize = (key) => dictionary[key] ?? key;

const npc = {
  identity: { name: "Bren Vale", ancestry: { id: "core.human", labelKey: "NPCFORGE.Content.Ancestry.Human" } },
  build: { level: 3, profession: { id: "core.guard", labelKey: "NPCFORGE.Content.Profession.Guard" }, classProfile: { id: "core.fighter", labelKey: "NPCFORGE.Content.ClassProfile.Fighter" }, role: { id: "core.ordinary", labelKey: "NPCFORGE.Content.Role.Ordinary" } },
  statistics: { ac: 19, hp: 45, perception: 9, speed: 25, saves: { fortitude: 12, reflex: 9, will: 6 }, attributes: { str: 4, dex: 3, con: 4, int: 1, wis: 3, cha: 1 } },
  skills: [{ slug: "athletics", modifier: 10 }, { slug: "legal-lore", type: "lore", modifier: 9 }],
  inventory: [{ id: "primary-weapon", name: "Spear", type: "weapon", fundamentalRunes: { potency: 1, striking: 1 } }],
  attacks: [{ sourceWeaponId: "primary-weapon", label: "Spear", modifier: 12, damage: { formula: "1d6+3", type: "piercing" } }]
};

test("presentation localizes semantic ids and PF2e labels", () => {
  const view = presentNpc(npc, localize);
  assert.equal(view.identityLine, "Mensch · Stadtwache · Kämpfer · Gewöhnlich");
  assert.equal(view.skills[0].displayName, "Athletik");
  assert.equal(view.skills[1].displayName, "Rechtskunde");
  assert.equal(view.attacks[0].displayName, "Speer");
  assert.equal(view.attacks[0].displayDamageType, "Stichschaden");
});

test("presentation formats signed modifiers consistently", () => {
  const view = presentNpc(npc, localize);
  assert.equal(view.statistics.perception, "+9");
  assert.equal(view.statistics.attributes.str, "+4");
  assert.equal(view.attacks[0].displayModifier, "+12");
});

test("presentation localizes die notation and exposes localized inventory names", () => {
  const localizedDictionary = { ...dictionary, "NPCFORGE.Notation.DieLetter": "W" };
  const view = presentNpc(npc, (key) => localizedDictionary[key] ?? key);
  assert.equal(view.attacks[0].displayDamage, "1W6+3");
  assert.equal(view.inventory[0].displayName, "Speer");
  assert.equal(view.inventory[0].displayRunes, "Potenz +1 · Schlagend 1");
});


test("presentation localizes the complete PF2e size range", () => {
  const sizeKeys = { tiny: "Winzig", sm: "Klein", med: "Mittel", lg: "Groß", huge: "Riesig", grg: "Gigantisch" };
  for (const [size, expected] of Object.entries(sizeKeys)) {
    const copy = structuredClone(npc);
    copy.identity.size = size;
    const view = presentNpc(copy, (key) => ({
      ...dictionary,
      "NPCFORGE.Sizes.Tiny": "Winzig",
      "NPCFORGE.Sizes.Small": "Klein",
      "NPCFORGE.Sizes.Medium": "Mittel",
      "NPCFORGE.Sizes.Large": "Groß",
      "NPCFORGE.Sizes.Huge": "Riesig",
      "NPCFORGE.Sizes.Gargantuan": "Gigantisch"
    })[key] ?? key);
    assert.equal(view.identity.size, expected);
  }
});
