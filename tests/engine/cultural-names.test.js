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


test("explicit-only cultures remain selectable but are ignored by automatic resolution", () => {
  const { registry, engine } = setup();
  registry.register("nameCultures", "names-addon", {
    id: "names-addon.kyonin",
    labelKey: "NAMESADDON.Culture.Kyonin",
    ancestryIds: ["core.elf"],
    automaticAncestryIds: [],
    supportedLocales: ["en", "de"],
    weight: 1000
  });
  registry.register("namePacks", "names-addon", {
    id: "names-addon.kyonin-elf",
    ancestryIds: ["core.elf"],
    cultureIds: ["names-addon.kyonin"],
    supportedLocales: ["en", "de"],
    given: ["KyoninName"],
    family: [],
    weight: 1000
  });

  const automatic = engine.generate({
    seed: "explicit-only-auto",
    ancestry: "core.elf",
    identity: { nameLocale: "en" }
  });
  assert.equal(automatic.identity.nameCulture, null);
  assert.equal(automatic.identity.nameParts.packId, "core.generic-elf");

  const fixed = engine.generate({
    seed: "explicit-only-fixed",
    ancestry: "core.elf",
    identity: { nameCulture: "names-addon.kyonin", nameLocale: "en" }
  });
  assert.equal(fixed.identity.nameCulture.id, "names-addon.kyonin");
  assert.equal(fixed.identity.nameParts.packId, "names-addon.kyonin-elf");
});

test("automaticAncestryIds can allow automatic culture resolution for one ancestry but not another", () => {
  const { registry, engine } = setup();
  registry.register("nameCultures", "names-addon", {
    id: "names-addon.taldan",
    labelKey: "NAMESADDON.Culture.Taldan",
    ancestryIds: ["core.human", "core.tengu"],
    automaticAncestryIds: ["core.human"],
    supportedLocales: ["en", "de"],
    weight: 1000
  });
  registry.register("namePacks", "names-addon", {
    id: "names-addon.taldan-human",
    ancestryIds: ["core.human"],
    cultureIds: ["names-addon.taldan"],
    supportedLocales: ["en", "de"],
    given: ["TaldanHuman"], family: [], weight: 1000
  });
  registry.register("namePacks", "names-addon", {
    id: "names-addon.taldan-tengu",
    ancestryIds: ["core.tengu"],
    cultureIds: ["names-addon.taldan"],
    supportedLocales: ["en", "de"],
    given: ["TaldanTengu"], family: [], weight: 1000
  });

  const human = engine.generate({ seed: "taldan-human-auto", ancestry: "core.human", identity: { nameLocale: "en" } });
  assert.equal(human.identity.nameCulture.id, "names-addon.taldan");
  assert.equal(human.identity.nameParts.packId, "names-addon.taldan-human");

  const tengu = engine.generate({ seed: "taldan-tengu-auto", ancestry: "core.tengu", identity: { nameLocale: "en" } });
  assert.equal(tengu.identity.nameCulture, null);
  assert.equal(tengu.identity.nameParts.packId, "core.generic-tengu");

  const fixedTengu = engine.generate({
    seed: "taldan-tengu-fixed",
    ancestry: "core.tengu",
    identity: { nameCulture: "names-addon.taldan", nameLocale: "en" }
  });
  assert.equal(fixedTengu.identity.nameCulture.id, "names-addon.taldan");
  assert.equal(fixedTengu.identity.nameParts.packId, "names-addon.taldan-tengu");
});

test("1.1.0 cultures without automaticAncestryIds remain automatically eligible", () => {
  const { registry, engine } = setup();
  registry.register("nameCultures", "legacy-names", {
    id: "legacy-names.human-culture",
    ancestryIds: ["core.human"],
    supportedLocales: ["en"],
    weight: 1000
  });
  registry.register("namePacks", "legacy-names", {
    id: "legacy-names.human-pack",
    ancestryIds: ["core.human"],
    cultureIds: ["legacy-names.human-culture"],
    supportedLocales: ["en"],
    given: ["Legacy"], family: [], weight: 1000
  });

  const npc = engine.generate({ seed: "legacy-auto-culture", ancestry: "core.human", identity: { nameLocale: "en" } });
  assert.equal(npc.identity.nameCulture.id, "legacy-names.human-culture");
  assert.equal(npc.identity.nameParts.packId, "legacy-names.human-pack");
});

test("when no culture resolves, universal packs outrank regional packs", () => {
  const { registry, engine } = setup();
  registry.register("nameCultures", "names-addon", {
    id: "names-addon.belkzen",
    ancestryIds: ["core.orc"],
    automaticAncestryIds: [],
    supportedLocales: ["en"],
    weight: 1000
  });
  registry.register("namePacks", "names-addon", {
    id: "names-addon.belkzen-orc",
    ancestryIds: ["core.orc"],
    cultureIds: ["names-addon.belkzen"],
    supportedLocales: ["en"],
    given: ["Belkzen"], family: [], weight: 100000
  });

  for (let i = 0; i < 20; i += 1) {
    const npc = engine.generate({ seed: `universal-preservation-${i}`, ancestry: "core.orc", identity: { nameLocale: "en" } });
    assert.equal(npc.identity.nameCulture, null);
    assert.equal(npc.identity.nameParts.packId, "core.generic-orc");
  }
});
