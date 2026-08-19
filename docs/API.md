# Public API

Obtain the API from `game.modules.get("pf2e-npc-forge")?.api` after the module is ready.

## Versions

- API version: `0.2.0`
- Neutral NPC schema: `2`

## Generation

```js
const npc = api.engine.generate({
  seed: "example-guard",
  level: 5,
  ancestry: "core.human",
  classProfile: "core.fighter",
  profession: "core.guard",
  role: "core.veteran"
});
```

The returned object is plain serializable data. In 0.2.0 it includes benchmark-driven attributes, Perception, AC, HP, saves, speed, relevant skills, and profession Lore.

## Actor creation

```js
const actor = await api.documents.createActor(npc, { folder: folderId });
```

## Capabilities

Check `api.capabilities` rather than assuming a feature from the module version. New 0.2.0 capabilities include `gm-core-statistics`, `skill-generation`, and `profession-lore`.


## Class profile and ability extensions (0.3.0)

```js
api.content.registerClassProfile(moduleId, profile);
api.content.registerClassSpecialization(moduleId, specialization);
api.content.registerAbility(moduleId, abilityDefinition);
```

A specialization references its parent profile with `parentId` and may add `abilityIds`. Ability definitions are neutral data and are converted to PF2e action items only by the document adapter.

## Compendium-backed actor sources

`documents.toActorSource(npc, options)` remains a synchronous fallback/source-inspection helper and does not perform compendium I/O.

Use `await documents.toActorSourceAsync(npc, options)` when the returned source must contain cloned PF2e compendium equipment. `documents.createActor()` and `documents.createActors()` call this path automatically.

```js
const npc = api.engine.generate(request);
const source = await api.documents.toActorSourceAsync(npc, { folder: folderId });
const actor = await api.documents.createActor(npc, { folder: folderId });
```

Weapon references currently use the PF2e equipment pack and a stable item slug, for example:

```js
{
  type: "weapon",
  compendium: {
    packId: "pf2e.equipment-srd",
    slug: "spear"
  }
}
```

If the pack or item is unavailable, the adapter falls back to the neutral model's weapon data and reports no hard failure. The generated NPC strike keeps engine-owned NPC attack/damage scaling while inheriting weapon identity, traits, and damage type from the resolved PF2e item.

## Ancestry content (0.5.0)

Add-on modules can register ancestry profiles through the stable public registry surface:

```js
api.content.registerAncestry("my-module", {
  id: "my-module.ancestry.example",
  labelKey: "MYMODULE.Ancestry.Example",
  size: "med",
  speed: 25,
  traits: ["humanoid"],
  languages: ["common"],
  senses: ["low-light-vision"],
  ageRanges: {
    youngAdult: { min: 16, max: 24 },
    adult: { min: 25, max: 50 },
    middleAged: { min: 51, max: 70 },
    elder: { min: 71, max: 100 }
  },
  naturalAttacks: []
});
```

The engine treats these as NPC-facing ancestry identity profiles. They are not complete PC ancestry progression objects and should not encode ancestry-feat advancement.

## Localized name generation (0.5.2)

Register name packs with:

```js
api.content.registerNamePack(moduleId, definition);
```

Discover ancestry- and locale-compatible packs with:

```js
api.content.listNamePacks({ ancestryId, locale, allowUntranslated });
```

Generation requests may select a pack and locale explicitly:

```js
const npc = api.engine.generate({
  seed: "example-dwarf",
  ancestry: "core.dwarf",
  identity: {
    gender: "female",
    nameLocale: "de",
    namePack: "core.generic-dwarf",
    allowUntranslatedNamePacks: false
  }
});
```

Generated identities expose `identity.nameParts` as the stable semantic representation. `identity.name` remains a fallback rendering for API compatibility; UI presentation and PF2e actor creation re-render semantic parts through the active localization catalog. Manual names are represented as `{ manual: "..." }` and are never translated.


## Appearance packs (0.5.4)

External modules can contribute physical appearance content without depending on the NPC Forge UI:

```js
api.content.registerAppearancePack("my-module", {
  id: "my-module.street-faces",
  ancestryIds: ["core.human"], // optional
  traits: [
    {
      id: "my-module.crooked-smile",
      category: "facial",
      labelKey: "MYMODULE.Appearance.CrookedSmile",
      weight: 5,
      preferredTags: ["criminal"]
    }
  ]
});
```

Supported core categories are `build`, `facial`, `complexion`, `age`, `scar`, `hands`, and `posture`. Trait definitions may use `ancestryIds`, `excludeAncestryIds`, `ageCategories`, `requiresTags`, `excludesTags`, and `preferredTags`. The engine stores semantic trait IDs in `identity.appearance`; localization is presentation-only.

Generation request example:

```js
const npc = api.engine.generate({
  seed: "dock-veteran-01",
  appearance: {
    enabled: true,
    intensity: "medium",
    allowBodyShape: true,
    allowScars: true,
    allowAgeFeatures: true,
    allowPosture: true
  }
});
```


## Personality packs (0.6.0)

External modules can add personality material without depending on the standalone UI:

```js
api.content.registerPersonalityPack("my-module", {
  id: "my-module.city-personalities",
  weight: 10,
  traits: [
    {
      id: "my-module.cautious",
      category: "trait",
      labelKey: "MYMODULE.Personality.Cautious.Name",
      descriptionKey: "MYMODULE.Personality.Cautious.Description",
      weight: 5,
      preferredTags: ["urban"]
    }
  ]
});
```

Supported categories are `demeanor`, `trait`, `motivation`, `flaw`, `quirk`, and `secret`. Definitions may use `ancestryIds`, `professionIds`, `classProfileIds`, `ageCategories`, `requiresTags`, `excludesTags`, `preferredTags`, and `avoidsTags`.

Generation request:

```js
const npc = api.engine.generate({
  seed: "dockmaster-01",
  personality: {
    enabled: true,
    intensity: "medium",
    allowSecrets: true
  }
});
```

The generated neutral model exposes `npc.personality` plus a structured `roleplaying` section. Secrets are intended as GM information; the PF2e adapter places them in private notes.

## Combat benchmark metadata (0.6.1)

Generated attacks expose stable benchmark metadata for consumers such as Encounter Forge or diagnostics tools:

```js
const npc = api.engine.generate({ level: 12, classProfile: "core.fighter" });
const strike = npc.attacks[0];

strike.modifier;                 // 26
strike.attackTier;               // "high"
strike.damage.formula;           // weapon-die-preserving formula, e.g. "4d6+16"
strike.damage.benchmarkTier;     // "high"
strike.damage.expectedAverage;   // 30
strike.damage.actualAverage;     // 30
strike.damage.benchmarkFormula;  // printed GM Core benchmark, "3d10+14"
```

External class profiles can set `statistics.damage` to `low`, `average`, `high`, or `extreme`. If omitted, NPC Forge derives a conservative default from the class profile and its tags.


## Spellcasting content

External modules can register spellcasting profiles and thematic spell pools with `api.content.registerSpellcastingProfile(moduleId, definition)` and `api.content.registerSpellTheme(moduleId, definition)`. Generated `npc.spellcasting` data is neutral and the Document Adapter materializes PF2e spellcasting entries and compendium-backed spell Items.


## External Forge integrations (0.8.0)

NPC Forge exposes optional integration services through the public API:

```js
const api = game.modules.get("pf2e-npc-forge")?.api;
const status = api.integrations.status();

status.afflictionForge.ready;
status.itemForge.ready;
```

The raw service wrappers are also available as `api.integrations.afflictions`, `api.integrations.items`, and `api.integrations.loot`. Consumers should prefer `status()` for capability/reporting UI and should not depend on private integration implementation details.

Generation requests may opt into specialist materialization:

```js
const npc = api.engine.generate({
  level: 8,
  classProfile: "core.rogue",
  profession: "core.thief",
  inventory: {
    enabled: true,
    personalItems: true,
    allowPoisonedWeapons: true
  }
});

const source = await api.documents.toActorSourceAsync(npc);
```

`engine.generate()` remains synchronous and deterministic. It records integration intent only. External APIs are invoked later by `documents.toActorSourceAsync()`, `createActor()`, or `createActors()`. This separation prevents optional Foundry modules from becoming hard dependencies of the neutral engine.

### Affliction Forge

When enabled, the adapter searches enabled Affliction Forge libraries for nearby-level poison templates and verifies `delivery.injuryPoison === true`. A selected poison is attached through Affliction Forge's public `references.createInjuryPoison()` and `references.addToSource()` contract. Only eligible piercing/slashing melee sources are considered. The automatic policy is weighted toward rogues, alchemists, and criminal professions.

For deterministic integration tests or specialist callers, the normalized request also accepts `inventory.poisonPolicy: "always"` and an optional `inventory.poisonCharges`. The normal NPC Forge UI uses `automatic`.

### Item Forge

When personal items are enabled, the adapter calls Item Forge's public `generate()` API in `treasure` mode. The category is chosen from broad NPC context and the target value scales conservatively with NPC level. The returned `itemSource` is embedded unchanged except for removal of transient document IDs and addition of NPC Forge provenance flags.

### Graceful degradation

If an integration is missing, not ready, has no matching content, or generation fails, NPC creation continues. Integration diagnostics are recorded under `flags.pf2e-npc-forge.integrations` on the materialized Actor source.
