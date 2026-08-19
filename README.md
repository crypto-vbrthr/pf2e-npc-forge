# PF2E NPC Forge

**Version 0.2.0 – Core Statistics & Skills**

NPC Forge is a Foundry VTT module for generating fully usable Pathfinder 2e NPCs through a reusable, API-first engine.

## 0.2.0 focus

This release replaces the 0.1.0 placeholder statistics with a benchmark-driven statistics layer based on the PF2e GM Core creature-building guidance. Generated NPCs now receive coherent ability modifiers, Perception, AC, HP, saves, ancestry speed, relevant skills, and profession Lore. Class, profession, ancestry, and role data contribute through explicit content-profile hints rather than UI logic.

The standalone Actor-directory workflow, neutral NPC model, public API, PF2e document adapter, seeded generation, content registry, and embedded editor contract remain intact.

### Compendium-backed equipment

Generated weapon choices are semantic references until Foundry document creation. The PF2e document adapter resolves them against the regular `pf2e.equipment-srd` pack and clones the real PF2e weapon into the NPC actor. This preserves the weapon's normal PF2e data, including its price/value, traits, group, base item, and description. NPC strikes use the resolved weapon for identity and weapon traits, but NPC-level attack and damage scaling remains controlled by the NPC Engine. If the compendium cannot be resolved, actor creation falls back to the generated weapon source rather than failing.


## Testing

Run:

```sh
npm test
```

See `docs/TESTING.md`, `docs/API.md`, and `docs/ARCHITECTURE.md`.
