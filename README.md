# PF2E NPC Forge

PF2E NPC Forge is a modular NPC generation platform for Foundry VTT and the Pathfinder Second Edition system.

## Version 0.1.0 — Architecture Baseline

This release intentionally implements a small vertical slice. Its purpose is to establish stable contracts before the content library grows.

### Included

- UI-free `NpcEngine`
- deterministic seeded random service
- weighted resolver
- extensible content registry
- profession-category hierarchy
- public registration API for class and profession content
- neutral serializable NPC model
- public PF2e document adapter
- public embedded editor-session contract
- Actor Directory launch button
- minimal standalone live preview
- minimal Human/Dwarf, Fighter, Guard/Blacksmith/Criminal content
- automated contract tests
- English architecture/API documentation

### Intentionally deferred

Full statistics, spellcasting, rich class analogues, profession specialization, localized semantic name generation, appearance, personality, Item Forge valuables, Affliction Forge injury poisons, and full quick-NPC presets are later milestones.

## API

```js
const api = game.modules.get("pf2e-npc-forge")?.api;
const npc = await api.engine.generate({
  seed: "example-guard",
  level: 3,
  ancestry: "core.human",
  classProfile: "core.fighter",
  profession: "core.guard"
});

const actor = await api.documents.createActor(npc);
```

See `docs/API.md` and `docs/EMBEDDED_EDITOR.md`.
