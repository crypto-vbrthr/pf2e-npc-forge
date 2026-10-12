import test from "node:test";
import assert from "node:assert/strict";
import { ContentRegistry } from "../../scripts/engine/content/content-registry.js";
import { registerCoreContent } from "../../scripts/engine/content/core-content.js";
import { NpcEngine } from "../../scripts/engine/npc-engine.js";
import { CustomNameLibrary, CUSTOM_NAME_MODULE, emptyCustomNameLibrary, parseNameParts } from "../../scripts/custom-names/custom-name-library.js";

function setup() {
  const registry = new ContentRegistry();
  registerCoreContent(registry);
  let persisted = emptyCustomNameLibrary();
  globalThis.game = { user: { isGM: true } };
  const library = new CustomNameLibrary({ registry, getSetting: () => persisted, setSetting: async (value) => { persisted = value; } });
  return { library, registry, engine: new NpcEngine({ registry }), getSaved: () => persisted };
}

const culture = { id: "northland", title: "Northland", ancestryIds: ["core.human"], automatic: false };
function pack(overrides = {}) {
  return {
    id: "northland-people", title: "Northlanders", cultureId: "northland", ancestryIds: ["core.human"],
    given: { male: ["Oskar"], female: ["Hilda"], neutral: ["Mika"] },
    family: ["Hearth"], epithets: [], ...overrides
  };
}

test("custom name cultures and name packs persist and resolve via the real NPC engine", async () => {
  const { library, registry, engine, getSaved } = setup();
  await library.saveCulture(culture);
  await library.savePack(pack());
  assert.equal(getSaved().cultures[0].title, "Northland");
  assert.equal(registry.list("namePacks").filter((entry) => entry.sourceModule === CUSTOM_NAME_MODULE).length, 1);
  for (const [gender, expected] of [["male", "Oskar"], ["female", "Hilda"], ["nonbinary", "Mika"]]) {
    const npc = engine.generate({ seed: `user-${gender}`, ancestry: "core.human", identity: { gender, nameCulture: `${CUSTOM_NAME_MODULE}.culture.northland`, nameLocale: "de" } });
    assert.ok(gender === "male" ? ["Oskar Hearth", "Mika Hearth"].includes(npc.identity.name)
      : gender === "female" ? ["Hilda Hearth", "Mika Hearth"].includes(npc.identity.name)
        : npc.identity.name === `${expected} Hearth`);
    assert.equal(npc.identity.nameParts.packId, `${CUSTOM_NAME_MODULE}.pack.northland-people`);
  }
});

test("user cultures are selectable but not automatically imposed unless requested", async () => {
  const { library, engine } = setup();
  await library.saveCulture(culture);
  await library.savePack(pack());
  const automatic = engine.generate({ seed: "automatic-custom", ancestry: "core.human", identity: { nameLocale: "de" } });
  assert.equal(automatic.identity.nameCulture, null);
  await library.saveCulture({ ...culture, automatic: true });
  const automatic2 = engine.generate({ seed: "automatic-custom", ancestry: "core.human", identity: { nameLocale: "de" } });
  assert.equal(automatic2.identity.nameCulture.id, `${CUSTOM_NAME_MODULE}.culture.northland`);
});

test("gendered given-name components and family components are generated reproducibly", async () => {
  const { library, engine } = setup();
  await library.saveCulture(culture);
  await library.savePack(pack({
    given: { male: [], female: [], neutral: [] }, family: [],
    composites: {
      male: { prefix: ["Thor"], suffix: ["vin"] },
      female: { prefix: ["Al"], suffix: ["dara"] },
      neutral: { prefix: ["Iri"], suffix: ["len"] },
      family: { prefix: ["Frost"], suffix: ["guard"] }
    }
  }));
  for (const [gender, name] of [["male", "Thorvin Frostguard"], ["female", "Aldara Frostguard"], ["nonbinary", "Irilen Frostguard"]]) {
    const request = { seed: `parts-${gender}`, ancestry: "core.human", identity: { gender, nameCulture: `${CUSTOM_NAME_MODULE}.culture.northland` } };
    assert.equal(engine.generate(request).identity.name, name);
    assert.equal(engine.generate(request).identity.name, name);
  }
});

test("updating and deleting a culture cleans its registered packs without affecting other providers", async () => {
  const { library, registry } = setup();
  await library.saveCulture(culture);
  await library.savePack(pack());
  await library.saveCulture({ ...culture, title: "Frostfell" });
  assert.equal(registry.get("nameCultures", `${CUSTOM_NAME_MODULE}.culture.northland`).label, "Frostfell");
  await library.deleteCulture("northland");
  assert.equal(registry.get("nameCultures", `${CUSTOM_NAME_MODULE}.culture.northland`), null);
  assert.equal(registry.get("namePacks", `${CUSTOM_NAME_MODULE}.pack.northland-people`), null);
  assert.ok(registry.get("namePacks", "core.generic-human"));
});

test("invalid input is rejected before persistence, without losing existing names", async () => {
  const { library, getSaved, registry } = setup();
  await library.saveCulture(culture);
  await assert.rejects(library.savePack(pack({ ancestryIds: ["core.orc"] })), /included in culture/);
  assert.equal(getSaved().packs.length, 0);
  assert.equal(registry.list("nameCultures").filter((x) => x.sourceModule === CUSTOM_NAME_MODULE).length, 1);
  await assert.rejects(library.savePack(pack({ given: { male: [], female: [], neutral: [] } })), /needs given names/);
});

test("world library edits are GM-only and JSON export/import data is validated", async () => {
  const { library, getSaved } = setup();
  globalThis.game.user.isGM = false;
  await assert.rejects(library.saveCulture(culture), /Only GMs/);
  assert.equal(getSaved().cultures.length, 0);
  globalThis.game.user.isGM = true;
  await library.replace({ version: 1, cultures: [culture], packs: [pack()] });
  assert.equal(library.list().packs.length, 1);
  await assert.rejects(library.replace({ version: 7, cultures: [], packs: [] }), /Unsupported/);
});

test("name lists deduplicate case-insensitively and reject markup/control chars", () => {
  assert.deepEqual(parseNameParts("Alya, alya\nElan; Eira"), ["Alya", "Elan", "Eira"]);
  assert.throws(() => parseNameParts("<script>"), /Invalid name part/);
});
