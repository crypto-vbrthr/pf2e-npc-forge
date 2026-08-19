import test from "node:test";
import assert from "node:assert/strict";
import { ContentRegistry } from "../../scripts/engine/content/content-registry.js";
import { registerCoreContent } from "../../scripts/engine/content/core-content.js";
import { NpcEngine } from "../../scripts/engine/npc-engine.js";
import { Pf2eDocumentAdapter } from "../../scripts/adapters/pf2e-document-adapter.js";

test("adapter creates a serializable PF2e NPC actor source with stats, skills, weapon and matching melee entry", () => {
  const registry = new ContentRegistry(); registerCoreContent(registry);
  const npc = new NpcEngine({ registry }).generate({ seed: "adapter", level: 3, profession: "core.guard", role: "core.ordinary" });
  const source = new Pf2eDocumentAdapter().toActorSource(npc);
  assert.equal(source.type, "npc");
  assert.equal(source.system.details.level.value, 3);
  assert.equal(source.system.abilities.str.mod, npc.statistics.attributes.str);
  assert.equal(source.system.attributes.ac.value, npc.statistics.ac);
  assert.equal(source.system.skills.athletics.base, npc.skills.find((skill) => skill.slug === "athletics").modifier);
  assert.match(source.system.details.publicNotes, /Legal Lore/);
  assert.ok(source.items.some((item) => item.type === "weapon" && item.name === "Spear"));
  assert.ok(source.items.some((item) => item.type === "melee" && item.name === "Spear"));
  assert.doesNotThrow(() => JSON.stringify(source));
});
