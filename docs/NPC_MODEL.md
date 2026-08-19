# Neutral NPC Model

The neutral NPC model is JSON-serializable and intentionally avoids Foundry Documents.

Top-level sections in schema version 1:

- `generation`
- `identity`
- `build`
- `personality`
- `statistics`
- `skills`
- `abilities`
- `spellcasting`
- `inventory`
- `attacks`
- `relationships`
- `biography`
- `diagnostics`

Version 0.1.0 uses only a minimal subset of each section. Fields may be added compatibly before 1.0, while schema migrations will be documented when semantics change.
