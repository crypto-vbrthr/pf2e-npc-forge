import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

function readCatalog(locale) {
  return JSON.parse(fs.readFileSync(new URL(`../../lang/${locale}.json`, import.meta.url), "utf8"));
}

for (const locale of ["de", "en"]) {
  test(`${locale} localization catalog uses one flat namespace`, () => {
    const catalog = readCatalog(locale);
    assert.equal(Object.prototype.hasOwnProperty.call(catalog, "NPCFORGE"), false);
    assert.ok(Object.keys(catalog).every((key) => !catalog[key] || typeof catalog[key] !== "object"));
    assert.equal(typeof catalog["NPCFORGE.App.Title"], "string");
    assert.equal(typeof catalog["NPCFORGE.Fields.Ancestry"], "string");
    assert.equal(typeof catalog["NPCFORGE.Stats.Reflex"], "string");
    assert.equal(typeof catalog["NPCFORGE.Abilities.ReactiveStrike.Name"], "string");
    assert.equal(typeof catalog["NPCFORGE.Content.Ancestry.Catfolk"], "string");
    assert.equal(typeof catalog["NPCFORGE.Languages.Common"], "string");
  });
}

test("German representative localization values resolve", () => {
  const de = readCatalog("de");
  assert.equal(de["NPCFORGE.App.Title"], "PF2E NPC Forge");
  assert.equal(de["NPCFORGE.Fields.Level"], "Stufe");
  assert.equal(de["NPCFORGE.Content.Ancestry.Catfolk"], "Amurrun");
  assert.equal(de["NPCFORGE.Senses.Darkvision"], "Dunkelsicht");
});
