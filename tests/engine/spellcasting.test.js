import test from "node:test";
import assert from "node:assert/strict";
import { ContentRegistry } from "../../scripts/engine/content/content-registry.js";
import { registerCoreContent } from "../../scripts/engine/content/core-content.js";
import { NpcEngine } from "../../scripts/engine/npc-engine.js";

function engine() { const registry = new ContentRegistry(); registerCoreContent(registry); return { registry, engine:new NpcEngine({ registry }) }; }

test("level 12 wizard receives high GM Core spellcasting benchmark and spellbook", () => {
  const { engine:e } = engine();
  const npc = e.generate({ seed:"wizard12", level:12, classProfile:"core.wizard", profession:"core.scholar" });
  assert.equal(npc.spellcasting.length, 1);
  assert.equal(npc.spellcasting[0].tradition, "arcane");
  assert.equal(npc.spellcasting[0].mode, "prepared");
  assert.equal(npc.spellcasting[0].dc, 32);
  assert.equal(npc.spellcasting[0].attack, 24);
  assert.equal(npc.spellcasting[0].highestRank, 6);
  assert.ok(npc.inventory.some((item) => item.purpose === "spellbook"));
  assert.ok(npc.spellcasting[0].knownSpells.length > npc.spellcasting[0].preparedSpells.filter(s=>s.knownOnly).length);
});

test("bard is spontaneous occult caster", () => {
  const { engine:e } = engine();
  const npc = e.generate({ seed:"bard7", level:7, classProfile:"core.bard", profession:"core.performer" });
  assert.equal(npc.spellcasting[0].tradition, "occult");
  assert.equal(npc.spellcasting[0].mode, "spontaneous");
  assert.equal(npc.spellcasting[0].highestRank, 4);
});

test("class specialization can alter tradition/theme", () => {
  const { engine:e } = engine();
  const witch = e.generate({ seed:"witch", level:5, classProfile:"core.witch", classSpecialization:"core.witch.wild", profession:"core.scholar" });
  assert.equal(witch.spellcasting[0].tradition, "primal");
  const sorcerer = e.generate({ seed:"sorc", level:5, classProfile:"core.sorcerer", classSpecialization:"core.sorcerer.elemental", profession:"core.performer" });
  assert.equal(sorcerer.spellcasting[0].tradition, "primal");
});

test("martial classes do not gain spellcasting", () => {
  const { engine:e } = engine();
  const npc = e.generate({ seed:"fighter", level:12, classProfile:"core.fighter" });
  assert.deepEqual(npc.spellcasting, []);
});

test("external modules can register spellcasting profiles and themes", () => {
  const { registry, engine:e } = engine();
  registry.register("classProfiles", "test", { id:"test.mage", label:"Mage", tags:["spellcaster"], attributeTiers:{}, statistics:{ saves:{} }, preferredSkills:[] });
  registry.register("spellThemes", "test", { id:"test.theme", tradition:"arcane", ranks:{0:["detect-magic"],1:["force-barrage"]} });
  registry.register("spellcastingProfiles", "test", { id:"test.cast", classProfileId:"test.mage", tradition:"arcane", mode:"prepared", ability:"int", sourceType:"spellbook", themeId:"test.theme", tier:"average" });
  const npc=e.generate({seed:"external",level:1,classProfile:"test.mage"});
  assert.equal(npc.spellcasting[0].benchmarkTier,"average");
  assert.equal(npc.spellcasting[0].dc,14);
});
