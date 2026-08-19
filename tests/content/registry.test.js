import test from "node:test";
import assert from "node:assert/strict";
import { ContentRegistry } from "../../scripts/engine/content/content-registry.js";

test("external modules can register profession content", () => {
  const registry = new ContentRegistry();
  registry.register("professionCategories", "test-addon", { id: "test.criminal", weight: 1 });
  registry.register("professions", "test-addon", { id: "test.thief", parentId: "test.criminal", weight: 1 });
  assert.equal(registry.get("professions", "test.thief").sourceModule, "test-addon");
  assert.deepEqual(registry.children("professions", "test.criminal").map((p) => p.id), ["test.thief"]);
});

test("duplicate ids are rejected", () => {
  const registry = new ContentRegistry();
  registry.register("roles", "a", { id: "shared.role" });
  assert.throws(() => registry.register("roles", "b", { id: "shared.role" }), /Duplicate/);
});
