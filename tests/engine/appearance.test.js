import test from "node:test";
import assert from "node:assert/strict";
import { ContentRegistry } from "../../scripts/engine/content/content-registry.js";
import { registerCoreContent } from "../../scripts/engine/content/core-content.js";
import { NpcEngine } from "../../scripts/engine/npc-engine.js";

function makeEngine() {
  const registry = new ContentRegistry();
  registerCoreContent(registry);
  return { registry, engine: new NpcEngine({ registry }) };
}

test("appearance generation is deterministic and structured", () => {
  const { engine } = makeEngine();
  const request = { seed: "appearance-guard-01", level: 5, ancestry: "core.human", classProfile: "core.fighter", profession: "core.guard", identity: { ageCategory: "middleAged" }, appearance: { enabled: true, intensity: "medium" } };
  const a = engine.generate(request).identity.appearance;
  const b = engine.generate(request).identity.appearance;
  assert.deepEqual(a, b);
  assert.equal(a.generated, true);
  assert.equal(a.traits.length, 3);
  assert.ok(a.traits.every((trait) => trait.id && trait.category && trait.labelKey));
});

test("appearance can be disabled", () => {
  const { engine } = makeEngine();
  const npc = engine.generate({ seed: "no-appearance", appearance: { enabled: false } });
  assert.equal(npc.identity.appearance, null);
});

test("appearance category switches are respected", () => {
  const { engine } = makeEngine();
  const npc = engine.generate({ seed: "appearance-no-scars", identity: { ageCategory: "elder" }, appearance: { enabled: true, intensity: "high", allowScars: false, allowAgeFeatures: false, allowPosture: false } });
  const categories = new Set(npc.identity.appearance.traits.map((trait) => trait.category));
  assert.equal(categories.has("scar"), false);
  assert.equal(categories.has("age"), false);
  assert.equal(categories.has("posture"), false);
});

test("external appearance packs participate in generation", () => {
  const { registry, engine } = makeEngine();
  registry.register("appearancePacks", "appearance-addon", {
    id: "appearance-addon.only",
    traits: [{ id: "appearance-addon.glitter", category: "facial", label: "glittering eyes", weight: 100000 }]
  });
  const npc = engine.generate({ seed: "appearance-addon", appearance: { enabled: true, intensity: "high", allowScars: false, allowAgeFeatures: false, allowPosture: false, allowBodyShape: false } });
  assert.ok(npc.identity.appearance.traits.some((trait) => trait.id === "appearance-addon.glitter"));
});
