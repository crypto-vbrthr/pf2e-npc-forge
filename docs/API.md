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
