import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../../scripts/ui/npc-forge-app.js", import.meta.url), "utf8");

test("preview scroll remains part of centralized editor UI state preservation", () => {
  assert.match(source, /_captureUiState\(\)/);
  assert.match(source, /_restoreUiState\(\)/);
  assert.match(source, /previewScrollTop:\s*preview\?\.scrollTop\s*\?\?\s*0/);
  assert.match(source, /if \(preview\) preview\.scrollTop = state\.previewScrollTop/);
  assert.match(source, /if \(classChanged \|\| categoryChanged \|\| professionChanged \|\| ancestryChanged\) \{[\s\S]*?_captureUiState\(\);[\s\S]*?this\.render\(\)/);
  assert.match(source, /await super\._onRender\(context, options\);[\s\S]*?_restoreUiState\(\);/);
});
