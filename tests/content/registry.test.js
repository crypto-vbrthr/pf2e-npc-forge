import test from "node:test";
import assert from "node:assert/strict";
import { ContentRegistry } from "../../scripts/engine/content/content-registry.js";

test("external modules can register profession content in their own namespace", () => {
  const registry = new ContentRegistry();
  registry.register("professionCategories", "test-addon", { id: "test-addon.profession-category.criminal", weight: 1 });
  registry.register("professions", "test-addon", { id: "test-addon.thief", parentId: "test-addon.profession-category.criminal", weight: 1 });
  assert.equal(registry.get("professions", "test-addon.thief").sourceModule, "test-addon");
  assert.deepEqual(registry.children("professions", "test-addon.profession-category.criminal").map((p) => p.id), ["test-addon.thief"]);
});

test("duplicate ids are rejected", () => {
  const registry = new ContentRegistry();
  registry.register("roles", "addon", { id: "addon.role" });
  assert.throws(() => registry.register("roles", "addon", { id: "addon.role" }), /Duplicate/);
});

test("external modules cannot claim the core namespace", () => {
  const registry = new ContentRegistry();
  assert.throws(
    () => registry.register("roles", "hostile-addon", { id: "core.veteran" }),
    /outside the namespace owned by hostile-addon/
  );
});

test("external modules cannot claim another add-on namespace", () => {
  const registry = new ContentRegistry();
  assert.throws(
    () => registry.register("roles", "addon-a", { id: "addon-b.role" }),
    /outside the namespace owned by addon-a/
  );
});
