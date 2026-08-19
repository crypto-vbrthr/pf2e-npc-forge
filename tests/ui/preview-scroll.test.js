import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../../scripts/ui/npc-forge-app.js", import.meta.url), "utf8");

test("preview scroll is captured before class-triggered rerender and restored after render", () => {
  assert.match(source, /_capturePreviewScroll\(\)/);
  assert.match(source, /_restorePreviewScroll\(\)/);
  assert.match(source, /if \(classChanged\) \{[\s\S]*?_capturePreviewScroll\(\);[\s\S]*?this\.render\(\)/);
  assert.match(source, /await super\._onRender\(context, options\);[\s\S]*?_restorePreviewScroll\(\);/);
});
