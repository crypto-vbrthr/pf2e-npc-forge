import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const template = fs.readFileSync(new URL("../../templates/npc-editor-core.hbs", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../../styles/npc-forge.css", import.meta.url), "utf8");

test("preview uses Creature Forge aligned sheet sections and stat tiles", () => {
  assert.match(template, /npc-forge-sheet-header/);
  assert.match(template, /NPCFORGE\.Sections\.Defenses/);
  assert.match(template, /npc-forge-stat-grid-attributes/);
  assert.match(template, /npc-forge-stat-grid-defense/);
  assert.match(css, /npc-forge-sheet-section > h2/);
  assert.match(css, /npc-forge-stat-tile/);
});

test("preview and controls expose appearance traits without overloading identity tiles", () => {
  assert.match(template, /NPCFORGE\.Sections\.Appearance/);
  assert.match(template, /appearanceIntensity/);
  assert.match(template, /appearanceAllowScars/);
  assert.match(template, /npc-forge-appearance-list/);
});

test("shared editor exposes narrative role selection", () => {
  assert.match(template, /name="role"/);
  assert.match(template, /NPCFORGE\.Fields\.Role/);
});

test("shared editor exposes background, social context and relationship controls", () => {
  assert.match(template, /data-section-id="background"/);
  assert.match(template, /name="backgroundEnabled"/);
  assert.match(template, /name="backgroundGenerateSocialContext"/);
  assert.match(template, /name="backgroundGenerateRelationships"/);
  assert.match(template, /name="backgroundRelationshipCount"/);
  assert.match(template, /view\.background\.relationships/);
  assert.match(template, /NPCFORGE\.Background\.GMOnly/);
});


test("equipment controls expose level-scaled fundamental rune generation", () => {
  assert.match(template, /name="scaleFundamentalRunes"/);
  assert.match(template, /NPCFORGE\.EquipmentProgression\.ScaleFundamentalRunes/);
  assert.match(template, /displayRunes/);
});
