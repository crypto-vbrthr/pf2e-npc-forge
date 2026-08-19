# Embedded Editor API

The editor is exposed as a host-controlled session. This is intended for modules such as Encounter Forge.

```js
const session = api.ui.createEditor({
  initialRequest: { level: 5, profession: "core.guard" },
  capabilities: { createActor: false },
  callbacks: {
    onChange: ({ npc }) => console.log(npc),
    onCommit: ({ npc }) => saveEncounterDraft(npc)
  }
});

session.mount(container);
await session.generate();
await session.commit();
session.destroy();
```

The 0.1.0 renderer is intentionally a placeholder. The session lifecycle and host callbacks are the baseline contract that later editor releases will preserve.
