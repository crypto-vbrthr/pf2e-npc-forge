# PF2E NPC Forge

**Version 0.2.0 – Core Statistics & Skills**

NPC Forge is a Foundry VTT module for generating fully usable Pathfinder 2e NPCs through a reusable, API-first engine.

## 0.2.0 focus

This release replaces the 0.1.0 placeholder statistics with a benchmark-driven statistics layer based on the PF2e GM Core creature-building guidance. Generated NPCs now receive coherent ability modifiers, Perception, AC, HP, saves, ancestry speed, relevant skills, and profession Lore. Class, profession, ancestry, and role data contribute through explicit content-profile hints rather than UI logic.

The standalone Actor-directory workflow, neutral NPC model, public API, PF2e document adapter, seeded generation, content registry, and embedded editor contract remain intact.

## Testing

Run:

```sh
npm test
```

See `docs/TESTING.md`, `docs/API.md`, and `docs/ARCHITECTURE.md`.
