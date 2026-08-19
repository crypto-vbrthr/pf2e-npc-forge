import test from "node:test";
import assert from "node:assert/strict";
import { WeightedResolver } from "../../scripts/engine/resolver/weighted-resolver.js";

test("weighted resolver ignores zero-weight entries", () => {
  const resolver = new WeightedResolver({ next: () => 0.999 });
  const result = resolver.resolve([{ id: "a", weight: 0 }, { id: "b", weight: 2 }]);
  assert.equal(result.id, "b");
});
