# Architecture

NPC Forge is separated into four public-facing layers:

1. **NPC Engine**: UI-free generation of a neutral NPC model.
2. **Content Registry**: built-in and third-party profiles.
3. **PF2e Document Adapter**: translates neutral models into PF2e Actor sources/documents.
4. **Editor UI**: standalone or embedded client of the public API.

## 0.2.0 statistics layer

Core statistics are generated from dedicated GM Core benchmark tables for levels -1 through 24. Class profiles express benchmark tiers rather than hard-coded final numbers. Professions can bias abilities and skills; roles can apply narrow numeric adjustments. This keeps content definitions reusable while centralizing PF2e benchmark math.

`statistics-builder.js` owns ability modifiers, perception, AC, HP, saves, and speed. `skill-builder.js` owns relevant standard skills and profession Lore. Neither builder creates Foundry documents.
