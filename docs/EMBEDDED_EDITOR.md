# Embedded Editor API

**Status in 0.8.4: Experimental contract, placeholder renderer.**

NPC Forge exposes isolated editor sessions so the eventual embedded editor can be hosted by Encounter Forge, Crowd Forge, or another module without opening a separate NPC Forge window.

```js
const session = api.ui.createEditor({
  mode: "embedded",
  initialRequest: { level: 5, profession: "core.guard" },
  capabilities: {
    createActor: false,
    reroll: true,
    editInventory: true
  },
  callbacks: {
    onChange: ({ npc }) => console.log(npc),
    onCommit: ({ npc }) => saveEncounterDraft(npc),
    onCancel: () => closeHostPanel()
  }
});

session.mount(container);
await session.generate();
await session.commit();
session.destroy();
```

## Important 0.8.4 limitation

The current `NpcEditorSession.mount()` UI is **not** the complete standalone NPC Forge editor. It is still a placeholder implementation. The lifecycle and isolated state are useful for contract testing, but hosts should not ship a production embedded workflow against the renderer yet.

For that reason 0.8.4 advertises:

```js
api.capabilities.has("experimental-editor-session") === true
api.capabilities.has("embedded-editor") === false
```

## Planned 0.8.5 contract

0.8.5 is intended to extract the actual standalone controls/preview into a reusable editor core. The intended session lifecycle remains:

- `mount(element)`
- `unmount()`
- `destroy()`
- `getNpc()`
- `getRequest()`
- `generate()`
- section reroll support
- `commit()`
- `cancel()`

The host should control where the editor is mounted, which capabilities are available, and what commit/cancel mean. No global `currentNpc` state should be introduced; multiple sessions must remain isolated.
