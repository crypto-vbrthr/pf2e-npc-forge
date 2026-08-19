# PF2E NPC Forge

**Version 0.5.2 – Names & Localization**

NPC Forge is a Foundry VTT module for generating fully usable Pathfinder 2e NPCs through a reusable, API-first engine.


### 0.5.4 Appearance & Physical Traits

NPC identity can now include optional, structured physical features. The generator supports configurable intensity plus separate controls for body shape, scars/old injuries, age features, and posture. Traits are deterministic for a seed, localized in English/German, and can be supplied by external appearance packs.

## 0.5.2 focus

Name generation is now ancestry-aware, gender-aware, seed-stable, and localization-ready. The engine stores semantic generated-name parts instead of baking translated speaking surnames into the neutral NPC model. Presentation and PF2e document creation render those parts in the active locale.

Core name packs cover all 16 currently bundled Player Core / Player Core 2 ancestry profiles. Proper given names remain stable, while speaking family names can localize naturally, for example `Ironhand` / `Eisenhand`.

The standalone editor exposes a Name Pack selector filtered to the current ancestry and active Foundry locale. Manually entered names are never translated or rewritten.

### External name packs

Add-ons can register name packs through `api.content.registerNamePack()` and discover compatible packs through `api.content.listNamePacks()`. Packs can declare `supportedLocales`, ancestry constraints, gender-specific given-name pools, semantic localized family names, and optional epithets.

See `docs/CONTENT_PROVIDERS.md` and `docs/API.md`.

## Existing foundations

NPC Forge already includes the neutral NPC engine, public API, embedded editor contract, PF2e document adapter, GM Core statistic generation, core class profiles and abilities, hierarchical professions, compendium-backed equipment and strikes, and core ancestry/identity generation.

## Testing

Run:

```sh
npm test
```

See `docs/TESTING.md`, `docs/API.md`, and `docs/ARCHITECTURE.md`.
