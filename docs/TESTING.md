# Testing

NPC Forge uses Node's built-in `node:test` runner and keeps the neutral engine testable without a running Foundry instance.

## Commands

```bash
npm test
npm run check:release
npm run check
```

### `npm test`

Runs the complete unit/integration/contract suite. The 0.8.4 release contains **105 passing tests** covering:

- seeded random determinism;
- weighted resolution;
- registry namespace ownership and hierarchy validation;
- class profiles, specializations, abilities, roles, professions, and skills;
- core statistics and GM Core benchmark tables;
- ancestries, names, appearance, and personality;
- inventory, compendium-backed equipment, and strike materialization;
- spellcasting entry/slot materialization;
- Affliction Forge and Item Forge integration behavior/fallbacks;
- integration readiness/planned states;
- document-adapter compendium caching;
- public API contracts;
- localization catalogs;
- editor state preservation and markup contracts.

### `npm run check:release`

Runs non-behavioral release validation:

- `node --check` for all JavaScript files;
- JSON parsing for all JSON files;
- exact DE/EN localization-key parity;
- `module.json` / `package.json` version consistency with `API_VERSION`;
- neutral schema sanity;
- core class/profession hierarchy validation.

### `npm run check`

Runs both the full test suite and release checks. This is the recommended pre-package command.

## Foundry live testing

Node tests mock Foundry/PF2e document behavior. Releases should still receive a live Foundry smoke test for:

- Actor creation and sheet rendering;
- PF2e system schema compatibility;
- prepared/spontaneous spell visibility;
- compendium-backed equipment;
- Affliction Forge poison runtime behavior;
- Item Forge treasure generation;
- DE/EN UI behavior;
- editor scroll/disclosure preservation.

The embedded editor renderer remains experimental in 0.8.4 and should be separately validated once the shared editor core is implemented.
