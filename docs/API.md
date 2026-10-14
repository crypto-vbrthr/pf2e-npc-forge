# Public API

Obtain the API after initialization:

```js
const api = game.modules.get("pf2e-npc-forge")?.api;
```

or listen for `pf2eNpcForgeReady`.

## Versions

- Public API version: `1.4.1`
- Neutral NPC schema: `13`

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

The production UI capabilities include:

- `embedded-editor`
- `editor-session-api`
- `editor-section-reroll`
- `host-action-bar`
- `shared-editor-core`

The former `experimental-editor-session` marker is no longer advertised.

Equipment-related capabilities include:

- `level-scaled-fundamental-runes`
- `shield-reinforcing-runes`

`inventory.scaleFundamentalRunes` defaults to `true`. Rune metadata remains neutral engine data until the PF2e adapter materializes the physical Item. It does not modify the engine-owned NPC Strike benchmark.


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
    scaleFundamentalRunes: true,
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
api.content.registerNameCulture(moduleId, definition);
api.content.registerNamePack(moduleId, definition);
api.content.registerPersonalityPack(moduleId, definition);
api.content.registerBackgroundPack(moduleId, definition);
api.content.registerRelationshipPack(moduleId, definition);
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

NPC Forge 1.1.3 exposes a setting-neutral culture layer for name-provider add-ons. A provider can register a culture and then associate one or more name packs with it.

```js
api.content.registerNameCulture("names-addon", {
  id: "names-addon.varisian",
  labelKey: "NAMESADDON.Culture.Varisian",
  ancestryIds: ["core.human", "core.tengu"],
  automaticAncestryIds: ["core.human"],
  supportedLocales: ["en", "de"],
  weight: 10
});

api.content.registerNamePack("names-addon", {
  id: "names-addon.varisian-human",
  ancestryIds: ["core.human"],
  cultureIds: ["names-addon.varisian"],
  supportedLocales: ["en", "de"],
  given: { female: ["Mirela"], male: ["Luka"], neutral: ["Sasha"] },
  family: ["Vasilev"],
  weight: 10
});
```

Discover compatible cultures and packs:

```js
const cultures = api.content.listNameCultures({
  ancestryId: "core.human",
  locale: "de"
});

const automaticCultures = api.content.listNameCultures({
  ancestryId: "core.human",
  locale: "de",
  automaticOnly: true
});

const packs = api.content.listNamePacks({
  ancestryId: "core.human",
  cultureId: "names-addon.varisian",
  locale: "de",
  includeUniversal: true
});
```

Generation can request a fixed culture while leaving the pack automatic:

```js
const npc = api.engine.generate({
  seed: "dock-family-01",
  ancestry: "core.human",
  identity: {
    nameCulture: "names-addon.varisian",
    namePack: null,
    nameLocale: "de"
  }
});
```

`ancestryIds` defines where a culture can be selected. The optional `automaticAncestryIds` defines the subset that may resolve automatically. If `automaticAncestryIds` is omitted, all compatible `ancestryIds` remain automatic for backward compatibility with 1.1.0 providers. An explicit empty array makes the culture manual/host-selected only.

When `nameCulture` is automatic, NPC Forge resolves only automatically eligible cultures deterministically using provider weights. If no culture resolves, universal packs for the ancestry are preferred before any regional same-ancestry pack. If a culture is resolved but has no compatible pack, generation first falls back to a universal pack for the same ancestry, then to another same-ancestry pack as a last resort. It never crosses ancestry boundaries merely to find a name. A fixed `namePack` remains authoritative for backward compatibility.

Existing packs without `cultureIds` are universal and require no migration. Generated identities expose the resolved `identity.nameCulture` plus semantic `identity.nameParts`, including `cultureId`, `packId`, and fallback provenance.

### Component-based name generation

Large name add-ons may generate semantic name parts from components rather than storing every complete name:

```js
api.content.registerNamePack("names-addon", {
  id: "names-addon.dwarf-clans",
  ancestryIds: ["core.dwarf"],
  supportedLocales: ["en", "de"],
  generators: {
    family: {
      type: "components",
      patterns: [["root", "suffix"]],
      separator: "",
      components: {
        root: [{ id: "iron", labelKey: "NAMESADDON.Component.Iron", fallback: "Iron" }],
        suffix: [{ id: "hand", labelKey: "NAMESADDON.Component.Hand", fallback: "hand" }]
      }
    }
  },
  given: { male: ["Hargun"], female: ["Dagna"], neutral: ["Dori"] },
  weight: 10
});
```

`generators.given`, `generators.family`, and `generators.epithet` are supported. `generator` is accepted as a shorthand for a component generator targeting the given name. Component entries use the same literal/`labelKey`/fallback semantics as ordinary name parts, so speaking names remain localizable without changing the generation seed.

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

The current stable release detects Loot Forge but still does not invoke a Loot Forge generation API. Status remains `planned: true`, `ready: false`.


## Background and relationship content

The public API includes provider registration for `backgroundPacks` and `relationshipPacks`. Generated relationship records are neutral data with a `typeId`, `reciprocalTypeId`, visibility, attitude, and target descriptor. Unresolved targets use `target.kind = "unresolved-npc"` so a host such as Crowd Forge can later bind the relationship to another neutral NPC or Actor without NPC Forge inventing global state.

Generation request example:

```js
const npc = api.engine.generate({
  seed: "social-npc-01",
  background: {
    enabled: true,
    intensity: "high",
    allowPrivateHooks: true,
    generateRelationships: true,
    generateSocialContext: true,
    relationshipCount: 3
  }
});
```

Editor section rerolls accept `background`, `relationships`, and `socialContext` in addition to the earlier domains.


## Manual NPC statistic adjustments (1.4.0)

A mounted or unmounted editor session can adjust the neutral NPC model directly:

```js
await session.adjustStat("attribute", "str", 1);       // STR modifier +1
await session.adjustStat("defense", "ac", -1);         // AC -1
await session.adjustStat("defense", "hp", 1);          // HP +1 (minimum 1)
await session.adjustStat("defense", "speed", 1);       // Speed +5 feet (minimum 0)
await session.adjustStat("defense", "perception", 1);  // Perception +1
await session.adjustStat("save", "fortitude", 1);      // Fortitude +1
await session.adjustStat("skill", "athletics", 1);     // one existing skill modifier +1
await session.adjustStat("attack", "primary-attack", 1); // one existing NPC Strike bonus +1
```

`delta` is an integer number of +/- presses and only the selected field changes. Keys for skills are their `slug`, and keys for attacks are their stable attack `id`. Editing an attribute does not automatically alter NPC creature-building skills, saves or Strikes. Edits are visible in `session.getNpc()`, `onChange` (with `reason: "adjustStat"`), the preview, and materialized PF2e Actors. For `delta` with magnitude > 1, Speed uses 5 feet * delta.

Use `capabilities: { adjustStats: false }` to hide the preview buttons and disable `adjustStat()`. The method can be called with `{ render: false }` as the fourth argument if the host provides its own rendering. Manual values survive unrelated section rerolls; they are replaced by full regeneration unless their corresponding **Statistics**, **Skills**, or **Equipment/Attacks** section is locked. Locks never prevent intentional manual numeric adjustments. No schema change is required.

## Editor section locks (1.3.0)

The shared standalone and embedded NPC editor now exposes lock and reroll controls in the preview. Hosts can manage locks programmatically:

```js
const session = api.ui.createEditor({
  mode: "embedded",
  capabilities: { reroll: true, sectionLocks: true }
});
await session.generate();
session.setSectionLocked("identity", true);
session.setSectionLocked("personality", true);
await session.generate(); // keeps name/identity and personality
session.setSectionLocked("personality", false);
await session.rerollSection("personality");
const locked = session.getLockedSections();
session.clearSectionLocks();
```

Use `isSectionLocked(section)` or `toggleSectionLock(section)` for individual UI actions. `sectionLocks: false` disables this capability for hosted sessions; `reroll: false` hides refresh buttons and disables section rerolls. Locks exist only for the editor session, not in the neutral NPC model or Actor documents. `attributes` and `defenses` are independent lock scopes. For backward compatibility `statistics` still locks both scopes together. `attacks` and `inventory` are independent lock scopes; materialization preserves the referenced weapon Items of locked attacks and aligns unlocked attacks to any locked equipment. The `equipment` reroll alias still maps to `inventory`. `rerollSection("biography")` refreshes just the biography, whereas `rerollSection("background")` refreshes the full social block while retaining any other locked parts. Rerolling `spellcasting` synchronizes the wizard spellbook item. Build-incompatible changes while dependent sections are locked are rejected instead of silently creating mismatched Actor data.

## GM-defined world name library (1.2.0)

NPC Forge now exposes `api.customNames` for world-scoped homebrew content:

```js
const { cultures, packs } = api.customNames.list();
const unsubscribe = api.customNames.subscribe((library) => console.log(library));
// Only GMs may write:
await api.customNames.saveCulture({
  id: "harborfolk", title: "Harborfolk", ancestryIds: ["core.human"], automatic: false
});
await api.customNames.savePack({
  id: "harborfolk-sailors", title: "Sailors", cultureId: "harborfolk",
  ancestryIds: ["core.human"],
  given: { male: ["Orin"], female: ["Kira"], neutral: ["Selen"] },
  family: ["Sailcrest"], epithets: [],
  composites: {
    male: { prefix: ["Al"], suffix: ["ric"] },
    female: { prefix: ["El"], suffix: ["ara"] },
    neutral: { prefix: [], suffix: [] },
    family: { prefix: ["Salt"], suffix: ["wind"] }
  }
});
```

Other methods: `load()`, `replace(library)`, `saveCulture`, `deleteCulture`, `savePack`, `deletePack`, `subscribe(listener)`, `ancestryOptions()`. `replace` accepts a version-1 object with `cultures` and `packs`; it validates data and replaces the complete world library, not addon-provided entries. `deleteCulture` deletes associated user-created packs. Each culture or pack has a stable user ID; NPC Forge internally registers IDs under `pf2e-npc-forge.user.culture.*` and `pf2e-npc-forge.user.pack.*` to preserve namespace isolation.

Custom cultures default to **explicit selection only** (`automatic: false`); they do not silently displace universal names. This API requires a running Foundry world and GM permission to write. Editor-created packs use plain literals rather than locale-specific translation keys. The neutral NPC schema stays at `13`.
