import test from "node:test";
import assert from "node:assert/strict";
import { ContentRegistry } from "../../scripts/engine/content/content-registry.js";
import { registerCoreContent } from "../../scripts/engine/content/core-content.js";
import { NpcEngine } from "../../scripts/engine/npc-engine.js";
import { Pf2eDocumentAdapter } from "../../scripts/adapters/pf2e-document-adapter.js";
import { NpcForgeApi } from "../../scripts/api/public-api.js";

test("public API exposes stable baseline capabilities and registrations", () => {
  const registry = new ContentRegistry(); registerCoreContent(registry);
  const api = new NpcForgeApi({ engine: new NpcEngine({ registry }), registry, documents: new Pf2eDocumentAdapter(), integrations: {}, openApplication: () => null });
  assert.equal(api.apiVersion, "1.0.0");
  assert.equal(api.schemaVersion, 12);
  assert.equal(api.capabilities.has("embedded-editor"), true);
  assert.ok(api.capabilities.has("editor-session-api"));
  assert.ok(api.capabilities.has("editor-section-reroll"));
  assert.ok(api.capabilities.has("host-action-bar"));
  assert.equal(api.capabilities.has("experimental-editor-session"), false);
  assert.ok(api.capabilities.has("content-namespace-enforcement"));
  assert.ok(api.capabilities.has("level-scaled-fundamental-runes"));
  assert.ok(api.capabilities.has("shield-reinforcing-runes"));
  api.content.registerProfession("addon", { id: "addon.scribe", parentId: "core.profession-category.civic", weight: 1 });
  assert.equal(api.content.get("professions", "addon.scribe").sourceModule, "addon");
});


test("external modules can register ancestry profiles through the public API", () => {
  const registry = new ContentRegistry(); registerCoreContent(registry);
  const api = new NpcForgeApi({ engine: new NpcEngine({ registry }), registry, documents: new Pf2eDocumentAdapter(), integrations: {}, openApplication: () => null });
  api.content.registerAncestry("ancestry-addon", { id: "ancestry-addon.testfolk", label: "Testfolk", speed: 30, size: "sm", languages: ["common"], weight: 1 });
  assert.equal(api.content.get("ancestries", "ancestry-addon.testfolk").sourceModule, "ancestry-addon");
  assert.ok(api.capabilities.has("ancestry-registration"));
});

test("public API exposes localized name pack registration and discovery", () => {
  const registry = new ContentRegistry(); registerCoreContent(registry);
  const api = new NpcForgeApi({ engine: new NpcEngine({ registry }), registry, documents: new Pf2eDocumentAdapter(), integrations: {}, openApplication: () => null });
  api.content.registerNamePack("names-addon", { id: "names-addon.de", ancestryIds: ["core.human"], supportedLocales: ["de"], given: ["Ada"], family: [], weight: 1 });
  const german = api.content.listNamePacks({ ancestryId: "core.human", locale: "de" });
  const english = api.content.listNamePacks({ ancestryId: "core.human", locale: "en" });
  assert.ok(german.some((pack) => pack.id === "names-addon.de"));
  assert.ok(!english.some((pack) => pack.id === "names-addon.de"));
  assert.ok(api.capabilities.has("name-pack-registration"));
  assert.ok(api.capabilities.has("localized-name-generation"));
});


test("public API exposes appearance pack registration", () => {
  const registry = new ContentRegistry(); registerCoreContent(registry);
  const api = new NpcForgeApi({ engine: new NpcEngine({ registry }), registry, documents: new Pf2eDocumentAdapter(), integrations: {}, openApplication: () => null });
  api.content.registerAppearancePack("appearance-addon", { id: "appearance-addon.faces", traits: [{ id: "appearance-addon.face", category: "facial", label: "Distinctive face" }] });
  assert.equal(api.content.get("appearancePacks", "appearance-addon.faces").sourceModule, "appearance-addon");
  assert.ok(api.capabilities.has("appearance-pack-registration"));
  assert.ok(api.capabilities.has("appearance-generation"));
});

test("public API exposes personality pack registration and roleplaying capabilities", () => {
  const registry = new ContentRegistry(); registerCoreContent(registry);
  const api = new NpcForgeApi({ engine: new NpcEngine({ registry }), registry, documents: new Pf2eDocumentAdapter(), integrations: {}, openApplication: () => null });
  api.content.registerPersonalityPack("personality-addon", { id: "personality-addon.pack", traits: [{ id: "personality-addon.trait", category: "trait", label: "Distinct" }] });
  assert.equal(api.content.get("personalityPacks", "personality-addon.pack").sourceModule, "personality-addon");
  assert.ok(api.capabilities.has("personality-pack-registration"));
  assert.ok(api.capabilities.has("personality-generation"));
  assert.ok(api.capabilities.has("roleplaying-kit"));
});

test("public API exposes synchronous integration status and async diagnostics", async () => {
  const registry = new ContentRegistry(); registerCoreContent(registry);
  const api = new NpcForgeApi({ engine: new NpcEngine({ registry }), registry, documents: new Pf2eDocumentAdapter(), integrations: {}, openApplication: () => null });
  assert.equal(typeof api.integrations.status, "function");
  assert.equal(typeof api.integrations.inspect, "function");
  assert.ok(api.capabilities.has("integration-diagnostics"));
  const details = await api.integrations.inspect({ level: 5 });
  assert.equal(details.afflictionForge.ready, false);
  assert.equal(details.itemForge.ready, false);
});


test("public API exposes background and relationship pack registration", () => {
  const registry = new ContentRegistry(); registerCoreContent(registry);
  const api = new NpcForgeApi({ engine: new NpcEngine({ registry }), registry, documents: new Pf2eDocumentAdapter(), integrations: {}, openApplication: () => null });
  api.content.registerBackgroundPack("social-addon", { id: "social-addon.backgrounds", entries: [{ id: "social-addon.origin.test", category: "origin", label: "Elsewhere" }] });
  api.content.registerRelationshipPack("social-addon", { id: "social-addon.relationships", relationships: [{ id: "social-addon.relationship.friend", category: "friendship", label: "Friend", reciprocalTypeId: "social-addon.relationship.friend" }] });
  assert.equal(api.content.get("backgroundPacks", "social-addon.backgrounds").sourceModule, "social-addon");
  assert.equal(api.content.get("relationshipPacks", "social-addon.relationships").sourceModule, "social-addon");
  assert.ok(api.capabilities.has("background-pack-registration"));
  assert.ok(api.capabilities.has("relationship-pack-registration"));
  assert.ok(api.capabilities.has("structured-relationships"));
});
