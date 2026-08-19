import test from "node:test";
import assert from "node:assert/strict";
import { SeededRandom } from "../../scripts/engine/random/seeded-random.js";

test("same seed produces the same sequence", () => {
  const a = new SeededRandom("stable");
  const b = new SeededRandom("stable");
  assert.deepEqual([a.next(), a.next(), a.int(1, 10)], [b.next(), b.next(), b.int(1, 10)]);
});
