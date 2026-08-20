# Neutral NPC Model

NPC Forge 0.9.1 uses **schema version 12**. `NpcEngine.generate()` returns plain serializable data and never a Foundry document.

Representative top-level shape:

```js
{
  schemaVersion: 12,
  generation: { seed, benchmark, ... },
  identity: { ... },
  build: { ... },
  personality: { ... },
  biography: { ... },
  relationships: [],
  socialContext: { ... },
  statistics: { ... },
  skills: [],
  inventory: [],
  attacks: [],
  abilities: [],
  spellcasting: [],
  integrations: { ... }
}
```

## `identity` and `build`

`identity` contains semantic name data, ancestry, gender, age, size, languages, senses, traits, and generated appearance. `build` contains resolved level, class profile/specialization, profession category/profession/specialization, and role.

## `personality`

When enabled, personality contains demeanor, traits, motivation, flaw, quirk, optional secret, and the table-facing roleplaying kit. Personality secrets materialize to private GM notes.

## `biography`

0.9.0 stores biography as semantic entries rather than a generated paragraph:

```js
{
  generated: true,
  intensity: "medium",
  origin: { id, category, labelKey, descriptionKey, visibility, source },
  formative: { ... },
  currentSituation: { ... },
  currentProblem: { ... },
  privateHook: { visibility: "private", ... }
}
```

The semantic representation keeps seeds stable across languages and allows external content packs to participate without requiring text parsing.

## `socialContext`

```js
{
  generated: true,
  standing: { ... },
  communityRole: { ... },
  reputation: { ... }
}
```

These entries describe how the NPC sits inside a community rather than adding mechanical modifiers by default.

## `relationships`

Relationships are structured graph edges:

```js
{
  id: "relationship-1",
  typeId: "core.relationship.mentor",
  category: "professional",
  labelKey: "...",
  descriptionKey: "...",
  reciprocalTypeId: "core.relationship.student",
  attitude: "respectful",
  importance: "normal",
  visibility: "public",
  target: {
    kind: "unresolved-npc",
    actorUuid: null,
    npcId: null,
    name: null,
    constraints: {
      preferredTags: [],
      avoidedTags: [],
      professionCategoryIds: [],
      roleIds: []
    }
  },
  source: { moduleId, packId }
}
```

Single-NPC generation intentionally does not invent a target Actor. Crowd Forge or another orchestrator can resolve the target later and use `reciprocalTypeId` to build the opposite edge. This keeps NPC Forge stateless and permits multiple independent graphs.

Private relationships and `biography.privateHook` are written to PF2e private notes; public biography/social/relationships go to public notes. The Actor flag keeps the structured relationship data for downstream tools.

## `statistics`, `skills`, `inventory`, `attacks`, `abilities`

Statistics contain the six modifiers, AC, HP, Perception, saves, and Speed. Skills include standard and Lore entries. Inventory remains semantic and may reference PF2e compendium documents. NPC attacks stay separate from inventory weapons so creature-building attack/damage benchmarks remain engine-owned. Abilities are neutral action definitions converted by the adapter.

Intrinsic ancestry attacks use `sourceWeaponId: null`, which also prevents accidental injury-poison coating by default.

Physical weapon, armor, and shield entries may additionally contain level-scaled fundamental rune metadata:

```js
{
  type: "weapon",
  fundamentalRunes: {
    profileId: "potency-2-greater-striking",
    profileLevel: 12,
    potency: 2,
    striking: 2
  }
}
```

Armor uses `potency`/`resilient`; shields use `reinforcing`. The async PF2e adapter writes these values to `system.runes` on the compendium-backed physical Item. The NPC attack entry remains benchmark-owned and is intentionally not recalculated from those item runes.

## `spellcasting`

Spellcasting entries contain tradition, prepared/spontaneous mode, casting ability, source type, DC/attack benchmarks, ranks/focus points, and semantic spell selections. The async adapter resolves real PF2e spell documents and constructs slot references.

## `integrations`

Schema 12 continues to store **integration intent**, not external module results. The async adapter invokes optional external APIs and stores runtime diagnostics/results in Foundry Actor flags.
