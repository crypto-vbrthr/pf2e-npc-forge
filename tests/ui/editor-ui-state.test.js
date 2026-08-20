import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../../scripts/ui/npc-editor-core.js", import.meta.url), "utf8");
const template = fs.readFileSync(new URL("../../templates/npc-editor-core.hbs", import.meta.url), "utf8");

test("shared editor rerenders preserve controls and preview scroll positions", () => {
  assert.match(source, /captureUiState\(\)/);
  assert.match(source, /_restoreUiState\(\)/);
  assert.match(source, /controlsScrollTop:\s*controls\?\.scrollTop\s*\?\?\s*0/);
  assert.match(source, /previewScrollTop:\s*preview\?\.scrollTop\s*\?\?\s*0/);
  assert.match(source, /if \(controls\) controls\.scrollTop = state\.controlsScrollTop/);
  assert.match(source, /if \(preview\) preview\.scrollTop = state\.previewScrollTop/);
  assert.match(source, /raf\(\(\) => raf\(restoreScroll\)\)/);
  assert.match(source, /action === "generate"[\s\S]*?captureUiState\(\);[\s\S]*?session\.generate\(\)/);
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
  assert.match(source, /raf\(\(\) => raf\(restoreScroll\)\)/);
});
