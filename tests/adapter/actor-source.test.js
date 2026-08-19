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

test("async adapter clones profession equipment from the regular PF2e compendium", async () => {
  const previousGame = globalThis.game;
  const docs = {
    spear: { uuid: "Compendium.pf2e.equipment-srd.Item.spear", toObject: () => ({ _id: "spear", name: "Spear", type: "weapon", system: { slug: "spear", damage: { dice: 1, die: "d6", damageType: "piercing" }, traits: { value: ["thrown-20"], rarity: "common" }, quantity: 1 } }) },
    "chain-shirt": { uuid: "Compendium.pf2e.equipment-srd.Item.chain", toObject: () => ({ _id: "chain", name: "Chain Shirt", type: "armor", system: { slug: "chain-shirt", price: { value: { gp: 5 } }, quantity: 1, traits: { value: [], rarity: "common" } } }) },
    "steel-shield": { uuid: "Compendium.pf2e.equipment-srd.Item.shield", toObject: () => ({ _id: "shield", name: "Steel Shield", type: "shield", system: { slug: "steel-shield", price: { value: { gp: 2 } }, quantity: 1, traits: { value: [], rarity: "common" } } }) },
    "hooded-lantern": { uuid: "Compendium.pf2e.equipment-srd.Item.lantern", toObject: () => ({ _id: "lantern", name: "Hooded Lantern", type: "equipment", system: { slug: "hooded-lantern", price: { value: { sp: 7 } }, quantity: 1, traits: { value: [], rarity: "common" } } }) }
  };
  const index = Object.entries(docs).map(([slug, doc]) => ({ _id: slug, name: slug, type: doc.toObject().type, system: { slug } }));
  const pack = { getIndex: async () => index, getDocument: async (id) => docs[id] ?? null };
  globalThis.game = { packs: new Map([["pf2e.equipment-srd", pack]]), i18n: { localize: (key) => key } };
  try {
    const registry = new ContentRegistry(); registerCoreContent(registry);
    const npc = new NpcEngine({ registry }).generate({ seed: "guard-full-kit", level: 3, profession: "core.guard", classProfile: "core.fighter" });
    const source = await new Pf2eDocumentAdapter().toActorSourceAsync(npc);
    assert.ok(source.items.some((item) => item.type === "armor" && item.name === "Chain Shirt"));
    assert.ok(source.items.some((item) => item.type === "shield" && item.name === "Steel Shield"));
    assert.ok(source.items.some((item) => item.type === "equipment" && item.name === "Hooded Lantern"));
  } finally {
    globalThis.game = previousGame;
  }
});


test("adapter materializes ancestry size, traits, languages, senses and identity flags", () => {
  const registry = new ContentRegistry(); registerCoreContent(registry);
  const engine = new NpcEngine({ registry });
  const npc = engine.generate({ seed: "ancestry-adapter", ancestry: "core.goblin", identity: { gender: "male", ageCategory: "adult" } });
  const source = new Pf2eDocumentAdapter().toActorSource(npc);
  assert.equal(source.system.traits.size.value, "sm");
  assert.ok(source.system.traits.value.includes("goblin"));
  assert.ok(source.system.traits.languages.value.includes("goblin"));
  assert.ok(source.system.perception.senses.some((sense) => sense.type === "darkvision"));
  assert.equal(source.flags["pf2e-npc-forge"].gender, "male");
  assert.equal(source.flags["pf2e-npc-forge"].ageCategory, "adult");
});


test("adapter preserves semantic appearance provenance in actor flags", () => {
  const registry = new ContentRegistry(); registerCoreContent(registry);
  const npc = new NpcEngine({ registry }).generate({ seed: "appearance-adapter", appearance: { enabled: true, intensity: "medium" } });
  const source = new Pf2eDocumentAdapter().toActorSource(npc);
  assert.deepEqual(source.flags["pf2e-npc-forge"].appearanceTraitIds, npc.identity.appearance.traits.map((trait) => trait.id));
  assert.match(source.system.details.publicNotes, /Appearance|Erscheinung/);
});

test("adapter writes generated personality to public notes and keeps secrets private", () => {
  const registry = new ContentRegistry(); registerCoreContent(registry);
  const npc = new NpcEngine({ registry }).generate({ seed: "personality-adapter", personality: { enabled: true, allowSecrets: true } });
  const source = new Pf2eDocumentAdapter().toActorSource(npc);
  assert.ok(source.flags["pf2e-npc-forge"].personality.demeanorId);
  assert.deepEqual(source.flags["pf2e-npc-forge"].personality.traitIds, npc.personality.traits.map((trait) => trait.id));
  assert.match(source.system.details.publicNotes, /Personality|Persönlichkeit|NPCFORGE\.Sections\.Personality/);
  assert.ok(source.system.details.privateNotes.length > 0);
  assert.ok(!source.system.details.publicNotes.includes(npc.personality.secret?.id ?? "__never__"));
});


test("async actor source materializes spellcasting entry and compendium-backed spells", async () => {
  const registry = new ContentRegistry(); registerCoreContent(registry);
  const engine = new NpcEngine({ registry });
  const npc = engine.generate({ seed:"spell-adapter", level:5, classProfile:"core.wizard", profession:"core.scholar" });
  const spellDocs = new Map();
  for (const entry of npc.spellcasting) for (const spell of entry.preparedSpells) spellDocs.set(spell.slug, { uuid:`Compendium.pf2e.spells-srd.Item.${spell.slug}`, toObject:()=>({ name:spell.slug, type:"spell", system:{ slug:spell.slug, location:{ value:null } } }) });
  globalThis.game = { i18n:{ localize:(k)=>k }, packs:new Map([
    ["pf2e.spells-srd", { getIndex: async()=>[...spellDocs.keys()].map((slug,i)=>({_id:`s${i}`,type:"spell",system:{slug}})), getDocument: async(id)=>[...spellDocs.values()][Number(String(id).slice(1))] }],
    ["pf2e.equipment-srd", { getIndex: async()=>[], getDocument: async()=>null }]
  ]) };
  const adapter = new Pf2eDocumentAdapter();
  const source = await adapter.toActorSourceAsync(npc);
  const entry = source.items.find((item)=>item.type === "spellcastingEntry");
  assert.ok(entry);
  const spells = source.items.filter((item)=>item.type === "spell");
  assert.ok(spells.length > 0);
  assert.ok(spells.every((spell)=>spell.system.location.value === entry._id));
  assert.ok(spells.every((spell)=>typeof spell._id === "string" && spell._id.length > 0));
  const preparedIds = Object.values(entry.system.slots ?? {}).flatMap((slot)=>slot.prepared ?? []).map((slot)=>slot.id);
  assert.ok(preparedIds.length > 0);
  assert.ok(preparedIds.every((id)=>spells.some((spell)=>spell._id === id)));
});

test("spontaneous spellcasting creates populated rank slots", async () => {
  const registry = new ContentRegistry(); registerCoreContent(registry);
  const engine = new NpcEngine({ registry });
  const npc = engine.generate({ seed:"spell-adapter-spontaneous", level:5, classProfile:"core.bard", profession:"core.entertainer" });
  const spellDocs = new Map();
  for (const cast of npc.spellcasting) for (const spell of cast.preparedSpells) spellDocs.set(spell.slug, { uuid:`Compendium.pf2e.spells-srd.Item.${spell.slug}`, toObject:()=>({ name:spell.slug, type:"spell", system:{ slug:spell.slug, level:{value:spell.rank}, location:{ value:null } } }) });
  globalThis.game = { i18n:{ localize:(k)=>k }, packs:new Map([
    ["pf2e.spells-srd", { getIndex: async()=>[...spellDocs.keys()].map((slug,i)=>({_id:`s${i}`,type:"spell",system:{slug}})), getDocument: async(id)=>[...spellDocs.values()][Number(String(id).slice(1))] }],
    ["pf2e.equipment-srd", { getIndex: async()=>[], getDocument: async()=>null }]
  ]) };
  const source = await new Pf2eDocumentAdapter().toActorSourceAsync(npc);
  const entry = source.items.find((item)=>item.type === "spellcastingEntry");
  assert.equal(entry.system.prepared.value, "spontaneous");
  assert.ok(Object.values(entry.system.slots).some((slot)=>Number(slot.max) > 0));
  assert.ok(Object.values(entry.system.slots).some((slot)=>Number(slot.value) > 0));
});
