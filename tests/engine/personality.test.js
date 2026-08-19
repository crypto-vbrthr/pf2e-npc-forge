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

test("personality generation is deterministic and produces a roleplaying kit", () => {
  const { engine } = makeEngine();
  const request = { seed: "personality-guard-01", profession: "core.guard", classProfile: "core.fighter", role: "core.veteran", personality: { enabled: true, intensity: "medium", allowSecrets: true } };
  const a = engine.generate(request).personality;
  const b = engine.generate(request).personality;
  assert.deepEqual(a, b);
  assert.equal(a.generated, true);
  assert.equal(a.traits.length, 2);
  assert.ok(a.demeanor?.id);
  assert.ok(a.motivation?.id);
  assert.ok(a.flaw?.id);
  assert.ok(a.quirk?.id);
  assert.ok(a.secret?.id);
  assert.ok(a.roleplaying.firstImpressionKey);
  assert.ok(a.roleplaying.conversationKey);
  assert.ok(a.roleplaying.underPressureKey);
  assert.ok(a.roleplaying.drivingGoalKey);
});

test("personality can be disabled and secrets can be excluded", () => {
  const { engine } = makeEngine();
  assert.equal(engine.generate({ seed: "no-personality", personality: { enabled: false } }).personality, null);
  const npc = engine.generate({ seed: "no-secret", personality: { enabled: true, allowSecrets: false } });
  assert.equal(npc.personality.secret, null);
});

test("personality intensity controls the number of character traits", () => {
  const { engine } = makeEngine();
  assert.equal(engine.generate({ seed: "p-low", personality: { intensity: "low" } }).personality.traits.length, 1);
  assert.equal(engine.generate({ seed: "p-high", personality: { intensity: "high" } }).personality.traits.length, 3);
});

test("external personality packs participate in generation", () => {
  const { registry, engine } = makeEngine();
  registry.register("personalityPacks", "personality-addon", {
    id: "personality-addon.pack",
    weight: 100000,
    traits: [
      { id: "personality-addon.demeanor", category: "demeanor", label: "Distinct demeanor", weight: 100000 },
      { id: "personality-addon.trait", category: "trait", label: "Distinct trait", weight: 100000 },
      { id: "personality-addon.motivation", category: "motivation", label: "Distinct motive", weight: 100000 },
      { id: "personality-addon.flaw", category: "flaw", label: "Distinct flaw", weight: 100000 },
      { id: "personality-addon.quirk", category: "quirk", label: "Distinct quirk", weight: 100000 },
      { id: "personality-addon.secret", category: "secret", label: "Distinct secret", weight: 100000 }
    ]
  });
  const npc = engine.generate({ seed: "external-personality", personality: { enabled: true, intensity: "low" } });
  assert.equal(npc.personality.demeanor.id, "personality-addon.demeanor");
  assert.equal(npc.personality.traits[0].id, "personality-addon.trait");
});
