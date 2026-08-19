import test from "node:test";
import assert from "node:assert/strict";
import { ContentRegistry } from "../../scripts/engine/content/content-registry.js";
import { registerCoreContent } from "../../scripts/engine/content/core-content.js";
import { NpcEngine } from "../../scripts/engine/npc-engine.js";

test("engine generates deterministic neutral NPCs", () => {
  const registry = new ContentRegistry();
  registerCoreContent(registry);
  const engine = new NpcEngine({ registry });
  const request = { seed: "guard-01", level: 3, ancestry: "core.human", classProfile: "core.fighter", profession: "core.guard" };
  assert.deepEqual(engine.generate(request), engine.generate(request));
});

test("profession category resolves to a concrete child", () => {
  const registry = new ContentRegistry();
  registerCoreContent(registry);
  const engine = new NpcEngine({ registry });
  const npc = engine.generate({ seed: "criminal-01", profession: { mode: "category", id: "core.profession-category.criminal" } });
  assert.ok(["core.thief", "core.highwayman", "core.assassin"].includes(npc.build.profession.id));
});
