import test from "node:test";
import assert from "node:assert/strict";
import { ContentRegistry } from "../../scripts/engine/content/content-registry.js";
import { registerCoreContent } from "../../scripts/engine/content/core-content.js";
import { NpcEngine } from "../../scripts/engine/npc-engine.js";

test("release generation matrix stays valid, serializable and deterministic", () => {
  const registry = new ContentRegistry();
  registerCoreContent(registry);
  const engine = new NpcEngine({ registry });
  const ancestries = registry.list("ancestries").map((entry) => entry.id);
  const classes = registry.list("classProfiles").map((entry) => entry.id);
  const professions = registry.list("professions").map((entry) => entry.id);
  const roles = registry.list("roles").map((entry) => entry.id);
  const levels = [-1, 1, 5, 10, 15, 20, 24];

  let index = 0;
  for (const level of levels) {
    for (const ancestry of ancestries) {
      for (const classProfile of classes) {
        const request = {
          seed: `rc-matrix:${index}`,
          level,
          ancestry,
          classProfile,
          profession: professions[(index * 7) % professions.length],
          role: roles[index % roles.length],
          inventory: { enabled: true, scaleFundamentalRunes: true },
          appearance: { enabled: true },
          personality: { enabled: true },
          background: { enabled: true, generateRelationships: true, generateSocialContext: true }
        };
        const first = engine.generate(request);
        const second = engine.generate(request);
        const validation = engine.validate(first);
        assert.equal(validation.valid, true, `${ancestry}/${classProfile}/level ${level}: ${validation.errors.join("; ")}`);
        assert.deepEqual(first, second, `${ancestry}/${classProfile}/level ${level} must remain deterministic`);
        assert.doesNotThrow(() => JSON.stringify(first));
        assert.ok(first.attacks.length > 0, `${ancestry}/${classProfile}/level ${level} requires a usable attack`);
        index += 1;
      }
    }
  }

  assert.equal(index, levels.length * ancestries.length * classes.length);
});
