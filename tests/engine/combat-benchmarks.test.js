import test from "node:test";
import assert from "node:assert/strict";
import { ContentRegistry } from "../../scripts/engine/content/content-registry.js";
import { registerCoreContent } from "../../scripts/engine/content/core-content.js";
import { NpcEngine } from "../../scripts/engine/npc-engine.js";
import { STRIKE_DAMAGE, formulaAverage, weaponScaledDamageFormula } from "../../scripts/engine/rules/gm-core-tables.js";

function engine() {
  const registry = new ContentRegistry();
  registerCoreContent(registry);
  return new NpcEngine({ registry });
}

test("GM Core strike damage benchmarks cover levels -1 through 24", () => {
  assert.equal(Object.keys(STRIKE_DAMAGE).length, 26);
  assert.equal(STRIKE_DAMAGE[12].high.formula, "3d10+14");
  assert.equal(STRIKE_DAMAGE[12].high.average, 30);
  assert.equal(STRIKE_DAMAGE[12].extreme.average, 38);
});

test("weapon scaling preserves the weapon die while matching benchmark average", () => {
  const scaled = weaponScaledDamageFormula({ level: 12, tier: "high", die: "d6" });
  assert.equal(scaled.formula, "4d6+16");
  assert.equal(scaled.expectedAverage, 30);
  assert.equal(formulaAverage(scaled.formula), 30);
});

test("level 12 fighter uses high attack and high strike damage benchmarks", () => {
  const npc = engine().generate({ seed: "fighter-12-benchmark", level: 12, classProfile: "core.fighter", profession: "core.guard" });
  const strike = npc.attacks.find((attack) => attack.id === "primary-attack");
  assert.equal(strike.modifier, 26);
  assert.equal(strike.attackTier, "high");
  assert.equal(strike.damage.benchmarkTier, "high");
  assert.equal(strike.damage.expectedAverage, 30);
  assert.equal(strike.damage.formula, "4d6+16");
});

test("barbarian trades accuracy for extreme strike damage", () => {
  const npc = engine().generate({ seed: "barbarian-12-benchmark", level: 12, classProfile: "core.barbarian", profession: "core.guard" });
  const strike = npc.attacks.find((attack) => attack.id === "primary-attack");
  assert.equal(strike.modifier, 24, "barbarian profile keeps its average attack benchmark");
  assert.equal(strike.damage.benchmarkTier, "extreme");
  assert.equal(strike.damage.expectedAverage, 38);
});

test("agile strikes step down one damage category", () => {
  const npc = engine().generate({ seed: "rogue-agile-12", level: 12, classProfile: "core.rogue", profession: "core.thief" });
  const strike = npc.attacks.find((attack) => attack.id === "primary-attack");
  assert.ok(strike.traits.includes("agile"));
  assert.equal(strike.damage.benchmarkTier, "average", "an agile rogue Strike steps from high to average damage");
  assert.equal(strike.damage.expectedAverage, 25);
});
