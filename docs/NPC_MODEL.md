# Neutral NPC Model

NPC Forge 0.8.4 uses **schema version 10**. `NpcEngine.generate()` returns plain serializable data and never a Foundry document.

Representative top-level shape:

```js
{
  schemaVersion: 10,
  generation: { seed, benchmark, ... },
  identity: { ... },
  build: { ... },
  statistics: { ... },
  skills: [],
  inventory: [],
  attacks: [],
  abilities: [],
  spellcasting: [],
  personality: { ... },
  integrations: { ... }
}
```

## `identity`

Contains semantic identity data such as:

- `name` fallback rendering;
- `nameParts` semantic/localizable name representation;
- `ancestry` definition;
- `gender`;
- age category/years;
- size;
- languages;
- senses;
- creature traits;
- generated appearance traits.

Appearance remains descriptive by default.

## `build`

Contains the resolved build axes:

- `level`
- `classProfile`
- `classSpecialization`
- `professionCategory`
- `profession`
- `professionSpecialization`
- `role`

The generated model stores the resolved specialization even when the request asked for an automatic/weighted specialization. Callers that want future rerolls should preserve the original request separately rather than feeding the resolved ID back as fixed input.

## `statistics`

Contains neutral NPC-facing statistics:

- six attribute modifiers;
- AC;
- HP;
- Perception;
- Fortitude, Reflex, Will;
- Speed.

Benchmark provenance is retained under generation/attack metadata where useful.

## `skills`

Each skill entry includes a slug, modifier, source/tier metadata, and optional localization key. Lore skills are represented alongside standard PF2e skills with `type: "lore"`.

## `inventory`

Inventory entries are semantic sources. A physical entry can include a PF2e compendium reference:

```js
{
  id: "primary-weapon",
  type: "weapon",
  compendium: {
    packId: "pf2e.equipment-srd",
    slug: "spear",
    itemType: "weapon"
  }
}
```

The neutral item is not the final Foundry Item. The async adapter resolves/clones the compendium document and adds provenance flags.

Wizard spellbooks are represented as inventory entries with semantic spellbook contents.

## `attacks`

NPC attacks remain separate from inventory weapons so creature-building attack and damage benchmarks are engine-owned.

Important fields include:

- `sourceWeaponId` for manufactured inventory weapons;
- attack modifier and tier;
- damage formula/type and benchmark metadata;
- traits.

Intrinsic ancestry attacks use `sourceWeaponId: null`. In 0.8.4 this distinction is also used to prevent accidental injury-poison coating of natural attacks.

## `abilities`

Neutral class/specialization abilities include labels/descriptions, action type, traits, parameters, and provenance. The adapter converts them into PF2e action Items.

## `spellcasting`

A spellcasting entry contains semantic casting information such as:

- tradition;
- prepared/spontaneous mode;
- casting ability;
- source type (spellbook, repertoire, familiar, etc.);
- DC and spell attack benchmark;
- highest rank/focus points;
- known/prepared/generated spells.

The adapter resolves real PF2e spell documents and constructs slot references.

## `personality`

When enabled, the model contains:

- demeanor;
- traits;
- motivation;
- flaw;
- quirk;
- optional secret;
- roleplaying kit (first impression, conversation behavior, pressure behavior, driving goal).

Secrets are materialized into private GM notes by the PF2e adapter.

## `integrations`

Schema 10 stores **integration intent**, not external module results. For example:

```js
{
  afflictionForge: {
    requested: true,
    policy: "automatic",
    charges: null
  },
  itemForge: {
    requested: true,
    category: null,
    targetValue: null
  }
}
```

The asynchronous adapter invokes external APIs and stores materialization diagnostics/results in Foundry Actor flags. These runtime results are not part of the neutral generation schema.
