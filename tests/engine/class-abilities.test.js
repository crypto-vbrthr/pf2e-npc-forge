import test from "node:test";
import assert from "node:assert/strict";
import { ContentRegistry } from "../../scripts/engine/content/content-registry.js";
import { registerCoreContent } from "../../scripts/engine/content/core-content.js";
import { NpcEngine } from "../../scripts/engine/npc-engine.js";
import { Pf2eDocumentAdapter } from "../../scripts/adapters/pf2e-document-adapter.js";

function setup() {
  const registry = new ContentRegistry();
  registerCoreContent(registry);
  return { registry, engine: new NpcEngine({ registry }) };
}

test("fighter specialization adds signature abilities", () => {
  const { engine } = setup();
  const npc = engine.generate({ seed: "fighter-abilities", level: 5, classProfile: "core.fighter", classSpecialization: "core.fighter.sword-shield" });
  assert.equal(npc.build.classSpecialization.id, "core.fighter.sword-shield");
  assert.ok(npc.abilities.some((a) => a.id === "core.ability.reactive-strike"));
  assert.ok(npc.abilities.some((a) => a.id === "core.ability.shielded-guard"));
});

test("rogue sneak attack scales by level", () => {
  const { engine } = setup();
  const low = engine.generate({ seed: "rogue-low", level: 1, classProfile: "core.rogue", classSpecialization: "core.rogue.thief" });
  const high = engine.generate({ seed: "rogue-high", level: 11, classProfile: "core.rogue", classSpecialization: "core.rogue.thief" });
  assert.equal(low.abilities.find((a) => a.id === "core.ability.sneak-attack").parameters.dice, "1d6");
  assert.equal(high.abilities.find((a) => a.id === "core.ability.sneak-attack").parameters.dice, "3d6");
});

test("external modules can register class specializations and abilities", () => {
  const { registry, engine } = setup();
  registry.register("abilityDefinitions", "test-addon", { id: "test-addon.duelist-riposte", labelKey: "TEST.Riposte", descriptionKey: "TEST.RiposteDesc", actionType: "reaction", traits: ["attack"] });
  registry.register("classSpecializations", "test-addon", { id: "test-addon.duelist", parentId: "core.fighter", label: "Duelist", abilityIds: ["test-addon.duelist-riposte"], weight: 1 });
  const npc = engine.generate({ seed: "duelist", level: 6, classProfile: "core.fighter", classSpecialization: "test-addon.duelist" });
  assert.ok(npc.abilities.some((a) => a.id === "test-addon.duelist-riposte"));
});

test("document adapter exports generated abilities as PF2e action items", () => {
  const { engine } = setup();
  const npc = engine.generate({ seed: "adapter-actions", level: 5, classProfile: "core.ranger", classSpecialization: "core.ranger.precision" });
  const source = new Pf2eDocumentAdapter().toActorSource(npc);
  const actions = source.items.filter((item) => item.type === "action");
  assert.ok(actions.length >= 2);
  assert.ok(actions.some((item) => item.flags?.["pf2e-npc-forge"]?.abilityId === "core.ability.hunt-prey"));
  assert.ok(actions.some((item) => item.flags?.["pf2e-npc-forge"]?.abilityId === "core.ability.precision-edge"));
});
