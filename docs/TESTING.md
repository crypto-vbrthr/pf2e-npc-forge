# Testing

Run:

```bash
npm test
```

The 0.1.0 suite verifies deterministic seeds, weighted selection, registry hierarchy and external registration, API capabilities, neutral-model generation, actor-source generation, and editor-session isolation.


### Combat benchmark regressions

`tests/engine/combat-benchmarks.test.js` verifies complete Strike Damage table coverage, weapon-die-preserving scaling, level 12 fighter benchmarks, barbarian accuracy/damage tradeoffs, and agile damage-category reduction.
