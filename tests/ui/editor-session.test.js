import test from "node:test";
import assert from "node:assert/strict";
import { NpcEditorSession } from "../../scripts/ui/npc-editor-session.js";

test("editor sessions keep isolated request state", async () => {
  const engine = { generate: (request) => ({ identity: { name: request.name }, build: { level: 1 } }) };
  const adapter = { createActor: async () => null };
  const a = new NpcEditorSession({ engine, adapter, initialRequest: { name: "A" } });
  const b = new NpcEditorSession({ engine, adapter, initialRequest: { name: "B" } });
  await a.generate(); await b.generate();
  assert.equal(a.getNpc().identity.name, "A");
  assert.equal(b.getNpc().identity.name, "B");
  a.destroy(); b.destroy();
});

test("embedded host can disable actor creation", async () => {
  const session = new NpcEditorSession({ engine: { generate: () => ({}) }, adapter: { createActor: async () => ({}) }, capabilities: { createActor: false } });
  await assert.rejects(() => session.createActor(), /disabled/);
});
