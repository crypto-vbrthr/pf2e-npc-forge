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
