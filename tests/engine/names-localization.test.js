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
function catalog(locale) {
  return JSON.parse(fs.readFileSync(new URL(`../../lang/${locale}.json`, import.meta.url), "utf8"));
}
function localizer(locale) {
  const values = catalog(locale);
  return (key) => values[key] ?? key;
}

test("core name packs are ancestry-aware, locale-capable and gender-aware", () => {
  const { registry } = setup();
  const dwarf = registry.get("namePacks", "core.generic-dwarf");
  assert.deepEqual(dwarf.ancestryIds, ["core.dwarf"]);
  assert.ok(dwarf.supportedLocales.includes("de"));
  assert.ok(Array.isArray(dwarf.given.female));
  assert.ok(Array.isArray(dwarf.given.male));
  assert.ok(dwarf.family.some((entry) => entry.labelKey === "NPCFORGE.Names.Family.Ironhand"));
});

test("semantic speaking surname renders differently in German and English without changing seed data", () => {
  const { engine } = setup();
  const request = { seed: "localized-dwarf-name", ancestry: "core.dwarf", identity: { gender: "male", namePack: "core.generic-dwarf", nameLocale: "de" } };
  const npc = engine.generate(request);
  const de = presentNpc(npc, localizer("de"));
  const en = presentNpc(npc, localizer("en"));
  assert.equal(npc.identity.nameParts.packId, "core.generic-dwarf");
  assert.equal(de.name.split(" ")[0], en.name.split(" ")[0]);
  if (npc.identity.nameParts.family?.labelKey) assert.notEqual(de.name, en.name);
});

test("manual names are preserved verbatim", () => {
  const { engine } = setup();
  const npc = engine.generate({ seed: "manual-name", ancestry: "core.dwarf", identity: { name: "Hargun der Alte", generateName: false } });
  assert.equal(npc.identity.name, "Hargun der Alte");
  assert.equal(npc.identity.nameParts.manual, "Hargun der Alte");
});

test("external localized name packs participate through the same registry", () => {
  const { registry, engine } = setup();
  registry.register("namePacks", "addon", {
    id: "addon.test-names",
    labelKey: "ADDON.Names.Test",
    ancestryIds: ["core.human"],
    supportedLocales: ["de"],
    given: { neutral: ["Testa"] },
    family: [{ id: "sprech", labelKey: "ADDON.Family.Sprech", fallback: "Speaker" }],
    weight: 100
  });
  const npc = engine.generate({ seed: "addon-name", ancestry: "core.human", identity: { gender: "nonbinary", namePack: "addon.test-names", nameLocale: "de" } });
  assert.equal(npc.identity.nameParts.packId, "addon.test-names");
  assert.equal(npc.identity.nameParts.given.literal, "Testa");
});
