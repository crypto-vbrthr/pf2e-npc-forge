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

test("mount/unmount/destroy lifecycle delegates to an isolated editor core", async () => {
  const calls = [];
  const view = {
    mount: (element) => { calls.push(["mount", element]); return view; },
    unmount: () => { calls.push(["unmount"]); return view; },
    destroy: () => { calls.push(["destroy"]); },
    render: async () => { calls.push(["render"]); },
    whenRendered: () => Promise.resolve()
  };
  const api = { registry: null };
  const session = new NpcEditorSession({
    api,
    engine: { generate: () => ({}) },
    adapter: { createActor: async () => ({}) },
    viewFactory: () => view
  });
  const host = { nodeType: 1, querySelector() {}, dataset: {} };
  session.mount(host);
  await session.render();
  session.unmount();
  session.mount(host);
  session.destroy();
  assert.deepEqual(calls.map(([name]) => name), ["mount", "render", "unmount", "mount", "destroy"]);
  await assert.rejects(() => session.generate(), /destroyed/);
});

test("section reroll replaces only the requested section and records deterministic reroll metadata", async () => {
  let calls = 0;
  const baseNpc = {
    generation: { seed: "base" },
    identity: { name: "Ada", ancestry: { id: "core.human" }, gender: "female", age: { category: "adult", years: 30 }, appearance: { marker: "old-appearance" } },
    build: {
      level: 5,
      classProfile: { id: "core.fighter" },
      classSpecialization: { id: "core.fighter.sword-shield" },
      professionCategory: { id: "core.profession-category.civic" },
      profession: { id: "core.guard" },
      professionSpecialization: null,
      role: { id: "core.ordinary" }
    },
    personality: { marker: "old-personality" },
    statistics: { hp: 50 }, skills: [], abilities: [], spellcasting: [], inventory: [], attacks: [], integrations: {}
  };
  const engine = {
    generate: (request) => {
      calls += 1;
      return {
        ...structuredClone(baseNpc),
        generation: { seed: request.seed },
        personality: { marker: `new-personality-${calls}` },
        identity: { ...structuredClone(baseNpc.identity), appearance: { marker: `new-appearance-${calls}` } }
      };
    },
    validate: () => ({ valid: true, errors: [] })
  };
  const session = new NpcEditorSession({ engine, adapter: { createActor: async () => ({}) }, initialNpc: baseNpc, initialRequest: { seed: "base", level: 5 } });
  const rerolled = await session.rerollSection("personality");
  assert.equal(rerolled.personality.marker, "new-personality-1");
  assert.equal(rerolled.identity.appearance.marker, "old-appearance");
  assert.equal(rerolled.generation.rerolls.personality.count, 1);
  assert.match(rerolled.generation.rerolls.personality.seed, /::reroll:personality:1$/);
});

test("reroll capability can be disabled by the host", async () => {
  const session = new NpcEditorSession({ engine: { generate: () => ({}) }, adapter: {}, capabilities: { reroll: false } });
  await assert.rejects(() => session.rerollSection("personality"), /disabled/);
});

test("createActor merges session defaults with per-call options and reports the created actor", async () => {
  let received = null;
  let callbackActor = null;
  const actor = { name: "Test" };
  const session = new NpcEditorSession({
    engine: { generate: () => ({ generation: { seed: "x" }, identity: {}, build: {} }) },
    adapter: { createActor: async (_npc, options) => { received = options; return actor; } },
    initialNpc: { generation: { seed: "x" }, identity: {}, build: {} },
    createActorOptions: { folder: "folder-a", renderSheet: false },
    callbacks: { onActorCreated: ({ actor: created }) => { callbackActor = created; } }
  });
  await session.createActor({ renderSheet: true });
  assert.deepEqual(received, { folder: "folder-a", renderSheet: true });
  assert.equal(callbackActor, actor);
});
