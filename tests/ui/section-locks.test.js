import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { NpcEditorSession } from "../../scripts/ui/npc-editor-session.js";

function npc(seed, name = "Nira", marker = "base") {
  return {
    generation: { seed },
    identity: { name, ancestry: { id: "core.human" }, gender: "female", age: { category: "adult", years: 30 }, appearance: { marker: `appearance-${marker}` } },
    build: { level: 5, classProfile: { id: "core.wizard" }, classSpecialization: null,
      professionCategory: { id: "core.profession-category.civic" }, profession: { id: "core.guard" }, professionSpecialization: null, role: { id: "core.ordinary" } },
    personality: { marker: `personality-${marker}` }, biography: { marker: `biography-${marker}` },
    relationships: [{ marker: `relationships-${marker}` }], socialContext: { marker: `social-${marker}` },
    statistics: { hp: 44 }, skills: [{ slug: "arcana", modifier: 10 }], abilities: [],
    spellcasting: [{ id: "spells", spells: [{ slug: `spell-${marker}` }] }],
    inventory: [
      { id: "weapon", purpose: "primary-weapon", marker },
      { id: "wizard-book", purpose: "spellbook", spellbook: { spells: [{ slug: `spell-${marker}` }] } }
    ],
    attacks: [{ sourceWeaponId: "weapon", marker }], integrations: { marker }
  };
}
function makeSession(options = {}) {
  let count = 0;
  const engine = {
    generate: (request) => npc(request.seed ?? `random-${++count}`, `Random-${count}`, `new-${++count}`),
    validate: () => ({ valid: true, errors: [] })
  };
  return new NpcEditorSession({
    engine, adapter: {}, initialRequest: { level: 5, ancestry: "core.human", classProfile: "core.wizard", profession: "core.guard", role: "core.ordinary", seed: "fixed" },
    initialNpc: npc("fixed"), ...options
  });
}

test("lock individual sections, preserve on Generate and never mutate the old NPC", async () => {
  const session = makeSession();
  session.setSectionLocked("identity", true, { render: false });
  session.setSectionLocked("personality", true, { render: false });
  const before = session.getNpc();
  const after = await session.generate();
  assert.equal(after.identity.name, before.identity.name);
  assert.equal(after.identity.gender, before.identity.gender);
  assert.deepEqual(after.personality, before.personality);
  assert.notDeepEqual(after.identity.appearance, before.identity.appearance);
  assert.notDeepEqual(after.biography, before.biography);
  assert.deepEqual(before, npc("fixed"));
  assert.deepEqual(session.getLockedSections(), ["identity", "personality"]);
  session.toggleSectionLock("identity", { render: false });
  assert.equal(session.isSectionLocked("identity"), false);
  assert.match((await session.generate()).identity.name, /^Random-/);
  assert.deepEqual(session.getRequest().seed, "fixed");
});

test("locking appearance first and identity second preserves both, independent of click order", async () => {
  const session = makeSession();
  session.setSectionLocked("appearance", true, { render: false });
  session.setSectionLocked("identity", true, { render: false });
  const after = await session.generate();
  assert.equal(after.identity.name, "Nira");
  assert.equal(after.identity.appearance.marker, "appearance-base");
});

test("locked relationship and social content survives rerolling the biography group", async () => {
  const session = makeSession();
  session.setSectionLocked("relationships", true, { render: false });
  session.setSectionLocked("socialContext", true, { render: false });
  const after = await session.rerollSection("background");
  assert.match(after.biography.marker, /new-/);
  assert.equal(after.relationships[0].marker, "relationships-base");
  assert.equal(after.socialContext.marker, "social-base");
  await assert.rejects(() => session.rerollSection("relationships"), /Unlock.*relationships/);
});

test("equipment lock and attack lock are separate, with the current spellbook", async () => {
  const session = makeSession();
  session.setSectionLocked("inventory", true, { render: false });
  const after = await session.generate();
  assert.equal(after.inventory.find((i) => i.purpose === "primary-weapon").marker, "base");
  assert.notEqual(after.attacks[0].marker, "base", "the attack is NOT locked by the equipment lock");
  assert.equal(after.attacks[0].sourceWeaponId, "weapon");
  assert.equal(after.inventory.find((i) => i.purpose === "spellbook").spellbook.spells[0].slug, after.spellcasting[0].spells[0].slug);
  assert.deepEqual(after.integrations, { marker: "base" });
  assert.equal(session.isSectionLocked("attacks"), false);
  await assert.rejects(() => session.rerollSection("inventory"), /Unlock.*inventory/);
  session.setSectionLocked("attacks", true, { render: false });
  assert.equal(session.isSectionLocked("inventory"), true);
  assert.equal(session.isSectionLocked("attacks"), true);
  session.setSectionLocked("inventory", false, { render: false });
  assert.equal(session.isSectionLocked("attacks"), true, "unlocking equipment must not unlock attacks");
  const withAttacksLocked = await session.generate();
  assert.equal(withAttacksLocked.attacks[0].marker, after.attacks[0].marker);
  assert.equal(withAttacksLocked.inventory.find((i) => i.id === "weapon")?.marker, "base", "locked attack retains its linked weapon");
});

test("locking spells preserves spellbook content when inventory is regenerated", async () => {
  const session = makeSession();
  session.setSectionLocked("spellcasting", true, { render: false });
  const after = await session.generate();
  assert.equal(after.spellcasting[0].spells[0].slug, "spell-base");
  assert.equal(after.inventory.find((i) => i.purpose === "spellbook").spellbook.spells[0].slug, "spell-base");
  session.setSectionLocked("spellcasting", false, { render: false });
  const rerolled = await session.rerollSection("spellcasting");
  assert.equal(rerolled.inventory.find((i) => i.purpose === "spellbook").spellbook.spells[0].slug, rerolled.spellcasting[0].spells[0].slug);
});

test("setNpc clears old locks unless the host explicitly opts in, with per-session state", () => {
  const a = makeSession();
  const b = makeSession();
  a.setSectionLocked("identity", true, { render: false });
  assert.deepEqual(b.getLockedSections(), []);
  a.setNpc(npc("new"), { render: false, preserveLocks: true });
  assert.deepEqual(a.getLockedSections(), ["identity"]);
  a.setNpc(npc("another"), { render: false });
  assert.deepEqual(a.getLockedSections(), []);
  assert.throws(() => a.setSectionLocked("foo"), /Unsupported/);
  a.clearSectionLocks({ render: false });
  a.destroy(); b.destroy();
});

test("embedded hosts can turn off locks as well as rerolls", async () => {
  const session = makeSession({ capabilities: { sectionLocks: false, reroll: false } });
  assert.throws(() => session.setSectionLocked("identity"), /disabled/);
  await assert.rejects(() => session.rerollSection("identity"), /disabled/);
});

test("changing ancestry while identity is locked fails instead of producing an inconsistent model", async () => {
  const session = makeSession();
  session.setSectionLocked("identity", true, { render: false });
  session.setRequest({ ...session.getRequest(), ancestry: "core.elf" }, { render: false });
  await assert.rejects(() => session.generate(), /Unlock that section/);
  assert.equal(session.getNpc().identity.ancestry.id, "core.human");
});

test("same fixed seed yields successive reproducible editor generations without mutating original request", async () => {
  const one = makeSession(); const two = makeSession();
  const a1 = await one.generate(); const a2 = await one.generate();
  const b1 = await two.generate(); const b2 = await two.generate();
  assert.equal(a1.generation.seed, b1.generation.seed);
  assert.equal(a2.generation.seed, b2.generation.seed);
  assert.notEqual(a1.generation.seed, a2.generation.seed);
  assert.equal(one.getRequest().seed, "fixed");
});

test("preview provides keyboard-accessible lock/refresh controls and consistent section ids", () => {
  const template = fs.readFileSync(new URL("../../templates/npc-editor-core.hbs", import.meta.url), "utf8");
  const core = fs.readFileSync(new URL("../../scripts/ui/npc-editor-core.js", import.meta.url), "utf8");
  for (const section of ["identity", "appearance", "personality", "biography", "relationships", "socialContext", "attributes", "defenses", "skills", "abilities", "spellcasting", "inventory", "attacks"]) {
    assert.match(template, new RegExp(`data-editor-section="${section}"`));
  }
  assert.match(template, /data-editor-action="lockSection"/);
  assert.match(template, /data-editor-action="rerollSection"/);
  assert.match(template, /aria-pressed=/);
  assert.match(template, /\{\{#if locks\.personality\}\}disabled/);
  assert.match(core, /this\.captureUiState\(\);[\s\S]*?session\.rerollSection\(section\)/);
  assert.match(core, /this\.captureUiState\(\);[\s\S]*?session\.toggleSectionLock\(section/);
});

test("real NPC engine: locked name and personality survive generation and yield a valid Actor model", async () => {
  const { ContentRegistry } = await import("../../scripts/engine/content/content-registry.js");
  const { registerCoreContent } = await import("../../scripts/engine/content/core-content.js");
  const { NpcEngine } = await import("../../scripts/engine/npc-engine.js");
  const registry = new ContentRegistry();
  registerCoreContent(registry);
  const engine = new NpcEngine({ registry });
  const session = new NpcEditorSession({ engine, adapter: {}, initialRequest: { level: 8, ancestry: "core.human", classProfile: "core.wizard", professionCategory: "core.profession-category.civic", profession: "core.guard", seed: "real-lock" } });
  const first = await session.generate();
  session.setSectionLocked("identity", true, { render: false });
  session.setSectionLocked("personality", true, { render: false });
  const second = await session.generate();
  assert.equal(second.identity.name, first.identity.name);
  assert.deepEqual(second.personality, first.personality);
  assert.notEqual(second.generation.seed, first.generation.seed);
  assert.equal(engine.validate(second).valid, true);
  assert.deepEqual(second.inventory.find((item) => item.purpose === "spellbook")?.spellbook?.spells,
    second.spellcasting[0].knownSpells.map(({ slug, rank }) => ({ slug, rank })));
});

test("deterministic skill and inventory sections have lock buttons but no misleading refresh icons", () => {
  const template = fs.readFileSync(new URL("../../templates/npc-editor-core.hbs", import.meta.url), "utf8");
  for (const name of ["attributes", "defenses", "skills", "abilities", "inventory", "attacks"]) {
    assert.match(template, new RegExp(`data-editor-action="lockSection" data-editor-section="${name}"`));
    assert.doesNotMatch(template, new RegExp(`data-editor-action="rerollSection" data-editor-section="${name}"`));
  }
});


test("biography refresh does not touch social context or relationships", async () => {
  const session = makeSession();
  const original = session.getNpc();
  const after = await session.rerollSection("biography");
  assert.notDeepEqual(after.biography, original.biography);
  assert.deepEqual(after.relationships, original.relationships);
  assert.deepEqual(after.socialContext, original.socialContext);
  session.setSectionLocked("biography", true, { render: false });
  assert.equal(session.isSectionLocked("background"), true);
  await assert.rejects(() => session.rerollSection("biography"), /Unlock/);
});


test("broad all reroll honors session locks and linked spellbook content", async () => {
  const session = makeSession();
  session.setSectionLocked("identity", true, { render: false });
  session.setSectionLocked("spellcasting", true, { render: false });
  const after = await session.rerollSection("all");
  assert.equal(after.identity.name, "Nira");
  assert.equal(after.spellcasting[0].spells[0].slug, "spell-base");
  assert.equal(after.inventory.find((i) => i.purpose === "spellbook").spellbook.spells[0].slug, "spell-base");
  assert.equal(after.generation.rerolls.all.count, 1);
});


test("attributes and defense locks are independent, with legacy statistics lock supported", async () => {
  const session = makeSession();
  session.setNpc({ ...session.getNpc(), statistics: {
    attributes: { str: 5, dex: 4 }, ac: 24, hp: 44, perception: 12, speed: 25,
    saves: { fortitude: 12, reflex: 14, will: 11 }
  } }, { render: false });
  session.setSectionLocked("attributes", true, { render: false });
  assert.equal(session.isSectionLocked("defenses"), false);
  const after = await session.generate();
  assert.deepEqual(after.statistics.attributes, { str: 5, dex: 4 });
  assert.equal(after.statistics.hp, 44, "mock candidate hp matches but is not locked");
  session.setSectionLocked("defenses", true, { render: false });
  assert.equal(session.isSectionLocked("attributes"), true);
  session.setSectionLocked("attributes", false, { render: false });
  assert.equal(session.isSectionLocked("defenses"), true);
  assert.equal(session.isSectionLocked("attributes"), false);
  session.setSectionLocked("statistics", true, { render: false });
  assert.equal(session.isSectionLocked("defenses"), true);
  assert.equal(session.isSectionLocked("attributes"), true);
  session.setSectionLocked("attributes", false, { render: false });
  assert.equal(session.isSectionLocked("defenses"), true);
  assert.equal(session.isSectionLocked("attributes"), false);
  session.destroy();
});
