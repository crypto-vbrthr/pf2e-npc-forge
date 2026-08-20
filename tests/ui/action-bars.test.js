import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const template = fs.readFileSync(new URL("../../templates/npc-forge-app.hbs", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../../styles/npc-forge.css", import.meta.url), "utf8");
const app = fs.readFileSync(new URL("../../scripts/ui/npc-forge-app.js", import.meta.url), "utf8");

test("controls and preview use dedicated scroll regions with persistent action bars", () => {
  assert.match(template, /npc-forge-controls-scroll/);
  assert.match(template, /npc-forge-preview-scroll/);
  assert.match(template, /npc-forge-actions npc-forge-action-bar/);
  assert.match(template, /npc-forge-preview-actions npc-forge-action-bar/);
  assert.match(css, /grid-template-rows:\s*minmax\(0, 1fr\) auto/);
  assert.match(css, /\.npc-forge-action-bar[^}]*border-top/s);
  assert.doesNotMatch(css, /\.npc-forge-preview-actions\s*\{[^}]*position:\s*sticky/s);
});

test("preview scroll preservation targets the actual preview scroll container", () => {
  assert.match(app, /querySelector\?\.\("\.npc-forge-preview-scroll"\)/);
  assert.match(app, /querySelector\?\.\("\.npc-forge-preview-scroll"\)/);
});


test("automatic class specialization remains automatic after generation", () => {
  assert.doesNotMatch(app, /this\.request\.classSpecialization\s*=\s*this\.preview/);
});
