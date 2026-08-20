import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync(new URL("../../scripts/ui/npc-forge-app.js", import.meta.url), "utf8");
const session = fs.readFileSync(new URL("../../scripts/ui/npc-editor-session.js", import.meta.url), "utf8");
const core = fs.readFileSync(new URL("../../scripts/ui/npc-editor-core.js", import.meta.url), "utf8");
const appTemplate = fs.readFileSync(new URL("../../templates/npc-forge-app.hbs", import.meta.url), "utf8");
const editorTemplate = fs.readFileSync(new URL("../../templates/npc-editor-core.hbs", import.meta.url), "utf8");

test("standalone application is only a shell around the same editor session used by hosts", () => {
  assert.match(appTemplate, /data-npc-forge-editor-host/);
  assert.doesNotMatch(appTemplate, /data-npc-forge-request/);
  assert.match(app, /this\.api\.ui\.createEditor\(/);
  assert.match(app, /mode:\s*"standalone"/);
  assert.match(app, /this\.editorSession\.mount\(host\)/);
  assert.match(session, /new NpcEditorCore/);
});

test("production embedded editor renders the complete controls and preview template", () => {
  assert.match(core, /templates\/npc-editor-core\.hbs/);
  assert.match(editorTemplate, /data-npc-forge-request/);
  assert.match(editorTemplate, /npc-forge-controls-scroll/);
  assert.match(editorTemplate, /npc-forge-preview-scroll/);
  assert.doesNotMatch(session, /embedded-placeholder/);
});

test("embedded editor supports host-owned action bars and capability-gated inventory editing", () => {
  assert.match(session, /\["default", "host", "none"\]/);
  assert.match(editorTemplate, /#if capabilities\.editInventory/);
  assert.match(core, /showGenerate:\s*defaultActions/);
  assert.match(core, /showCommit:\s*defaultActions && this\.mode === "embedded"/);
});
