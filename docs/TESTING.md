# Testing

NPC Forge uses Node's built-in `node:test` runner and a Foundry-independent core test strategy wherever practical.

## Commands

```bash
npm test
npm run check:release
npm run check
```

`npm test` runs unit, integration, adapter, API-contract, content, integration-service, and UI-contract tests.

The 1.0.0 final release contains **126 passing tests** covering, among other areas:

- level-scaled fundamental rune progression and opt-out behavior;
- PF2e weapon/armor/shield rune materialization without double-scaling NPC strikes;

- deterministic generation and weighted resolution;
- PF2e GM Core statistics/combat benchmarks;
- ancestry, identity, names, appearance, personality, background, social context, and structured relationships;
- professions, equipment, abilities, and spellcasting;
- PF2e Actor-source and compendium materialization;
- prepared/spontaneous spell slot references;
- Affliction Forge and Item Forge integration behavior;
- integration-status diagnostics;
- content namespace enforcement;
- compendium caching;
- standalone/embedded shared-editor architecture;
- editor-session isolation and lifecycle;
- section reroll behavior, including background/relationship/social rerolls, and host capability restrictions;
- controls/preview scroll and disclosure-state preservation;
- DE/EN localization and preview contracts.

## Release checks

`npm run check:release` additionally validates:

- JavaScript syntax with `node --check`;
- JSON parseability;
- DE/EN localization key parity;
- module/package/API version consistency;
- core content hierarchy validity;
- manifest download/version consistency;
- README/API/schema release metadata consistency.

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


## RC generation matrix

The final release includes a deterministic cross-product smoke test across every core ancestry and class profile at representative levels from -1 through 24. Professions and roles are rotated through the matrix, every generated model is validated and JSON-serialized, and repeated generation with the same request must be byte-for-byte deterministic. This catches interaction failures that isolated feature tests can miss.
