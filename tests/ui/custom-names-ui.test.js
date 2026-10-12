import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const template = fs.readFileSync(new URL("../../templates/custom-names-manager.hbs", import.meta.url), "utf8");
const tabs = fs.readFileSync(new URL("../../templates/npc-forge-app.hbs", import.meta.url), "utf8");
const app = fs.readFileSync(new URL("../../scripts/ui/npc-forge-app.js", import.meta.url), "utf8");

test("standalone NPC Forge offers a dedicated name library tab without replacing embedded editor", () => {
  assert.match(tabs, /data-npc-forge-tab="custom"/);
  assert.match(tabs, /data-npc-forge-editor-host/);
  assert.match(tabs, /data-npc-forge-custom-host/);
  assert.match(app, /new CustomNamesManager/);
  assert.match(app, /this\.editorSession\.mount\(host\)/);
});

test("GM custom names manager exposes culture, pack, genders and compositional groups", () => {
  assert.match(template, /data-custom-culture-form/);
  assert.match(template, /data-custom-pack-form/);
  for (const field of ["givenMale", "givenFemale", "givenNeutral", "prefixField", "suffixField", "cultureId", "ancestries"]) {
    assert.match(template, new RegExp(field));
  }
  assert.match(template, /data-custom-import/);
  assert.match(template, /data-custom-action="export"/);
});
