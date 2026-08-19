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
