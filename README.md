# PF2E NPC Forge

**Version 0.3.5 – Preview Scroll Preservation Fix**

NPC Forge is a Foundry VTT module for generating fully usable Pathfinder 2e NPCs through a reusable, API-first engine.

## 0.3.5 focus

This maintenance release preserves the preview scroll position across class-driven rerenders and full preview regeneration. The fix is centralized in the standalone editor application so future UI refresh paths can reuse the same behavior instead of adding one-off patches.

All class profiles, abilities, compendium-backed equipment, public API contracts, and embedded-editor behavior from 0.3.4 remain unchanged.

### Compendium-backed equipment

Generated weapon choices are semantic references until Foundry document creation. The PF2e document adapter resolves them against the regular `pf2e.equipment-srd` pack and clones the real PF2e weapon into the NPC actor. This preserves the weapon's normal PF2e data, including its price/value, traits, group, base item, and description. NPC strikes use the resolved weapon for identity and weapon traits, but NPC-level attack and damage scaling remains controlled by the NPC Engine. If the compendium cannot be resolved, actor creation falls back to the generated weapon source rather than failing.


## Testing

Run:

```sh
npm test
```

See `docs/TESTING.md`, `docs/API.md`, and `docs/ARCHITECTURE.md`.
