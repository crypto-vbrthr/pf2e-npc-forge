import test from "node:test";
import assert from "node:assert/strict";
import { ATTRIBUTE_MODIFIERS, PERCEPTION, SKILLS, AC, SAVES, HP, ATTACK_BONUS, midpoint } from "../../scripts/engine/rules/gm-core-tables.js";

test("GM Core benchmark tables cover levels -1 through 24", () => {
  for (const table of [ATTRIBUTE_MODIFIERS, PERCEPTION, SKILLS, AC, SAVES, HP, ATTACK_BONUS]) {
    assert.equal(Object.keys(table).length, 26);
    assert.ok(table[-1]);
    assert.ok(table[24]);
  }
});

test("known benchmark entries remain stable", () => {
  assert.equal(AC[3].high, 19);
  assert.equal(SAVES[10].high, 22);
  assert.equal(PERCEPTION[7].high, 18);
  assert.equal(SKILLS[4].high, 12);
  assert.equal(ATTACK_BONUS[3].high, 12);
  assert.equal(midpoint(HP[8].average), 135);
});
