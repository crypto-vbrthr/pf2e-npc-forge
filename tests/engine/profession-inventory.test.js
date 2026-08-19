import test from "node:test";
import assert from "node:assert/strict";
import { ContentRegistry } from "../../scripts/engine/content/content-registry.js";
import { registerCoreContent } from "../../scripts/engine/content/core-content.js";
import { NpcEngine } from "../../scripts/engine/npc-engine.js";

function engine() {
  const registry = new ContentRegistry();
  registerCoreContent(registry);
  return { registry, engine: new NpcEngine({ registry }) };
}

test("core profession system provides broad categories and concrete professions", () => {
  const { registry } = engine();
  assert.ok(registry.list("professionCategories").length >= 10);
  assert.ok(registry.list("professions").length >= 20);
  assert.ok(registry.children("professions", "core.profession-category.criminal").some((p) => p.id === "core.smuggler"));
  assert.ok(registry.children("professions", "core.profession-category.artisan").some((p) => p.id === "core.blacksmith"));
});

test("general profession category resolves deterministically to a concrete profession", () => {
  const { engine: npcEngine } = engine();
  const request = { seed: "criminal-category", professionCategory: "core.profession-category.criminal", profession: null };
  const a = npcEngine.generate(request);
  const b = npcEngine.generate(request);
  assert.equal(a.build.profession.id, b.build.profession.id);
  assert.equal(a.build.profession.parentId, "core.profession-category.criminal");
});

test("profession specialization is resolved and can influence skills", () => {
  const { engine: npcEngine } = engine();
  const npc = npcEngine.generate({ seed: "pickpocket", profession: "core.thief", professionSpecialization: "core.thief.pickpocket", level: 4 });
  assert.equal(npc.build.professionSpecialization.id, "core.thief.pickpocket");
  assert.ok(npc.skills.some((skill) => skill.slug === "thievery"));
});

test("profession equipment profiles add compendium-backed non-weapon inventory", () => {
  const { engine: npcEngine } = engine();
  const npc = npcEngine.generate({ seed: "guard-equipment", profession: "core.guard", classProfile: "core.fighter", level: 3 });
  assert.ok(npc.inventory.some((item) => item.type === "armor" && item.compendium?.slug === "chain-shirt"));
  assert.ok(npc.inventory.some((item) => item.type === "shield" && item.compendium?.slug === "steel-shield"));
  assert.ok(npc.inventory.some((item) => item.type === "equipment"));
  assert.ok(npc.attacks.some((attack) => attack.sourceWeaponId === "primary-weapon"));
});

test("external equipment profiles can be attached to external professions", () => {
  const { registry, engine: npcEngine } = engine();
  registry.register("equipmentProfiles", "test-addon", {
    id: "test-addon.clockmaker-kit",
    items: [{ id: "tools", labelKey: "TEST.Tools", slug: "artisans-toolkit", itemType: "equipment", type: "equipment" }]
  });
  registry.register("professions", "test-addon", {
    id: "test-addon.clockmaker",
    parentId: "core.profession-category.artisan",
    label: "Clockmaker",
    skillBias: { crafting: "high" },
    equipmentProfileIds: ["test-addon.clockmaker-kit"],
    weight: 1
  });
  const npc = npcEngine.generate({ seed: "clockmaker", profession: "test-addon.clockmaker" });
  assert.ok(npc.inventory.some((item) => item.compendium?.slug === "artisans-toolkit"));
});
