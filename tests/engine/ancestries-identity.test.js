import test from "node:test";
import assert from "node:assert/strict";
import { ContentRegistry } from "../../scripts/engine/content/content-registry.js";
import { registerCoreContent } from "../../scripts/engine/content/core-content.js";
import { NpcEngine } from "../../scripts/engine/npc-engine.js";

function setup() {
  const registry = new ContentRegistry();
  registerCoreContent(registry);
  return { registry, engine: new NpcEngine({ registry }) };
}

const CORE_ANCESTRIES = [
  "elf", "gnome", "goblin", "halfling", "leshy", "human", "orc", "dwarf",
  "catfolk", "hobgoblin", "lizardfolk", "kholo", "kobold", "tengu", "tripkee", "ratfolk"
];

test("core content registers all sixteen Player Core ancestries", () => {
  const { registry } = setup();
  const ids = new Set(registry.list("ancestries").map((entry) => entry.id));
  for (const slug of CORE_ANCESTRIES) assert.ok(ids.has(`core.${slug}`), `missing core.${slug}`);
  assert.equal(registry.list("ancestries").length, 16);
});

test("identity generation is deterministic and ancestry-aware", () => {
  const { engine } = setup();
  const request = { seed: "identity-dwarf", ancestry: "core.dwarf", identity: { gender: "female", ageCategory: "elder" } };
  const a = engine.generate(request);
  const b = engine.generate(request);
  assert.equal(a.identity.gender, "female");
  assert.equal(a.identity.age.category, "elder");
  assert.equal(a.identity.age.years, b.identity.age.years);
  assert.ok(a.identity.age.years >= 251);
  assert.equal(a.identity.size, "med");
  assert.ok(a.identity.languages.includes("dwarven"));
  assert.ok(a.identity.senses.includes("darkvision"));
});

test("ancestry profiles control size, speed and vision", () => {
  const { engine } = setup();
  const elf = engine.generate({ seed: "elf-id", ancestry: "core.elf" });
  const goblin = engine.generate({ seed: "goblin-id", ancestry: "core.goblin" });
  assert.equal(elf.statistics.speed, 30);
  assert.equal(elf.identity.size, "med");
  assert.ok(elf.identity.senses.includes("low-light-vision"));
  assert.equal(goblin.identity.size, "sm");
  assert.ok(goblin.identity.senses.includes("darkvision"));
});

test("intrinsic ancestry natural attacks are generated as NPC attacks", () => {
  const { engine } = setup();
  const tengu = engine.generate({ seed: "tengu-beak", ancestry: "core.tengu", level: 4 });
  const beak = tengu.attacks.find((attack) => attack.sourceType === "ancestry");
  assert.ok(beak);
  assert.equal(beak.labelKey, "NPCFORGE.AncestryAttacks.Beak");
  assert.equal(beak.damage.type, "piercing");
  assert.ok(beak.traits.includes("unarmed"));
});
