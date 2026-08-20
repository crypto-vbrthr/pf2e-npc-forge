# Content Providers

External modules extend NPC Forge through `api.content.*`. Provider data is neutral and consumed by the same engine path as core content.

## Namespace ownership (required in 0.8.4+)

The registering module owns its own ID prefix:

```js
api.content.registerProfession("my-module", {
  id: "my-module.harbor-pilot",
  parentId: "core.profession-category.maritime",
  labelKey: "MYMODULE.Profession.HarborPilot",
  weight: 5
});
```

Rules:

- `pf2e-npc-forge` owns `core.*`.
- `my-module` owns `my-module.*`.
- A definition may reference parents, abilities, equipment profiles, ancestries, etc. from other providers.
- A definition may not create an ID in another provider's namespace.
- Duplicate IDs are rejected even within the owning namespace.

This is a deliberate pre-1.0 contract hardening change.

## Class profiles

Class profiles are NPC-facing abstractions, not PC class progression data. Useful fields include:

```js
api.content.registerClassProfile("my-module", {
  id: "my-module.martial-scholar",
  labelKey: "MYMODULE.Class.MartialScholar",
  tags: ["martial", "scholarly"],
  attributeTiers: { str: "high", int: "high", con: "average" },
  statistics: {
    perception: "average",
    ac: "high",
    hp: "average",
    attack: "high",
    damage: "average",
    saves: { fortitude: "average", reflex: "average", will: "high" }
  },
  skillBias: { athletics: "average", society: "high" }
});
```

Supported benchmark tiers are generally `low`, `average`, `high`, and `extreme`; some GM Core tables also support `terrible`.

## Class specializations and abilities

```js
api.content.registerAbility("my-module", {
  id: "my-module.duelist-riposte",
  labelKey: "MYMODULE.Ability.Riposte",
  actionType: "reaction"
});

api.content.registerClassSpecialization("my-module", {
  id: "my-module.duelist",
  parentId: "core.fighter",
  abilityIds: ["my-module.duelist-riposte"],
  weight: 5
});
```

Cross-provider `parentId` references are supported.

## Profession categories, professions, and specializations

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
  tags: ["maritime", "social"],
  skillBias: { survival: "high", society: "average" },
  lore: [{ slug: "harbor-lore", labelKey: "MYMODULE.Lore.Harbor", tier: "high" }],
  equipmentProfileIds: ["my-module.harbor-pilot-gear"],
  weight: 5
});
```

Profession tags also feed appearance/personality context and optional Item Forge personal-treasure context.

## Roles

Roles are a separate narrative/mechanical axis from profession and class profile. They may provide narrow stat/skill adjustments or tags. The standalone editor exposes registered roles directly.

```js
api.content.registerRole("my-module", {
  id: "my-module.elite",
  labelKey: "MYMODULE.Role.Elite",
  tags: ["elite"],
  skillModifierAdjustment: 1,
  weight: 2
});
```

## Equipment profiles

```js
api.content.registerEquipmentProfile("my-module", {
  id: "my-module.harbor-pilot-gear",
  items: [{
    id: "rope",
    labelKey: "MYMODULE.Equipment.Rope",
    compendium: {
      packId: "pf2e.equipment-srd",
      slug: "rope",
      itemType: "equipment"
    },
    type: "equipment",
    purpose: "professional"
  }]
});
```

The async PF2e adapter resolves real compendium documents when possible and falls back to neutral generated sources when a reference cannot be resolved.

## Ancestries

An ancestry provider may contribute size, Speed, traits, languages, senses, age ranges, modest attribute adjustments, and intrinsic natural attacks. These are NPC identity profiles, not complete PC ancestry progression.

Intrinsic attacks should remain attack definitions rather than fake inventory weapons. NPC Forge will not automatically treat such natural attacks as poison-coated manufactured weapons.

## Name packs

Name packs may be ancestry- and locale-aware. Proper names can be literal strings; speaking family names/titles should use semantic IDs and localization keys.

```js
api.content.registerNamePack("my-module", {
  id: "my-module.dwarf-names",
  ancestryIds: ["core.dwarf"],
  supportedLocales: ["en", "de"],
  given: { female: ["Dagna"], male: ["Hargun"], neutral: ["Dori"] },
  family: [{ id: "ironhand", labelKey: "MYMODULE.Names.Ironhand", fallback: "Ironhand" }],
  weight: 10
});
```

## Appearance packs

Appearance traits are descriptive unless another explicit system gives them mechanics. Common categories are `build`, `facial`, `complexion`, `age`, `scar`, `hands`, and `posture`.

## Personality packs

Personality categories are `demeanor`, `trait`, `motivation`, `flaw`, `quirk`, and `secret`. Context fields such as `preferredTags`, `requiresTags`, `excludesTags`, and `avoidsTags` let content respond to class/profession/role context without hard-coded engine branches.

## Spellcasting profiles and spell themes

Use `registerSpellcastingProfile()` and `registerSpellTheme()` to contribute neutral spellcasting behavior and semantic PF2e spell pools. The Document Adapter remains responsible for Foundry/PF2e Item materialization.


## Background packs

Background packs contribute semantic entries in the categories `origin`, `formative`, `currentSituation`, `currentProblem`, `privateHook`, `standing`, `communityRole`, and `reputation`. Entries support the same context fields used by other narrative packs, including `preferredTags`, `requiresTags`, `excludesTags`, profession/class filters, role filters, and age categories. `privateHook` entries should use `visibility: "private"`.

```js
api.content.registerBackgroundPack("my-module", {
  id: "my-module.backgrounds",
  entries: [{
    id: "my-module.origin.frontier",
    category: "origin",
    labelKey: "MYMODULE.Background.Frontier.Name",
    descriptionKey: "MYMODULE.Background.Frontier.Description",
    preferredTags: ["wilderness"]
  }]
});
```

## Relationship packs

Relationship definitions describe graph edge types. Include a `reciprocalTypeId` whenever possible. Symmetric relationships point to themselves; asymmetric examples can pair mentor/student or creditor/debtor. Targets remain unresolved during single-NPC generation. Optional `targetPreferredTags`, `targetAvoidedTags`, `targetProfessionCategoryIds`, and `targetRoleIds` become constraints for an external graph resolver such as Crowd Forge.

```js
api.content.registerRelationshipPack("my-module", {
  id: "my-module.relationships",
  relationships: [{
    id: "my-module.relationship.shipmate",
    category: "friendship",
    labelKey: "MYMODULE.Relationship.Shipmate.Name",
    descriptionKey: "MYMODULE.Relationship.Shipmate.Description",
    reciprocalTypeId: "my-module.relationship.shipmate",
    preferredTags: ["maritime"]
  }]
});
```

Nested entry IDs are subject to the same namespace ownership rule as their parent packs.
