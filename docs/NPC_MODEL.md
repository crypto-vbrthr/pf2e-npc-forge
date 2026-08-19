# Neutral NPC Model

NPC Forge 0.2.0 uses schema version 2. The engine returns plain serializable data and never a Foundry document.

Core model areas:

- `identity`: name, ancestry, later appearance data.
- `build`: level, class profile, profession/category, role.
- `statistics`: six ability modifiers, perception, AC, HP, saves, speed, plus benchmark tiers.
- `skills`: relevant standard skills and profession Lore entries with modifier, tier, source, and linked ability when applicable.
- `inventory` and `attacks`: baseline loadout data retained from 0.1.0.
- `diagnostics`: warnings/fallbacks.

`statistics.benchmarkSource` identifies the PF2e GM Core creature-building benchmark used by the core builder. Consumers must treat the neutral model as the stable interchange format and must not depend on PF2e Actor internals.


## Class specialization and abilities

`build.classSpecialization` contains the resolved optional specialization. `abilities` is an array of neutral ability definitions with `id`, localization keys, `actionType`, optional `actions`, traits, source metadata, and optional scaling parameters.

## Equipment references

Inventory entries can include a semantic compendium reference without becoming Foundry documents:

```js
{
  id: "primary-weapon",
  type: "weapon",
  source: "compendium",
  compendium: { packId: "pf2e.equipment-srd", slug: "spear" },
  damage: { dice: 1, die: "d6", type: "piercing" },
  traits: ["thrown-20"]
}
```

The local damage/trait fields are deliberate fallbacks and allow deterministic previews and graceful operation when Foundry or a target compendium is unavailable.

## 0.4.0 profession and inventory fields

`build.professionCategory`, `build.profession`, and `build.professionSpecialization` preserve the resolved occupation hierarchy.

Inventory entries may contain:

```js
{
  id: "guard-shield",
  type: "shield",
  purpose: "shield",
  origin: "profession",
  quantity: 1,
  equipped: true,
  compendium: {
    packId: "pf2e.equipment-srd",
    slug: "steel-shield",
    itemType: "shield"
  }
}
```

Weapons remain linked to generated NPC attacks through `attack.sourceWeaponId`.

## Identity model (schema v4)

`identity` now contains structured ancestry-facing information:

```js
{
  name,
  ancestry,
  gender,
  age: { category, years },
  size,
  traits: [],
  languages: [],
  senses: [],
  appearance
}
```

Gender and age are identity data, not PF2e combat statistics. Age ranges are ancestry-aware generation ranges intended for plausible NPC presentation rather than PC aging rules.


## `identity.appearance`

When enabled, 0.5.4 adds a structured appearance record:

```js
{
  generated: true,
  intensity: "medium",
  traits: [
    {
      id: "core.appearance.build.sturdy",
      category: "build",
      categoryKey: "NPCFORGE.Appearance.Category.Build",
      labelKey: "NPCFORGE.Appearance.Traits.Sturdy",
      source: { moduleId: "pf2e-npc-forge", packId: "core.appearance.general" }
    }
  ]
}
```

Consumers should use `id`/`category` for logic and render `labelKey` through the active locale.

## Personality model (schema 7)

`npc.personality` is either `null` or a structured generated personality object. It contains semantic entries for `demeanor`, `traits`, `motivation`, `flaw`, `quirk`, and optional `secret`, plus a derived `roleplaying` object. Visible strings remain localization-layer concerns; engine data stores stable IDs and localization keys.

The roleplaying object provides immediate table-facing guidance for first impression, normal conversation, behavior under pressure, and driving goal. Consumers should treat `secret` as GM-private information unless the user explicitly chooses otherwise.

## Attack benchmark fields (schema 8)

Each attack can include benchmark provenance in addition to its executable modifier and damage formula:

```js
{
  modifier: 26,
  attackTier: "high",
  damage: {
    formula: "4d6+16",
    type: "piercing",
    benchmarkTier: "high",
    expectedAverage: 30,
    actualAverage: 30,
    benchmarkFormula: "3d10+14"
  }
}
```

The item and the NPC Strike intentionally remain distinct. A compendium weapon preserves its authentic PF2e item data and value; the Strike uses creature-building damage appropriate to the NPC level.
