# Embedded Editor API

**Status in 0.8.5: Public production API.**

NPC Forge now exposes the same complete editor core used by the standalone NPC Forge window. Encounter Forge, Crowd Forge, or another host can mount it inside any suitable HTML element without opening a second Foundry window.

```js
const api = game.modules.get("pf2e-npc-forge")?.api;

const session = api.ui.createEditor({
  mode: "embedded",
  initialRequest: {
    level: 5,
    profession: "core.guard"
  },
  initialNpc: null,
  capabilities: {
    createActor: false,
    reroll: true,
    editInventory: true
  },
  onChange: ({ npc, request, reason, section }) => {
    console.log("NPC changed", { npc, request, reason, section });
  },
  onCommit: ({ npc, request }) => saveEncounterDraft(npc, request),
  onCancel: () => closeHostPanel()
});

session.mount(container);
await session.whenRendered();
```

`callbacks: { onChange, onCommit, ... }` remains accepted as an equivalent form when a host prefers one callback object.

## Lifecycle

A session is isolated. No global `currentNpc` or shared editor state is used.

- `mount(element)` mounts the real shared editor into the host element.
- `whenRendered()` resolves after the current asynchronous Handlebars render.
- `unmount()` removes the editor UI but keeps request/NPC state so it can be mounted elsewhere.
- `destroy()` permanently tears down the session and listeners.
- `getRequest()` returns a deep clone of the current editor request.
- `getNpc()` returns a deep clone of the current neutral NPC model.
- `setRequest(request)` replaces the current request.
- `setNpc(npc)` replaces the current preview/model.
- `generate()` generates a complete NPC and refreshes the mounted editor.
- `rerollSection(section)` regenerates a supported section while preserving the rest of the NPC.
- `createActor(options)` materializes the current NPC if Actor creation is allowed.
- `commit()` calls the host commit callback and returns the current NPC.
- `cancel()` calls the host cancel callback.

## Supported section rerolls

`rerollSection()` accepts:

- `all`
- `identity`
- `appearance`
- `personality`
- `skills`
- `abilities`
- `spellcasting`
- `inventory` (`equipment` alias)
- `attacks`
- `combat`

Section rerolls use a derived deterministic seed and record their seed/count in `npc.generation.rerolls`. For partial rerolls, resolved build axes are frozen so an automatic profession or class specialization does not unexpectedly change merely because personality or appearance was rerolled.

## Capabilities

```js
capabilities: {
  createActor: false,
  reroll: true,
  editInventory: true
}
```

- `createActor: false` removes/blocks Actor creation for the session.
- `reroll: false` rejects `rerollSection()` calls.
- `editInventory: false` hides inventory-generation controls while leaving generated inventory visible in the preview.

## Action bars

By default an embedded editor renders its own Generate / Commit / Cancel controls:

```js
actionBar: "default"
```

A host that owns its footer or toolbar can suppress all editor action bars:

```js
const session = api.ui.createEditor({
  mode: "embedded",
  actionBar: "host",
  capabilities: { createActor: false }
});

session.mount(container);

hostSaveButton.addEventListener("click", () => session.commit());
hostCancelButton.addEventListener("click", () => session.cancel());
```

`actionBar: "none"` is also accepted and has the same visual effect; `host` documents the intent that the surrounding application owns the controls.

## Actor creation defaults

Hosts may provide default Actor materialization options:

```js
const session = api.ui.createEditor({
  mode: "embedded",
  capabilities: { createActor: true },
  createActorOptions: {
    folder: targetFolderId,
    renderSheet: false
  }
});

await session.createActor({ renderSheet: true });
```

Per-call options override session defaults.

## Callbacks

Supported callbacks are:

- `onRequestChange({ request, npc })`
- `onChange({ npc, request, dirty, reason, section? })`
- `onActorCreated({ actor, npc, request })`
- `onCommit({ npc, request })`
- `onCancel({ npc, request })`
- `onError({ action, error, npc, request })`

Host callback failures are contained and logged by NPC Forge instead of corrupting editor state.

## Shared core guarantee

The standalone NPC Forge application no longer owns a separate form implementation. It is only an `ApplicationV2` shell that creates an editor session and mounts the same `NpcEditorCore` used by embedded hosts. Scroll preservation, disclosure state, integration diagnostics, controls, preview, and future editor features therefore land in both modes at once.
