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
  assert.ok(api.capabilities.has("embedded-editor"));
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
