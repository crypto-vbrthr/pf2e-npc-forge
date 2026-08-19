import test from "node:test";
import assert from "node:assert/strict";
import { ContentRegistry } from "../../scripts/engine/content/content-registry.js";
import { registerCoreContent } from "../../scripts/engine/content/core-content.js";

test("core profession hierarchy is valid", () => {
  const registry = new ContentRegistry();
  registerCoreContent(registry);
  assert.deepEqual(registry.validateHierarchy("professions", { parentType: "professionCategories" }), { valid: true, errors: [] });
});
