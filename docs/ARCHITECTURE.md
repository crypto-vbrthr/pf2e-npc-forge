# Architecture

NPC Forge is separated into four public-facing layers:

1. **NPC Engine**: UI-free generation of a neutral NPC model.
2. **Content Registry**: built-in and third-party profiles.
3. **PF2e Document Adapter**: translates neutral models into PF2e Actor sources/documents.
4. **Editor UI**: standalone or embedded client of the public API.

## 0.2.0 statistics layer

Core statistics are generated from dedicated GM Core benchmark tables for levels -1 through 24. Class profiles express benchmark tiers rather than hard-coded final numbers. Professions can bias abilities and skills; roles can apply narrow numeric adjustments. This keeps content definitions reusable while centralizing PF2e benchmark math.

`statistics-builder.js` owns ability modifiers, perception, AC, HP, saves, and speed. `skill-builder.js` owns relevant standard skills and profession Lore. Neither builder creates Foundry documents.

## Compendium-backed equipment boundary

The NPC Engine never reads Foundry compendia. It emits semantic equipment references such as a PF2e pack id plus item slug. Compendium I/O belongs exclusively to the PF2e Document Adapter. This keeps generation deterministic and UI/Foundry independent while allowing created actors to contain authentic PF2e equipment documents.

The adapter uses the resolved weapon as the source of item identity, economic value, weapon group/base item, traits, and descriptive system data. NPC strike modifiers and scaled damage remain part of the neutral NPC model so PC equipment math cannot accidentally replace GM Core NPC benchmarks.


## Appearance generation

`appearance-builder.js` is an Engine-only content consumer. It reads registered appearance packs, filters traits against generation context, applies weighted preferences, and writes semantic appearance data into the neutral model. The Foundry UI and PF2e adapter only present/materialize that result; neither owns appearance-selection rules.


## External integration boundary

0.8.0 keeps optional specialist modules outside the neutral engine:

```text
Generation Request
      ↓
NPC Engine (deterministic integration intent only)
      ↓
Neutral NPC Model
      ↓
PF2e Document Adapter
      ├─ Affliction Forge reference materialization
      ├─ Item Forge personal-treasure materialization
      └─ PF2e Actor source
```

The adapter accesses integrations through `IntegrationService` wrappers. Readiness is probed dynamically so load order and optional-module activation do not turn into hard dependencies.
