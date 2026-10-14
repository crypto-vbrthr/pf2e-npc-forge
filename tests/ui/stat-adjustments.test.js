import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { ContentRegistry } from "../../scripts/engine/content/content-registry.js";
import { registerCoreContent } from "../../scripts/engine/content/core-content.js";
import { NpcEngine } from "../../scripts/engine/npc-engine.js";
import { Pf2eDocumentAdapter } from "../../scripts/adapters/pf2e-document-adapter.js";
import { NpcEditorSession } from "../../scripts/ui/npc-editor-session.js";
import { adjustNpcStat } from "../../scripts/ui/stat-adjustments.js";
import { presentNpc } from "../../scripts/ui/npc-presentation.js";

function fixture() {
  const registry = new ContentRegistry();
  registerCoreContent(registry);
  const engine = new NpcEngine({ registry });
  const request = { seed: "manual-stats-01", level: 8, ancestry: "core.human", classProfile: "core.fighter", profession: "core.guard", role: "core.ordinary" };
  const npc = engine.generate(request);
  return { registry, engine, request, npc };
}

function sessionFromFixture(f, options = {}) {
  return new NpcEditorSession({ engine: f.engine, adapter: new Pf2eDocumentAdapter(), initialNpc: f.npc, initialRequest: f.request, ...options });
}

test("single-step +/- edits each numeric category without mutating the original, other stats, or weapon source", () => {
  const { npc } = fixture();
  const skill = npc.skills[0];
  const attack = npc.attacks[0];
  const unchanged = structuredClone(npc);
  let next = adjustNpcStat(npc, "attribute", "str", 1);
  assert.equal(next.statistics.attributes.str, npc.statistics.attributes.str + 1);
  assert.deepEqual(next.statistics.saves, npc.statistics.saves);
  assert.deepEqual(next.skills, npc.skills);
  assert.deepEqual(next.attacks, npc.attacks);
  next = adjustNpcStat(next, "defense", "ac", -1);
  next = adjustNpcStat(next, "defense", "hp", 1);
  next = adjustNpcStat(next, "defense", "perception", 1);
  next = adjustNpcStat(next, "save", "fortitude", -1);
  next = adjustNpcStat(next, "skill", skill.slug, 1);
  next = adjustNpcStat(next, "attack", attack.id, -1);
  next = adjustNpcStat(next, "defense", "speed", 1);
  assert.equal(next.statistics.ac, npc.statistics.ac - 1);
  assert.equal(next.statistics.hp, npc.statistics.hp + 1);
  assert.equal(next.statistics.perception, npc.statistics.perception + 1);
  assert.equal(next.statistics.saves.fortitude, npc.statistics.saves.fortitude - 1);
  assert.equal(next.skills.find((s) => s.slug === skill.slug).modifier, skill.modifier + 1);
  assert.equal(next.attacks.find((a) => a.id === attack.id).modifier, attack.modifier - 1);
  assert.equal(next.statistics.speed, npc.statistics.speed + 5);
  assert.deepEqual(next.inventory, npc.inventory);
  assert.deepEqual(npc, unchanged);
  assert.equal(new NpcEngine({ registry: (() => { const r = new ContentRegistry(); registerCoreContent(r); return r; })() }).validate(next).valid, true);
});

test("HP, AC and Speed enforce sensible minima; arbitrary fields and unsafe deltas are refused", () => {
  const { npc } = fixture();
  assert.equal(adjustNpcStat(npc, "defense", "hp", -1000).statistics.hp, 1);
  assert.equal(adjustNpcStat(npc, "defense", "ac", -1000).statistics.ac, 1);
  assert.equal(adjustNpcStat(npc, "defense", "speed", -1000).statistics.speed, 0);
  for (const [kind, key] of [["attribute", "invalid"], ["defense", "level"], ["save", "bad"], ["skill", "absent"], ["attack", "missing"], ["invalid", "hp"]]) {
    assert.throws(() => adjustNpcStat(npc, kind, key, 1), /Unknown/);
  }
  for (const delta of [0, 0.5, NaN, Infinity, "1", 1001]) {
    assert.throws(() => adjustNpcStat(npc, "attribute", "str", delta), /integer steps/);
  }
  assert.throws(() => adjustNpcStat(null, "attribute", "str", 1), /Generate/);
});

test("editor adjustments appear in preview and in fully materialized PF2e Actor item/stat sources", async () => {
  const fixtureData = fixture();
  const { npc, engine } = fixtureData;
  const session = sessionFromFixture(fixtureData);
  const skill = npc.skills[0];
  const attack = npc.attacks[0];
  const events = [];
  session.callbacks.onChange = (event) => events.push(event);
  await session.adjustStat("attribute", "dex", 1);
  await session.adjustStat("defense", "ac", 1);
  await session.adjustStat("defense", "hp", 1);
  await session.adjustStat("defense", "perception", -1);
  await session.adjustStat("defense", "speed", 1);
  await session.adjustStat("save", "will", 1);
  await session.adjustStat("skill", skill.slug, 1);
  await session.adjustStat("attack", attack.id, 1);
  const result = session.getNpc();
  const view = presentNpc(result, (key) => key);
  const actor = new Pf2eDocumentAdapter().toActorSource(result);
  assert.equal(view.statistics.attributes.dex, `+${result.statistics.attributes.dex}`);
  assert.equal(view.attacks.find((a) => a.id === attack.id).displayModifier, `+${result.attacks[0].modifier}`);
  assert.equal(actor.system.abilities.dex.mod, npc.statistics.attributes.dex + 1);
  assert.equal(actor.system.attributes.ac.value, npc.statistics.ac + 1);
  assert.equal(actor.system.attributes.hp.max, npc.statistics.hp + 1);
  assert.equal(actor.system.perception.mod, npc.statistics.perception - 1);
  assert.equal(actor.system.attributes.speed.value, npc.statistics.speed + 5);
  assert.equal(actor.system.saves.will.value, npc.statistics.saves.will + 1);
  const expectedSkill = result.skills.find((s) => s.slug === skill.slug);
  // Lore can be represented as a separate Item; the neutral model must contain
  // the edited value and the adapter must preserve all edited regular skills.
  if (expectedSkill.type === "standard") assert.equal(actor.system.skills[skill.slug].base, expectedSkill.modifier);
  const attackItem = actor.items.find((item) => item.flags?.["pf2e-npc-forge"]?.attackId === attack.id || item.type === "melee");
  assert.ok(attackItem);
  assert.equal(attackItem.system.bonus.value, attack.modifier + 1);
  assert.ok(events.every((event) => event.reason === "adjustStat"));
  assert.equal(events.length, 8);
  assert.equal(engine.validate(result).valid, true);
  session.destroy();
});

test("manual changes follow lock semantics and section rerolls only reset their own numeric fields", async () => {
  const f = fixture();
  const session = sessionFromFixture(f);
  const attr0 = f.npc.statistics.attributes.str;
  const skill = f.npc.skills[0];
  const attack = f.npc.attacks[0];
  await session.adjustStat("attribute", "str", 1);
  await session.adjustStat("skill", skill.slug, 1);
  await session.adjustStat("attack", attack.id, 1);
  await session.rerollSection("personality");
  assert.equal(session.getNpc().statistics.attributes.str, attr0 + 1);
  assert.equal(session.getNpc().skills.find((s) => s.slug === skill.slug).modifier, skill.modifier + 1);
  assert.equal(session.getNpc().attacks.find((a) => a.id === attack.id).modifier, attack.modifier + 1);
  session.setSectionLocked("statistics", true, { render: false });
  session.setSectionLocked("skills", true, { render: false });
  session.setSectionLocked("inventory", true, { render: false });
  session.setSectionLocked("attacks", true, { render: false });
  await session.generate();
  assert.equal(session.getNpc().statistics.attributes.str, attr0 + 1);
  assert.equal(session.getNpc().skills.find((s) => s.slug === skill.slug).modifier, skill.modifier + 1);
  assert.equal(session.getNpc().attacks.find((a) => a.id === attack.id).modifier, attack.modifier + 1);
  // Locks preserve regenerated sections, but do not prevent intentional edits.
  await session.adjustStat("attribute", "str", -1);
  assert.equal(session.getNpc().statistics.attributes.str, attr0);
  session.setSectionLocked("statistics", false, { render: false });
  await session.rerollSection("statistics");
  assert.equal(session.getNpc().statistics.attributes.str, attr0);
  session.setSectionLocked("inventory", false, { render: false });
  session.setSectionLocked("attacks", false, { render: false });
  await session.generate();
  assert.equal(session.getNpc().attacks.find((a) => a.id === attack.id).modifier, attack.modifier);
  session.destroy();
});

test("embedded editor can disable numeric edits, session state remains isolated", async () => {
  const f = fixture();
  const readonly = sessionFromFixture(f, { capabilities: { adjustStats: false } });
  await assert.rejects(() => readonly.adjustStat("defense", "hp", 1), /disabled/);
  const first = sessionFromFixture(f);
  const second = sessionFromFixture(f);
  await first.adjustStat("defense", "hp", 1);
  assert.equal(first.getNpc().statistics.hp, f.npc.statistics.hp + 1);
  assert.equal(second.getNpc().statistics.hp, f.npc.statistics.hp);
  readonly.destroy(); first.destroy(); second.destroy();
});

test("preview markup provides adjustment targets in all requested sections and wiring is present", () => {
  const template = fs.readFileSync(new URL("../../templates/npc-editor-core.hbs", import.meta.url), "utf8");
  const core = fs.readFileSync(new URL("../../scripts/ui/npc-editor-core.js", import.meta.url), "utf8");
  for (const attr of ["str", "dex", "con", "int", "wis", "cha"]) assert.match(template, new RegExp(`data-stat-kind="attribute" data-stat-key="${attr}"`));
  for (const stat of ["ac", "hp", "perception", "speed"]) assert.match(template, new RegExp(`data-stat-kind="defense" data-stat-key="${stat}"`));
  for (const save of ["fortitude", "reflex", "will"]) assert.match(template, new RegExp(`data-stat-kind="save" data-stat-key="${save}"`));
  assert.match(template, /data-stat-kind="skill" data-stat-key="\{\{slug\}\}"/);
  assert.match(template, /data-stat-kind="attack" data-stat-key="\{\{id\}\}"/);
  assert.match(core, /data-editor-action/);
  assert.match(template, /type="button" class="npc-forge-adjust-button" data-editor-action="adjustStat"/);
  assert.match(template, /aria-label="\{\{localize "NPCFORGE.Controls.IncreaseStat"\}\}/);
  assert.match(template, /aria-label="\{\{localize "NPCFORGE.Controls.DecreaseStat"\}\}/);
  assert.match(core, /session\.adjustStat\(kind, key,[\s\S]*?render: false/);
  assert.match(core, /_updateStatDisplay\(/);
});

test("shared editor processes actual +/- button events and updates the value in place", async () => {
  const { NpcEditorCore } = await import("../../scripts/ui/npc-editor-core.js");
  const previous = globalThis.game;
  globalThis.game = { i18n: { localize: (key) => key } };
  try {
    const f = fixture();
    const session = sessionFromFixture(f);
    const label = { textContent: String(f.npc.statistics.ac) };
    const wrapper = {
      dataset: { statKind: "defense", statKey: "ac", statLabel: "AC" },
      querySelector: (selector) => selector === "strong" ? label : null
    };
    const plus = {
      dataset: { editorAction: "adjustStat", statKind: "defense", statKey: "ac", statDelta: "1" },
      closest: (selector) => selector === ".npc-forge-adjustable" ? wrapper : null
    };
    const handlers = {};
    const host = {
      querySelector: () => null,
      addEventListener: (type, handler) => { handlers[type] = handler; },
      contains: () => true
    };
    const core = new NpcEditorCore({ session, api: {} });
    core.mountElement = host;
    core._abortController = new AbortController();
    core._bindEvents();
    assert.equal(typeof handlers.click, "function", "the mounted editor listens for DOM clicks");
    let prevented = false, stopped = false;
    const event = {
      target: { closest: () => plus },
      preventDefault: () => { prevented = true; },
      stopPropagation: () => { stopped = true; }
    };
    await handlers.click(event);
    assert.equal(prevented, true);
    assert.equal(stopped, true);
    assert.equal(label.textContent, String(f.npc.statistics.ac + 1));
    assert.equal(session.getNpc().statistics.ac, f.npc.statistics.ac + 1);
    plus.dataset.statDelta = "-1";
    await handlers.click(event);
    assert.equal(label.textContent, String(f.npc.statistics.ac));
    assert.equal(session.getNpc().statistics.ac, f.npc.statistics.ac);
    session.destroy();
  } finally {
    globalThis.game = previous;
  }
});
