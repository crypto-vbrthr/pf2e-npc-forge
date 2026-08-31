import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { ContentRegistry } from "../../scripts/engine/content/content-registry.js";
import { registerCoreContent } from "../../scripts/engine/content/core-content.js";
import { NpcEngine } from "../../scripts/engine/npc-engine.js";
import { presentNpc } from "../../scripts/ui/npc-presentation.js";

function setup() {
  const registry = new ContentRegistry();
  registerCoreContent(registry);
  return { registry, engine: new NpcEngine({ registry }) };
}

function registerCultures(registry) {
  registry.register("nameCultures", "names-addon", {
    id: "names-addon.varisian",
    labelKey: "NAMESADDON.Culture.Varisian",
    ancestryIds: ["core.human"],
    supportedLocales: ["en", "de"],
    weight: 10
  });
  registry.register("nameCultures", "names-addon", {
    id: "names-addon.chelish",
    labelKey: "NAMESADDON.Culture.Chelish",
    ancestryIds: ["core.human"],
    supportedLocales: ["en", "de"],
    weight: 5
  });
}

function catalog(locale) {
  const base = JSON.parse(fs.readFileSync(new URL(`../../lang/${locale}.json`, import.meta.url), "utf8"));
  return {
    ...base,
    "NAMESADDON.Culture.Varisian": locale === "de" ? "Varisisch" : "Varisian",
    "NAMESADDON.Culture.Chelish": locale === "de" ? "Chelisch" : "Chelish",
    "NAMESADDON.Component.Iron": locale === "de" ? "Eisen" : "Iron",
    "NAMESADDON.Component.Hand": locale === "de" ? "hand" : "hand"
  };
}

function localizer(locale) {
  const values = catalog(locale);
  return (key) => values[key] ?? key;
}

test("fixed name culture selects a matching ancestry/culture pack", () => {
  const { registry, engine } = setup();
  registerCultures(registry);
  registry.register("namePacks", "names-addon", {
    id: "names-addon.varisian-human",
    ancestryIds: ["core.human"],
    cultureIds: ["names-addon.varisian"],
    supportedLocales: ["en", "de"],
    given: { female: ["Mirela"], male: ["Luka"], neutral: ["Sasha"] },
    family: ["Vasilev"],
    weight: 100
  });

  const npc = engine.generate({
    seed: "culture-fixed",
    ancestry: "core.human",
    identity: { gender: "male", nameCulture: "names-addon.varisian", nameLocale: "en" }
  });
  assert.equal(npc.identity.nameCulture.id, "names-addon.varisian");
  assert.equal(npc.identity.nameParts.cultureId, "names-addon.varisian");
  assert.equal(npc.identity.nameParts.packId, "names-addon.varisian-human");
  assert.equal(npc.identity.nameParts.fallback, null);
});

test("culture selection falls back to a universal ancestry pack without crossing ancestry", () => {
  const { registry, engine } = setup();
  registerCultures(registry);
  const npc = engine.generate({
    seed: "culture-fallback",
    ancestry: "core.human",
    identity: { gender: "female", nameCulture: "names-addon.varisian", nameLocale: "en" }
  });
  assert.equal(npc.identity.nameCulture.id, "names-addon.varisian");
  assert.equal(npc.identity.nameParts.packId, "core.generic-human");
  assert.equal(npc.identity.nameParts.fallback, "universal-ancestry-pack");
});

test("automatic cultural resolution is deterministic for a seed", () => {
  const { registry, engine } = setup();
  registerCultures(registry);
  registry.register("namePacks", "names-addon", {
    id: "names-addon.varisian-human",
    ancestryIds: ["core.human"], cultureIds: ["names-addon.varisian"], supportedLocales: ["en", "de"], given: ["Luka"], family: [], weight: 10
  });
  registry.register("namePacks", "names-addon", {
    id: "names-addon.chelish-human",
    ancestryIds: ["core.human"], cultureIds: ["names-addon.chelish"], supportedLocales: ["en", "de"], given: ["Lucia"], family: [], weight: 10
  });
  const request = { seed: "automatic-culture", ancestry: "core.human", identity: { nameLocale: "en" } };
  const a = engine.generate(request);
  const b = engine.generate(request);
  assert.equal(a.identity.nameCulture.id, b.identity.nameCulture.id);
  assert.equal(a.identity.nameParts.packId, b.identity.nameParts.packId);
  assert.deepEqual(a.identity.nameParts, b.identity.nameParts);
});

test("a fixed universal pack does not acquire an unrelated automatic culture", () => {
  const { registry, engine } = setup();
  registerCultures(registry);
  const npc = engine.generate({
    seed: "fixed-universal",
    ancestry: "core.human",
    identity: { namePack: "core.generic-human", nameLocale: "en" }
  });
  assert.equal(npc.identity.nameCulture, null);
  assert.equal(npc.identity.nameParts.cultureId, null);
  assert.equal(npc.identity.nameParts.packId, "core.generic-human");
});

test("component generators create seed-stable semantic names that can localize their parts", () => {
  const { registry, engine } = setup();
  registerCultures(registry);
  registry.register("namePacks", "names-addon", {
    id: "names-addon.composite-human",
    ancestryIds: ["core.human"],
    cultureIds: ["names-addon.varisian"],
    supportedLocales: ["en", "de"],
    generator: {
      type: "components",
      patterns: [["root", "suffix"]],
      separator: "",
      components: {
        root: [{ id: "iron", labelKey: "NAMESADDON.Component.Iron", fallback: "Iron" }],
        suffix: [{ id: "hand", labelKey: "NAMESADDON.Component.Hand", fallback: "hand" }]
      }
    },
    family: [],
    weight: 100
  });

  const npc = engine.generate({
    seed: "composite-name",
    ancestry: "core.human",
    identity: { namePack: "names-addon.composite-human", nameLocale: "de" }
  });
  assert.equal(npc.identity.nameParts.given.composite, true);
  assert.equal(presentNpc(npc, localizer("en")).name, "Ironhand");
  assert.equal(presentNpc(npc, localizer("de")).name, "Eisenhand");
});
