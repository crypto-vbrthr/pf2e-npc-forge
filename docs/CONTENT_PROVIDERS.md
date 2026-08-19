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
