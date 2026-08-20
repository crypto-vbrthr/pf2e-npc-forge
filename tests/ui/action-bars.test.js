import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const template = fs.readFileSync(new URL("../../templates/npc-editor-core.hbs", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../../styles/npc-forge.css", import.meta.url), "utf8");
const core = fs.readFileSync(new URL("../../scripts/ui/npc-editor-core.js", import.meta.url), "utf8");

test("shared editor core uses dedicated scroll regions with persistent action bars", () => {
  assert.match(template, /npc-forge-controls-scroll/);
  assert.match(template, /npc-forge-preview-scroll/);
  assert.match(template, /npc-forge-actions npc-forge-action-bar/);
  assert.match(template, /npc-forge-preview-actions npc-forge-action-bar/);
  assert.match(css, /grid-template-rows:\s*minmax\(0, 1fr\) auto/);
  assert.match(css, /\.npc-forge-action-bar[^}]*border-top/s);
  assert.doesNotMatch(css, /\.npc-forge-preview-actions\s*\{[^}]*position:\s*sticky/s);
});

test("preview scroll preservation targets the actual shared preview scroll container", () => {
  assert.match(core, /querySelector\?\.\("\.npc-forge-preview-scroll"\)/);
  assert.match(core, /previewScrollTop:\s*preview\?\.scrollTop\s*\?\?\s*0/);
});

test("automatic class specialization remains automatic after generation", () => {
  assert.doesNotMatch(core, /request\.classSpecialization\s*=\s*.*npc/);
});
