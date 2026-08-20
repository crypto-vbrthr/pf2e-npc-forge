# Public API

Obtain the API after initialization:

```js
const api = game.modules.get("pf2e-npc-forge")?.api;
```

or listen for `pf2eNpcForgeReady`.

## Versions

- Public API version: `0.8.4`
- Neutral NPC schema: `10`

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
- `api.capabilities`, `api.apiVersion`, `api.schemaVersion`

### Experimental

Available for testing but not contract-frozen:

- `api.ui.createEditor()` / `NpcEditorSession`
- `api.documents.clearCompendiumCache()`
- `api.documents.compendiumCacheStats()`
- raw service wrappers at `api.integrations.afflictions/items/loot`

### Internal

Files under engine builders, UI implementation, integration orchestrator, and adapter helpers are implementation details. External modules should not import them directly.

## Capability checks

Always prefer capabilities to version guessing:

```js
if (api.capabilities.has("compendium-backed-spells")) {
  // safe to rely on async spell materialization
}
```

0.8.4 intentionally exposes `experimental-editor-session` and does **not** expose `embedded-editor`, because the real host-mounted editor UI is scheduled for the next architecture block.

## Generation

```js
const npc = api.engine.generate({
  seed: "example-guard",
  level: 5,
  ancestry: "core.human",
  classProfile: "core.fighter",
  classSpecialization: null, // weighted/automatic
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

The returned object is plain serializable data. `null` class specialization remains automatic across standalone-editor regenerations; the resolved specialization is visible in the generated NPC but is not silently written back as a fixed request.

## Actor materialization

```js
const source = api.documents.toActorSource(npc);
const fullSource = await api.documents.toActorSourceAsync(npc, { folder: folderId });
const actor = await api.documents.createActor(npc, { folder: folderId });
```

`toActorSource()` is a synchronous fallback/inspection source. The asynchronous path resolves real PF2e equipment and spell compendium documents and performs optional Forge integrations.

Batch creation:

```js
const actors = await api.documents.createActors(npcs, { folder: folderId });
```

The adapter caches pack indexes and resolved compendium documents across these operations.

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

A definition ID must be owned by the registering module:

```js
api.content.registerRole("my-module", {
  id: "my-module.elite-agent",
  labelKey: "MYMODULE.Role.EliteAgent"
});
```

This is rejected:

```js
api.content.registerRole("my-module", {
  id: "core.veteran" // forbidden: core namespace belongs to NPC Forge
});
```

Cross-provider references remain allowed, for example an add-on specialization may use `parentId: "core.fighter"` while its own ID remains `my-module.*`.

See `CONTENT_PROVIDERS.md`.

## Names

```js
const packs = api.content.listNamePacks({
  ancestryId: "core.dwarf",
  locale: "de",
  allowUntranslated: false
});
```

Generated identities expose semantic `identity.nameParts`. Proper names can remain literal while speaking surnames/titles can localize without changing the generation seed.

## Spellcasting

External modules may register spellcasting profiles and spell themes. The neutral model stores spellcasting intent; the async adapter materializes PF2e `spellcastingEntry` and real spell Items and populates prepared/spontaneous slots.

## Integrations

Cheap synchronous status:

```js
const status = api.integrations.status();
status.afflictionForge.ready;
status.itemForge.ready;
status.lootForge.planned;
```

Detailed async diagnostics:

```js
const diagnostics = await api.integrations.inspect({ level: 8 });
diagnostics.afflictionForge.enabledLibraries;
diagnostics.afflictionForge.injuryPoisonsInRange;
diagnostics.afflictionForge.injuryPoisonsTotal;
```

`ready` requires an **active** module in 0.8.4.

### Affliction Forge

When requested, NPC Forge searches enabled Affliction Forge poison libraries, verifies `delivery.injuryPoison === true`, and attaches a reference through the Affliction Forge public API. By default only manufactured weapon attacks with a `sourceWeaponId` and piercing/slashing damage are eligible. Natural attacks are not automatically poison-coated.

### Item Forge

When personal items are requested, NPC Forge calls Item Forge `generate()` in treasure mode. Category selection uses profession, role, class-profile, and class-specialization tags. Scholarly/arcane contexts prefer books, religious/divine contexts prefer ceremonial treasure, and mercantile/social contexts prefer jewelry.

Errors written into NPC Forge integration flags are plain strings so Actor sources remain safely serializable.

### Loot Forge

0.8.4 detects Loot Forge but does not invoke it. Its service status reports `planned: true` and `ready: false`.

## Experimental editor session

```js
const session = api.ui.createEditor({
  initialRequest: { level: 5, profession: "core.guard" },
  capabilities: { createActor: false }
});
```

The lifecycle contract exists, but the mounted UI remains a placeholder in 0.8.4. Do not treat this as the finished embedded editor. See `EMBEDDED_EDITOR.md`.
