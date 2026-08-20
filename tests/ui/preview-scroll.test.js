import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../../scripts/ui/npc-editor-core.js", import.meta.url), "utf8");

test("preview scroll remains part of centralized shared editor UI state preservation", () => {
  assert.match(source, /captureUiState\(\)/);
  assert.match(source, /_restoreUiState\(\)/);
  assert.match(source, /previewScrollTop:\s*preview\?\.scrollTop\s*\?\?\s*0/);
  assert.match(source, /if \(preview\) preview\.scrollTop = state\.previewScrollTop/);
  assert.match(source, /if \(classChanged \|\| categoryChanged \|\| professionChanged \|\| ancestryChanged\) \{[\s\S]*?captureUiState\(\);[\s\S]*?render\(/);
});
