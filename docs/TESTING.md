# Testing

NPC Forge uses Node's built-in `node:test` runner and a Foundry-independent core test strategy wherever practical.

## Commands

```bash
npm test
npm run check:release
npm run check
```

`npm test` runs unit, integration, adapter, API-contract, content, integration-service, and UI-contract tests.

The 1.4.2 release has automated tests covering, among other areas:

- level-scaled fundamental rune progression and opt-out behavior;
- PF2e weapon/armor/shield rune materialization without double-scaling NPC strikes;

- deterministic generation and weighted resolution;
- PF2e GM Core statistics/combat benchmarks;
- ancestry, identity, cultural/locale-aware names, ancestry-scoped automatic culture resolution, universal-name-pack preservation, compositional name generation, appearance, personality, background, social context, and structured relationships;
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
- DE/EN UI behavior, including optional name-culture controls;
- editor scroll/disclosure preservation;
- mounting the editor in an external host element;
- embedded default action bar and `actionBar: "host"` mode;
- mount/unmount/remount and multiple-session isolation.


## RC generation matrix

The final release includes a deterministic cross-product smoke test across every core ancestry and class profile at representative levels from -1 through 24. Professions and roles are rotated through the matrix, every generated model is validated and JSON-serialized, and repeated generation with the same request must be byte-for-byte deterministic. This catches interaction failures that isolated feature tests can miss.

### 1.3.0 editor locks and rerolls

The `tests/ui/section-locks.test.js` suite checks session-isolated locks, full Generate preservation, partial rerolls, identity/appearance independence, relationship/social preservation, equipment/attack coupling, wizard spellbook consistency, seeded editor generation, capability gating, UI wiring and conflict rejection.

### 1.4.0 manual statistic editing

`tests/ui/stat-adjustments.test.js` validates all supported numeric field categories, positive/negative steps, HP/AC/Speed bounds, rejection of unsupported targets, session isolation, host capability gating, section-lock/reroll behavior, preview control wiring, and PF2e Actor source materialization of edited abilities, defenses, skills and melee bonuses.

### 1.4.2 preview controls & independent locks

The preview now declares its +/- buttons in the Handlebars template (rather than dynamically injecting them at runtime), with a click/stop-propagation regression test. Attribute and defense lock states, inventory and attack lock states, item/strike coherency, reset semantics of numeric tweaks, and real PF2e actor source materialization are all covered.

### 1.4.2 nested statistic controls

- Verify the Skill/Lore and Strike `{{#each}}` rows read the editor capability via `@root.showStatAdjustments`, not the row-local Handlebars context.
- Verify that each row has both `−` and `+` controls and that disabling `adjustStats` hides both.
- Exercise skill and attack click events on the mounted editor core and confirm in-place value updates and Actor source materialization.
