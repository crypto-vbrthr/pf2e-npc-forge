import test from "node:test";
import assert from "node:assert/strict";
import { ContentRegistry } from "../../scripts/engine/content/content-registry.js";
import { registerCoreContent } from "../../scripts/engine/content/core-content.js";
import { NpcEngine } from "../../scripts/engine/npc-engine.js";
import { buildBackground } from "../../scripts/engine/builders/background-builder.js";
import { WeightedResolver } from "../../scripts/engine/resolver/weighted-resolver.js";
import { SeededRandom } from "../../scripts/engine/random/seeded-random.js";

function engine() {
  const registry = new ContentRegistry();
  registerCoreContent(registry);
  return { registry, engine: new NpcEngine({ registry }) };
}

test("background, social context and relationships are deterministic and structured", () => {
  const { engine: npcEngine } = engine();
  const request = { seed: "social-structure", level: 5, profession: "core.guard", classProfile: "core.fighter", background: { intensity: "high" } };
  const a = npcEngine.generate(request);
  const b = npcEngine.generate(request);
  assert.deepEqual(a.biography, b.biography);
  assert.deepEqual(a.socialContext, b.socialContext);
  assert.deepEqual(a.relationships, b.relationships);
  assert.equal(a.biography.generated, true);
  assert.ok(a.biography.origin?.id);
  assert.ok(a.biography.currentProblem?.id);
  assert.ok(a.socialContext.standing?.id);
  assert.equal(a.relationships.length, 3);
  for (const relationship of a.relationships) {
    assert.ok(relationship.typeId);
    assert.ok(relationship.reciprocalTypeId);
    assert.equal(relationship.target.kind, "unresolved-npc");
    assert.equal(relationship.target.actorUuid, null);
  }
});

test("background generation can be disabled or selectively reduced", () => {
  const { engine: npcEngine } = engine();
  const disabled = npcEngine.generate({ seed: "background-off", background: { enabled: false } });
  assert.equal(disabled.biography, null);
  assert.equal(disabled.socialContext, null);
  assert.deepEqual(disabled.relationships, []);

  const reduced = npcEngine.generate({ seed: "background-reduced", background: { allowPrivateHooks: false, generateRelationships: false, generateSocialContext: false } });
  assert.equal(reduced.biography.privateHook, null);
  assert.equal(reduced.socialContext, null);
  assert.deepEqual(reduced.relationships, []);
});

test("relationshipCount overrides intensity within the supported range", () => {
  const { engine: npcEngine } = engine();
  const npc = npcEngine.generate({ seed: "relationship-count", background: { intensity: "low", relationshipCount: 4 } });
  assert.equal(npc.relationships.length, 4);
});

test("external background and relationship packs participate in generation", () => {
  const registry = new ContentRegistry();
  registry.register("backgroundPacks", "addon", {
    id: "addon.backgrounds",
    entries: [
      { id: "addon.origin", category: "origin", label: "Addon origin" },
      { id: "addon.formative", category: "formative", label: "Addon formative" },
      { id: "addon.situation", category: "currentSituation", label: "Addon situation" },
      { id: "addon.problem", category: "currentProblem", label: "Addon problem" },
      { id: "addon.private", category: "privateHook", label: "Addon private", visibility: "private" },
      { id: "addon.standing", category: "standing", label: "Addon standing" },
      { id: "addon.community", category: "communityRole", label: "Addon community" },
      { id: "addon.reputation", category: "reputation", label: "Addon reputation" }
    ]
  });
  registry.register("relationshipPacks", "addon", {
    id: "addon.relationships",
    relationships: [{ id: "addon.friend", category: "friendship", label: "Addon friend", reciprocalTypeId: "addon.friend" }]
  });
  const resolver = new WeightedResolver(new SeededRandom("external-background"));
  const result = buildBackground({ request: { intensity: "medium" }, resolver, registry, profession: { id: "x", tags: [] }, classProfile: { id: "y", tags: [] }, role: { id: "z", tags: [] }, age: { category: "adult" } });
  assert.equal(result.biography.origin.id, "addon.origin");
  assert.equal(result.socialContext.reputation.id, "addon.reputation");
  assert.equal(result.relationships[0].typeId, "addon.friend");
});
