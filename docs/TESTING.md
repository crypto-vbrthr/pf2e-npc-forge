# Testing

NPC Forge uses Node's built-in `node:test` runner and a Foundry-independent core test strategy wherever practical.

## Commands

```bash
npm test
npm run check:release
npm run check
```

`npm test` runs unit, integration, adapter, API-contract, content, integration-service, and UI-contract tests.

The 0.8.5 release contains **112 passing tests** covering, among other areas:

- deterministic generation and weighted resolution;
- PF2e GM Core statistics/combat benchmarks;
- ancestry, identity, names, appearance, and personality;
- professions, equipment, abilities, and spellcasting;
- PF2e Actor-source and compendium materialization;
- prepared/spontaneous spell slot references;
- Affliction Forge and Item Forge integration behavior;
- integration-status diagnostics;
- content namespace enforcement;
- compendium caching;
- standalone/embedded shared-editor architecture;
- editor-session isolation and lifecycle;
- section reroll behavior and host capability restrictions;
- controls/preview scroll and disclosure-state preservation;
- DE/EN localization and preview contracts.

## Release checks

`npm run check:release` additionally validates:

- JavaScript syntax with `node --check`;
- JSON parseability;
- DE/EN localization key parity;
- module/package/API version consistency;
- core content hierarchy validity.

`npm run check` runs tests and then all release checks.

## Foundry live testing

Node tests mock Foundry/PF2e document behavior. Releases still require a live Foundry smoke test for:

- standalone Actor creation and sheet rendering;
- prepared/spontaneous spell visibility;
- compendium-backed equipment;
- Affliction Forge poison runtime behavior;
- Item Forge treasure generation;
- DE/EN UI behavior;
- editor scroll/disclosure preservation;
- mounting the editor in an external host element;
- embedded default action bar and `actionBar: "host"` mode;
- mount/unmount/remount and multiple-session isolation.
