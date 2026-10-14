# Embedded Editor API

**Status in 1.4.2: Public production API.**

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
    editInventory: true,
    sectionLocks: true,
    adjustStats: true
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
- `generate()` generates a complete NPC and refreshes the mounted editor, preserving currently locked sections.
- `rerollSection(section)` regenerates a supported section while preserving the rest of the NPC (locked sections cannot be rerolled until unlocked).
- `getLockedSections()` and `isSectionLocked(section)` return the session's preview locks.
- `setSectionLocked(section, locked)` and `toggleSectionLock(section)` update individual locks.
- `clearSectionLocks()` releases all locks.
- `adjustStat(kind, key, delta, { render = true })` increments/decrements a single existing NPC numeric field, including skills and Strike bonuses.
- `createActor(options)` materializes the current NPC if Actor creation is allowed.
- `commit()` calls the host commit callback and returns the current NPC.
- `cancel()` calls the host cancel callback.

## Supported section rerolls

`rerollSection()` accepts:

- `all`
- `identity`
- `appearance`
- `personality`
- `background` (all three social sections; respects individual locks)
- `biography` (biography only; `background` lock alias)
- `relationships`
- `socialContext`
- `statistics` (legacy combined statistics reroll/lock)
- `attributes`
- `defenses`
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
  editInventory: true,
  adjustStats: true
}
```

- `createActor: false` removes/blocks Actor creation for the session.
- `reroll: false` rejects `rerollSection()` calls.
- `editInventory: false` hides inventory-generation controls while leaving generated inventory visible in the preview.
- `sectionLocks: false` hides lock icons and rejects lock API calls.
- `adjustStats: false` hides all +/- numeric controls and rejects `adjustStat()` calls.

The lock/refresh icons appear in both standalone and embedded previews. Lock state belongs to the editor session only. `attacks` and `inventory` locks are independent. The engine preserves attack-referenced weapons when an attack is locked and keeps unlocked attacks aligned to fixed equipment. `attributes` and `defenses` can also be locked independently; the legacy `statistics` API action still locks both together. Wizard spellbooks are refreshed alongside the chosen spellcasting data. Rule-derived sections can regenerate to identical values if their build has not changed.

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

## Manual numeric editing (1.4.0)

The shared editor supports +/- adjustments to attribute modifiers, AC, HP, Perception, saves, Speed, skill/Lore bonuses and individual Strike bonuses. A host can perform the same operations programmatically, e.g. `await session.adjustStat("skill", "stealth", 1)`. Each edit is applied immediately to the session NPC model and triggers `onChange` with `reason: "adjustStat"`. Speed changes in 5-foot steps, all other values in steps of 1. The rest of the NPC, including Strike damage, is untouched.

The controls update a single preview value in place rather than rerendering the entire UI, preserving scroll positions and button focus. Manual changes survive rerolls of unrelated sections, and survive full regeneration when their corresponding section is locked. Set `capabilities.adjustStats = false` for read-only hosts.
