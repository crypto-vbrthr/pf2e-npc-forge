# PF2E NPC Forge

**Version 0.6.0 – Personality & Roleplaying**

NPC Forge is a Foundry VTT module for generating fully usable Pathfinder 2e NPCs through a reusable, API-first engine.

## 0.6.0 Personality & Roleplaying

NPCs can now receive a deterministic, structured personality consisting of demeanor, character traits, motivation, weakness, quirk, and an optional secret. A roleplaying kit derives immediate table-facing guidance for first impression, conversation, behavior under pressure, and driving goal. Profession, class, role, ancestry, and age tags can influence weighted personality selection.

The neutral model stores semantic personality IDs and the PF2e adapter writes public roleplaying information to public notes while keeping generated secrets in private GM notes. External modules can extend the system through `api.content.registerPersonalityPack()`.


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


## Spellcasting (0.7.0)

Spellcaster class profiles now generate compact NPC-ready spell lists using GM Core spell DC/attack benchmarks. Spells are resolved from the PF2e spell compendium when Actors are materialized. Wizards also receive a spellbook that records their known spells separately from the spells prepared for the generated NPC.

## 0.8.1 editor state preservation

0.8.1 preserves editor scroll positions and collapsible section state across generation and dependency-driven rerenders.

## 0.8.0 external Forge integrations

NPC Forge can optionally delegate specialist content instead of reimplementing it:

- **Affliction Forge**: when poisoned weapons are allowed, eligible slashing/piercing NPC Strikes may receive a level-appropriate injury-poison reference. The reference is created through Affliction Forge and attached to the generated melee source, including charge tracking.
- **Item Forge**: when personal valuables are enabled, NPC Forge asks Item Forge to generate one personal treasure/art object appropriate to the NPC level and broad profession context. The returned creation-ready Item source is embedded in the generated Actor.
- Both integrations are optional. Missing or incompatible modules are treated as graceful fallbacks and never prevent baseline NPC creation.
- Integration state can be inspected through `api.integrations.status()`; 0.8.3 also adds async `api.integrations.inspect({ level })` diagnostics.
- The standalone editor has an **External Integrations** section that distinguishes connected, incomplete, inactive, and unavailable modules. Affliction Forge diagnostics also show enabled libraries and compatible injury-poison availability.
- Poison generation can use contextual automatic weighting or **always when possible** mode for deterministic testing/specialist NPCs. If no compatible poison exists in the preferred level window, the adapter widens the enabled-library search and picks the nearest available injury poison.

The neutral NPC model records integration requests, while materialization happens in the asynchronous PF2e Document Adapter. This keeps the NPC Engine deterministic and UI-free.
