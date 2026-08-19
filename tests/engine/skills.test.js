import test from "node:test";
import assert from "node:assert/strict";
import { ContentRegistry } from "../../scripts/engine/content/content-registry.js";
import { registerCoreContent } from "../../scripts/engine/content/core-content.js";
import { NpcEngine } from "../../scripts/engine/npc-engine.js";

function generate(profession, role = "core.ordinary") {
  const registry = new ContentRegistry(); registerCoreContent(registry);
  return new NpcEngine({ registry }).generate({ seed: `skill-${profession}-${role}`, level: 4, profession, role });
}

test("profession biases add relevant skills and lore", () => {
  const npc = generate("core.blacksmith");
  const bySlug = Object.fromEntries(npc.skills.map((skill) => [skill.slug, skill]));
  assert.equal(bySlug.crafting.tier, "high");
  assert.equal(bySlug.crafting.modifier, 12);
  assert.equal(bySlug["blacksmithing-lore"].type, "lore");
  assert.equal(bySlug["blacksmithing-lore"].modifier, 12);
  assert.equal(bySlug.athletics.modifier, 12, "fighter high Athletics remains stronger than profession average");
});

test("criminal professions produce distinct skill packages", () => {
  const thief = generate("core.thief");
  const highwayman = generate("core.highwayman");
  assert.ok(thief.skills.some((skill) => skill.slug === "thievery" && skill.tier === "high"));
  assert.ok(thief.skills.some((skill) => skill.slug === "stealth" && skill.tier === "high"));
  assert.ok(highwayman.skills.some((skill) => skill.slug === "survival"));
  assert.ok(highwayman.skills.some((skill) => skill.slug === "roads-lore"));
});

test("veteran role raises generated skill modifiers by one", () => {
  const ordinary = generate("core.guard", "core.ordinary");
  const veteran = generate("core.guard", "core.veteran");
  const ordinaryAthletics = ordinary.skills.find((skill) => skill.slug === "athletics").modifier;
  const veteranAthletics = veteran.skills.find((skill) => skill.slug === "athletics").modifier;
  assert.equal(veteranAthletics, ordinaryAthletics + 1);
});
