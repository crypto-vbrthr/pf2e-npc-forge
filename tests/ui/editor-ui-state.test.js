import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../../scripts/ui/npc-forge-app.js", import.meta.url), "utf8");
const template = fs.readFileSync(new URL("../../templates/npc-forge-app.hbs", import.meta.url), "utf8");

test("editor rerenders preserve controls and preview scroll positions", () => {
  assert.match(source, /_captureUiState\(\)/);
  assert.match(source, /_restoreUiState\(\)/);
  assert.match(source, /controlsScrollTop:\s*controls\?\.scrollTop\s*\?\?\s*0/);
  assert.match(source, /previewScrollTop:\s*preview\?\.scrollTop\s*\?\?\s*0/);
  assert.match(source, /if \(controls\) controls\.scrollTop = state\.controlsScrollTop/);
  assert.match(source, /if \(preview\) preview\.scrollTop = state\.previewScrollTop/);
  assert.match(source, /requestAnimationFrame\(\(\) => \{[\s\S]*?requestAnimationFrame\(restoreScroll\)/);
  assert.match(source, /#onGenerate\(\)[\s\S]*?_captureUiState\(\);[\s\S]*?await this\.render\(\)/);
});

test("collapsible section state uses stable ids and is restored after rerender", () => {
  for (const id of ["basics", "identity", "personality", "appearance", "equipment", "integrations"]) {
    assert.match(template, new RegExp(`data-section-id="${id}"`));
  }
  assert.match(source, /querySelectorAll\?\.\("details\[data-section-id\]"\)/);
  assert.match(source, /sections\[section\.dataset\.sectionId\] = section\.open/);
  assert.match(source, /section\.open = state\.sections\[section\.dataset\.sectionId\]/);
});


test("section geometry is restored before deferred scroll positions", () => {
  const sectionRestore = source.indexOf("section.open = state.sections[section.dataset.sectionId]");
  const scrollRestore = source.indexOf("controls.scrollTop = state.controlsScrollTop");
  assert.ok(sectionRestore >= 0);
  assert.ok(scrollRestore > sectionRestore);
  assert.match(source, /requestAnimationFrame\(\(\) => \{[\s\S]*?requestAnimationFrame\(restoreScroll\)/);
});
