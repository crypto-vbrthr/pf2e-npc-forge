import test from "node:test";
import assert from "node:assert/strict";
import { ContentRegistry } from "../../scripts/engine/content/content-registry.js";
import { registerCoreContent } from "../../scripts/engine/content/core-content.js";
import { NpcEngine } from "../../scripts/engine/npc-engine.js";

function setup() {
  const registry = new ContentRegistry();
  registerCoreContent(registry);
  return { registry, engine: new NpcEngine({ registry }) };
}

const CORE_CLASSES = [
  "fighter", "rogue", "ranger", "cleric", "wizard", "bard", "druid", "witch",
  "alchemist", "barbarian", "investigator", "swashbuckler", "monk", "oracle", "champion", "sorcerer"
];

test("core content registers all sixteen remastered class profiles", () => {
  const { registry } = setup();
  const ids = new Set(registry.list("classProfiles").map((entry) => entry.id));
  for (const slug of CORE_CLASSES) assert.ok(ids.has(`core.${slug}`), `missing core.${slug}`);
  assert.equal(CORE_CLASSES.length, 16);
});

test("expanded classes expose representative specializations", () => {
  const { registry } = setup();
  for (const classId of ["core.bard", "core.druid", "core.alchemist", "core.barbarian", "core.investigator", "core.swashbuckler", "core.monk", "core.oracle", "core.champion", "core.sorcerer"]) {
    assert.ok(registry.children("classSpecializations", classId).length >= 2, `${classId} should have specializations`);
  }
});

test("automatic specialization remains deterministic for expanded classes", () => {
  const { engine } = setup();
  const a = engine.generate({ seed: "expanded-determinism", level: 7, classProfile: "core.alchemist" });
  const b = engine.generate({ seed: "expanded-determinism", level: 7, classProfile: "core.alchemist" });
  assert.equal(a.build.classSpecialization.id, b.build.classSpecialization.id);
});

test("representative new classes generate their signature abilities", () => {
  const { engine } = setup();
  const barbarian = engine.generate({ seed: "barbarian", level: 5, classProfile: "core.barbarian", classSpecialization: "core.barbarian.fury" });
  assert.ok(barbarian.abilities.some((a) => a.id === "core.ability.rage"));
  assert.ok(barbarian.abilities.some((a) => a.id === "core.ability.fury-instinct"));

  const investigator = engine.generate({ seed: "investigator", level: 5, classProfile: "core.investigator", classSpecialization: "core.investigator.empiricism" });
  assert.ok(investigator.abilities.some((a) => a.id === "core.ability.devise-stratagem"));
  assert.ok(investigator.abilities.some((a) => a.id === "core.ability.empiricism-methodology"));

  const oracle = engine.generate({ seed: "oracle", level: 7, classProfile: "core.oracle", classSpecialization: "core.oracle.life" });
  assert.ok(oracle.abilities.some((a) => a.id === "core.ability.cursebound"));
  assert.ok(oracle.abilities.some((a) => a.id === "core.ability.life-mystery"));
});

test("monk baseline loadout uses an unarmed attack without a fake weapon compendium item", () => {
  const { engine } = setup();
  const monk = engine.generate({ seed: "monk-loadout", level: 4, classProfile: "core.monk" });
  assert.equal(monk.inventory[0].type, "unarmed");
  assert.equal(monk.attacks[0].sourceWeaponId, monk.inventory[0].id);
  assert.ok(monk.inventory[0].traits.includes("unarmed"));
});
