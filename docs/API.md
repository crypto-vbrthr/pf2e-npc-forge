# Public API

Obtain the API after initialization:

```js
const api = game.modules.get("pf2e-npc-forge")?.api;
```

or listen for `pf2eNpcForgeReady`.

## Versions

- Public API version: `0.8.5`
- Neutral NPC schema: `10`

Consumers should check `api.capabilities` instead of inferring features from the module version.

## Stability labels

### Public

Intended for external consumers and add-ons:

- `api.engine.generate()`
- `api.documents.toActorSource()`
- `api.documents.toActorSourceAsync()`
- `api.documents.createActor()`
- `api.documents.createActors()`
- `api.content.*` registration/list/get methods
- `api.integrations.status()`
- `api.integrations.inspect()`
- `api.ui.createEditor()` / `NpcEditorSession`
- `api.capabilities`, `api.apiVersion`, `api.schemaVersion`

### Experimental

Useful but not yet contract-frozen:

- `api.documents.clearCompendiumCache()`
- `api.documents.compendiumCacheStats()`
- raw service wrappers at `api.integrations.afflictions/items/loot`

### Internal

Engine builders, `NpcEditorCore`, integration orchestration, templates, and adapter helper files are implementation details. External modules should consume the public session API instead of importing UI internals directly.

## Capability checks

```js
if (api.capabilities.has("embedded-editor")) {
  const session = api.ui.createEditor({ mode: "embedded" });
}
```

0.8.5 advertises the production UI capabilities:

- `embedded-editor`
- `editor-session-api`
- `editor-section-reroll`
- `host-action-bar`
- `shared-editor-core`

The former `experimental-editor-session` marker is no longer advertised.

## Generation

```js
const npc = api.engine.generate({
  seed: "example-guard",
  level: 5,
  ancestry: "core.human",
  classProfile: "core.fighter",
  classSpecialization: null,
  professionCategory: "core.profession-category.civic",
  profession: "core.guard",
  role: "core.veteran",
  inventory: {
    enabled: true,
    personalItems: true,
    allowPoisonedWeapons: true,
    poisonPolicy: "automatic"
  }
});
```

The result is plain serializable data. A `null` class specialization remains automatic in editor requests; resolved output does not silently become fixed input.

## Actor materialization

```js
const source = api.documents.toActorSource(npc);
const fullSource = await api.documents.toActorSourceAsync(npc, { folder: folderId });
const actor = await api.documents.createActor(npc, { folder: folderId });
const actors = await api.documents.createActors(npcs, { folder: folderId });
```

The asynchronous path resolves PF2e compendium equipment/spells and optional Forge integrations. The adapter caches pack indexes and resolved documents for batch/Crowd workflows.

## Embedded editor

```js
const session = api.ui.createEditor({
  mode: "embedded",
  initialRequest: { level: 5, profession: "core.guard" },
  capabilities: {
    createActor: false,
    reroll: true,
    editInventory: true
  },
  actionBar: "host",
  onChange: ({ npc }) => updateDraft(npc),
  onCommit: ({ npc }) => saveDraft(npc),
  onCancel: () => closePanel()
});

session.mount(container);
await session.whenRendered();
```

The standalone application uses this same session/core path. See `EMBEDDED_EDITOR.md` for lifecycle, callbacks, action bars, and section-reroll semantics.

## Content registration

Available registration methods:

```js
api.content.registerAncestry(moduleId, definition);
api.content.registerClassProfile(moduleId, definition);
api.content.registerClassSpecialization(moduleId, definition);
api.content.registerAbility(moduleId, definition);
api.content.registerProfessionCategory(moduleId, definition);
api.content.registerProfession(moduleId, definition);
api.content.registerProfessionSpecialization(moduleId, definition);
api.content.registerRole(moduleId, definition);
api.content.registerNamePack(moduleId, definition);
api.content.registerPersonalityPack(moduleId, definition);
api.content.registerAppearancePack(moduleId, definition);
api.content.registerEquipmentProfile(moduleId, definition);
api.content.registerSpellcastingProfile(moduleId, definition);
api.content.registerSpellTheme(moduleId, definition);
api.content.registerQuickPreset(moduleId, definition);
```

### Namespace contract

A definition ID must belong to the registering module:

```js
api.content.registerRole("my-module", {
  id: "my-module.elite-agent",
  labelKey: "MYMODULE.Role.EliteAgent"
});
```

External modules may reference core parents but may not claim `core.*` or another provider's namespace. See `CONTENT_PROVIDERS.md`.

## Names

```js
const packs = api.content.listNamePacks({
  ancestryId: "core.dwarf",
  locale: "de",
  allowUntranslated: false
});
```

Generated identities expose semantic `identity.nameParts`, allowing localized speaking surnames/titles without changing the generation seed.

## Spellcasting

External modules may register spellcasting profiles and themes. The async adapter materializes PF2e `spellcastingEntry` and real spell Items, including prepared/spontaneous rank slots.

## Integrations

Cheap synchronous status:

```js
const status = api.integrations.status();
status.afflictionForge.ready;
status.itemForge.ready;
status.lootForge.planned;
```

Detailed diagnostics:

```js
const diagnostics = await api.integrations.inspect({ level: 8 });
diagnostics.afflictionForge.enabledLibraries;
diagnostics.afflictionForge.injuryPoisonsInRange;
diagnostics.afflictionForge.injuryPoisonsTotal;
```

`ready` requires the external module to be active.

### Affliction Forge

NPC Forge searches enabled poison libraries, validates injury-poison delivery, and attaches references through the Affliction Forge public API. By default only manufactured piercing/slashing weapon attacks are eligible.

### Item Forge

Personal treasure generation uses Item Forge in treasure mode and context from profession, role, class profile, and specialization tags. Integration errors persisted in Actor flags are serializable strings.

### Loot Forge

0.8.5 detects Loot Forge but still does not invoke a Loot Forge generation API. Status remains `planned: true`, `ready: false`.
