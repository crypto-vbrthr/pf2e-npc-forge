import test from "node:test";
import assert from "node:assert/strict";
import { ContentRegistry } from "../../scripts/engine/content/content-registry.js";
import { registerCoreContent } from "../../scripts/engine/content/core-content.js";
import { NpcEngine } from "../../scripts/engine/npc-engine.js";

function engine() {
  const registry = new ContentRegistry();
  registerCoreContent(registry);
  return new NpcEngine({ registry });
}

test("level 3 fighter guard follows configured GM Core benchmark tiers", () => {
  const npc = engine().generate({ seed: "stats-l3", level: 3, ancestry: "core.human", classProfile: "core.fighter", profession: "core.guard", role: "core.ordinary" });
  assert.deepEqual(npc.statistics.attributes, { str: 4, dex: 3, con: 4, int: 1, wis: 3, cha: 1 });
  assert.equal(npc.statistics.perception, 9);
  assert.equal(npc.statistics.ac, 19);
  assert.equal(npc.statistics.hp, 45);
  assert.deepEqual(npc.statistics.saves, { fortitude: 12, reflex: 9, will: 6 });
  assert.equal(npc.attacks[0].modifier, 12);
});

test("ancestry changes speed and can adjust an ability", () => {
  const npc = engine().generate({ seed: "dwarf", level: 3, ancestry: "core.dwarf", profession: "core.blacksmith", role: "core.ordinary" });
  assert.equal(npc.statistics.speed, 20);
  assert.equal(npc.statistics.attributes.con, 5);
});

test("veteran role adds narrow numeric expertise without replacing benchmark tiers", () => {
  const ordinary = engine().generate({ seed: "veteran", level: 5, role: "core.ordinary" });
  const veteran = engine().generate({ seed: "veteran", level: 5, role: "core.veteran" });
  assert.equal(veteran.statistics.perception, ordinary.statistics.perception + 1);
  assert.equal(veteran.statistics.saves.fortitude, ordinary.statistics.saves.fortitude + 1);
});
