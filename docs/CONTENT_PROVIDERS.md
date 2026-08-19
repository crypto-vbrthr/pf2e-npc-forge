# Content Providers

External modules can register profiles through the public content API.

## Class profile statistic hints

A class profile can now provide tier-based hints:

```js
{
  id: "my-module.martial",
  attributeTiers: { str: "high", dex: "average", con: "high" },
  statistics: {
    perception: "average",
    ac: "high",
    hp: "average",
    attack: "high",
    saves: { fortitude: "high", reflex: "average", will: "low" }
  },
  skillBias: { athletics: "high" }
}
```

Supported tiers are `low`, `average`, `high`, and `extreme`; perception and saves additionally support `terrible`. Extreme ability modifiers at levels where GM Core has no extreme entry automatically fall back to high.

## Profession hints

Professions may provide `attributeBias`, `skillBias`, and `lore`. Profession bias can strengthen a class-profile preference but does not reduce it.

## Profession categories and specializations

A profession can belong to a broad category:

```js
api.content.registerProfessionCategory("my-module", {
  id: "my-module.profession-category.maritime",
  labelKey: "MYMODULE.Category.Maritime",
  weight: 5
});

api.content.registerProfession("my-module", {
  id: "my-module.harbor-pilot",
  parentId: "my-module.profession-category.maritime",
  labelKey: "MYMODULE.Profession.HarborPilot",
  skillBias: { survival: "high", society: "average" },
  lore: [{ slug: "harbor-lore", labelKey: "MYMODULE.Lore.Harbor", tier: "high" }],
  equipmentProfileIds: ["my-module.harbor-pilot-gear"],
  weight: 5
});
```

Callers can request a weighted concrete child by using category mode:

```js
api.engine.generate({
  profession: {
    mode: "category",
    id: "my-module.profession-category.maritime"
  }
});
```

Optional profession specializations use the profession id as their `parentId`.

## Equipment profiles

Equipment profiles are reusable, data-driven packages:

```js
api.content.registerEquipmentProfile("my-module", {
  id: "my-module.harbor-pilot-gear",
  items: [
    {
      id: "rope",
      labelKey: "MYMODULE.Equipment.Rope",
      packId: "pf2e.equipment-srd",
      slug: "rope",
      itemType: "equipment",
      type: "equipment",
      purpose: "professional",
      minLevel: 0,
      maxLevel: 20
    }
  ]
});
```

At generation time these remain semantic inventory entries. During actor creation, the PF2e document adapter resolves them against the regular PF2e compendium and clones the real item. If a compendium entry is unavailable, actor creation degrades to a generated fallback source rather than aborting the NPC.

## Ancestry providers

An ancestry provider may contribute size, Speed, creature traits, base languages, senses, age ranges, modest attribute adjustments, and intrinsic natural attacks. Provider IDs must be namespaced. Core and third-party ancestry content use the same registry and generation path.

Natural attacks are neutral NPC attack definitions and are materialized by the PF2e adapter as NPC melee entries. Do not add fake physical weapon items for intrinsic claws, bites, beaks, or similar attacks.

## Name packs

Name packs are data-driven and may be limited by ancestry and locale. A recommended localized provider looks like this:

```js
api.content.registerNamePack("my-module", {
  id: "my-module.dwarf-names",
  labelKey: "MYMODULE.NamePacks.Dwarf",
  ancestryIds: ["core.dwarf"],
  supportedLocales: ["en", "de"],
  fallbackLocale: "en",
  given: {
    female: ["Dagna", "Runa"],
    male: ["Hargun", "Borin"],
    neutral: ["Dori"]
  },
  family: [
    {
      id: "ironhand",
      labelKey: "MYMODULE.Names.Family.Ironhand",
      fallback: "Ironhand"
    }
  ],
  weight: 10
});
```

Proper names can be plain strings. Speaking family names, titles, and epithets should use stable semantic IDs plus localization keys. This keeps seeded generation stable while allowing `Ironhand` in English and `Eisenhand` in German.

Legacy providers using `given: ["Ada", "Borin"]` remain supported.

Compatible packs can be discovered without knowing provider internals:

```js
const packs = api.content.listNamePacks({
  ancestryId: "core.dwarf",
  locale: "de",
  allowUntranslated: false
});
```

Automatic generation ignores packs that do not support the requested locale unless `allowUntranslatedNamePacks` is explicitly enabled in the generation request. A specifically requested fixed pack is still honored.


## Appearance providers

Appearance is content-driven. Register one or more `appearancePacks`; each pack owns a list of semantic physical traits. Keep IDs namespaced to your module and provide localization keys rather than localized strings when possible. Traits should describe observable appearance, not hidden personality or mechanical penalties.

The engine treats these traits as descriptive by default. A scar, heavy build, limp, wrinkles, or other feature does not change combat statistics unless another explicit content provider does so.


## Personality content providers

Use `api.content.registerPersonalityPack(moduleId, definition)` to add localized, weighted personality material. Personality packs are UI-independent and are consumed directly by the NPC Engine. Keep visible text behind localization keys where possible.

Personality traits use one of six categories: demeanor, trait, motivation, flaw, quirk, or secret. Contextual fields such as `preferredTags` and `requiresTags` allow a pack to favor material appropriate to professions, classes, roles, or other content tags without hard-coding those relationships into the engine.
