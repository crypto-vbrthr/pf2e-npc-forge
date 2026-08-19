import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const template = fs.readFileSync(new URL("../../templates/npc-forge-app.hbs", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../../styles/npc-forge.css", import.meta.url), "utf8");

test("preview uses Creature Forge aligned sheet sections and stat tiles", () => {
  assert.match(template, /npc-forge-sheet-header/);
  assert.match(template, /NPCFORGE\.Sections\.Defenses/);
  assert.match(template, /npc-forge-stat-grid-attributes/);
  assert.match(template, /npc-forge-stat-grid-defense/);
  assert.match(css, /npc-forge-sheet-section > h2/);
  assert.match(css, /npc-forge-stat-tile/);
});
