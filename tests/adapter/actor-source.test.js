import test from "node:test";
import assert from "node:assert/strict";
import { ContentRegistry } from "../../scripts/engine/content/content-registry.js";
import { registerCoreContent } from "../../scripts/engine/content/core-content.js";
import { NpcEngine } from "../../scripts/engine/npc-engine.js";
import { Pf2eDocumentAdapter } from "../../scripts/adapters/pf2e-document-adapter.js";

test("adapter creates a serializable PF2e NPC actor source with stats, skills, weapon and matching melee entry", () => {
  const registry = new ContentRegistry(); registerCoreContent(registry);
  const npc = new NpcEngine({ registry }).generate({ seed: "adapter", level: 3, profession: "core.guard", role: "core.ordinary" });
  const source = new Pf2eDocumentAdapter().toActorSource(npc);
  assert.equal(source.type, "npc");
  assert.equal(source.system.details.level.value, 3);
  assert.equal(source.system.abilities.str.mod, npc.statistics.attributes.str);
  assert.equal(source.system.attributes.ac.value, npc.statistics.ac);
  assert.equal(source.system.skills.athletics.base, npc.skills.find((skill) => skill.slug === "athletics").modifier);
  assert.match(source.system.details.publicNotes, /Legal Lore/);
  assert.ok(source.items.some((item) => item.type === "weapon" && item.name === "Spear"));
  assert.ok(source.items.some((item) => item.type === "melee" && item.name === "Spear"));
  assert.doesNotThrow(() => JSON.stringify(source));
});

test("adapter localizes generated weapon and melee names for active Foundry locale", () => {
  const previousGame = globalThis.game;
  globalThis.game = { i18n: { localize: (key) => ({
    "NPCFORGE.Weapons.Spear": "Speer",
    "NPCFORGE.Content.Profession.Guard": "Stadtwache",
    "NPCFORGE.Content.ClassProfile.Fighter": "Kämpfer",
    "NPCFORGE.Lore.Legal": "Rechtskunde",
    "NPCFORGE.Fields.Lore": "Kunde"
  })[key] ?? key } };
  try {
    const registry = new ContentRegistry(); registerCoreContent(registry);
    const npc = new NpcEngine({ registry }).generate({ seed: "adapter-de", level: 3, profession: "core.guard", classProfile: "core.fighter", role: "core.ordinary" });
    const source = new Pf2eDocumentAdapter().toActorSource(npc);
    assert.ok(source.items.some((item) => item.type === "weapon" && item.name === "Speer"));
    assert.ok(source.items.some((item) => item.type === "melee" && item.name === "Speer"));
    assert.match(source.system.details.publicNotes, /Stadtwache/);
    assert.match(source.system.details.publicNotes, /Kämpfer/);
  } finally {
    globalThis.game = previousGame;
  }
});

test("async adapter clones regular PF2e compendium weapon and derives the matching strike identity from it", async () => {
  const previousGame = globalThis.game;
  const compendiumWeapon = {
    uuid: "Compendium.pf2e.equipment-srd.Item.spear-test",
    toObject: () => ({
      _id: "spear-test",
      name: "Speer",
      type: "weapon",
      system: {
        slug: "spear",
        category: "simple",
        group: "spear",
        baseItem: "spear",
        level: { value: 0 },
        price: { value: { sp: 1 } },
        damage: { dice: 1, die: "d6", damageType: "piercing" },
        traits: { value: ["thrown-20"], rarity: "common" },
        quantity: 1,
        equipped: { carryType: "held", handsHeld: 1 }
      }
    })
  };
  const index = [{ _id: "spear-test", name: "Speer", type: "weapon", system: { slug: "spear" } }];
  const pack = {
    getIndex: async () => index,
    getDocument: async (id) => id === "spear-test" ? compendiumWeapon : null
  };
  globalThis.game = {
    packs: new Map([["pf2e.equipment-srd", pack]]),
    i18n: { localize: (key) => key }
  };
  try {
    const registry = new ContentRegistry(); registerCoreContent(registry);
    const npc = new NpcEngine({ registry }).generate({ seed: "adapter-compendium", level: 3, profession: "core.guard", classProfile: "core.fighter", role: "core.ordinary" });
    const source = await new Pf2eDocumentAdapter().toActorSourceAsync(npc);
    const weapon = source.items.find((item) => item.type === "weapon");
    const strike = source.items.find((item) => item.type === "melee");
    assert.equal(weapon.name, "Speer");
    assert.equal(weapon.system.price.value.sp, 1);
    assert.equal(weapon.system.group, "spear");
    assert.equal(weapon.flags["pf2e-npc-forge"].compendiumBacked, true);
    assert.equal(weapon.flags["pf2e-npc-forge"].sourceUuid, compendiumWeapon.uuid);
    assert.equal(strike.name, "Speer");
    assert.deepEqual(strike.system.traits.value, ["thrown-20"]);
    assert.equal(strike.system.damageRolls.primary.damageType, "piercing");
    assert.equal(strike.system.damageRolls.primary.damage, npc.attacks[0].damage.formula, "NPC scaling remains engine-owned");
    assert.equal(source.flags["pf2e-npc-forge"].compendiumEquipment, true);
  } finally {
    globalThis.game = previousGame;
  }
});

test("async adapter gracefully falls back when the PF2e equipment compendium is unavailable", async () => {
  const previousGame = globalThis.game;
  globalThis.game = { packs: new Map(), i18n: { localize: (key) => key } };
  try {
    const registry = new ContentRegistry(); registerCoreContent(registry);
    const npc = new NpcEngine({ registry }).generate({ seed: "adapter-fallback", level: 3, profession: "core.guard", classProfile: "core.fighter", role: "core.ordinary" });
    const source = await new Pf2eDocumentAdapter().toActorSourceAsync(npc);
    const weapon = source.items.find((item) => item.type === "weapon");
    assert.equal(weapon.type, "weapon");
    assert.equal(weapon.flags["pf2e-npc-forge"].generated, true);
    assert.notEqual(weapon.flags["pf2e-npc-forge"].compendiumBacked, true);
  } finally {
    globalThis.game = previousGame;
  }
});
