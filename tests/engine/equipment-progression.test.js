import test from "node:test";
import assert from "node:assert/strict";
import { ContentRegistry } from "../../scripts/engine/content/content-registry.js";
import { registerCoreContent } from "../../scripts/engine/content/core-content.js";
import { NpcEngine } from "../../scripts/engine/npc-engine.js";
import { fundamentalProfileFor } from "../../scripts/engine/rules/equipment-progression.js";

function engine() {
  const registry = new ContentRegistry();
  registerCoreContent(registry);
  return new NpcEngine({ registry });
}

test("fundamental rune progression follows PF2e Remaster level thresholds", () => {
  assert.deepEqual(fundamentalProfileFor("weapon", 1), { id:"mundane", level:0, potency:0, striking:0 });
  assert.deepEqual(fundamentalProfileFor("weapon", 4), { id:"potency-1-striking", level:4, potency:1, striking:1 });
  assert.deepEqual(fundamentalProfileFor("weapon", 12), { id:"potency-2-greater-striking", level:12, potency:2, striking:2 });
  assert.deepEqual(fundamentalProfileFor("weapon", 19), { id:"potency-3-major-striking", level:19, potency:3, striking:3 });
  assert.deepEqual(fundamentalProfileFor("armor", 14), { id:"potency-2-greater-resilient", level:14, potency:2, resilient:2 });
  assert.deepEqual(fundamentalProfileFor("shield", 13), { id:"greater", level:13, reinforcing:4 });
});

test("high-level guard equipment receives level-appropriate weapon armor and shield runes", () => {
  const npc = engine().generate({ seed:"scaled-guard", level:12, profession:"core.guard", classProfile:"core.fighter" });
  const weapon = npc.inventory.find((item) => item.type === "weapon");
  const armor = npc.inventory.find((item) => item.type === "armor");
  const shield = npc.inventory.find((item) => item.type === "shield");
  assert.deepEqual(weapon.fundamentalRunes, { profileId:"potency-2-greater-striking", profileLevel:12, potency:2, striking:2 });
  assert.deepEqual(armor.fundamentalRunes, { profileId:"potency-2-resilient", profileLevel:11, potency:2, resilient:1 });
  assert.deepEqual(shield.fundamentalRunes, { profileId:"moderate", profileLevel:10, reinforcing:3 });
});

test("fundamental rune scaling can be disabled without changing NPC strike benchmarks", () => {
  const npcEngine = engine();
  const scaled = npcEngine.generate({ seed:"same-benchmark", level:12, profession:"core.guard", classProfile:"core.fighter", inventory:{ scaleFundamentalRunes:true } });
  const mundane = npcEngine.generate({ seed:"same-benchmark", level:12, profession:"core.guard", classProfile:"core.fighter", inventory:{ scaleFundamentalRunes:false } });
  assert.ok(scaled.inventory.find((item)=>item.type === "weapon").fundamentalRunes);
  assert.equal(mundane.inventory.find((item)=>item.type === "weapon").fundamentalRunes, undefined);
  assert.equal(scaled.attacks[0].modifier, mundane.attacks[0].modifier);
  assert.equal(scaled.attacks[0].damage.formula, mundane.attacks[0].damage.formula, "runes must not double-scale NPC Strike damage");
});
