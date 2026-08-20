# PF2E NPC Forge

**Version 0.9.1 – Level-Scaled Equipment & Fundamental Runes**

PF2E NPC Forge generates roleplaying-ready Pathfinder 2e NPCs from a neutral, deterministic model and can materialize them as Foundry PF2e NPC Actors. It is designed as a platform for other Forge modules rather than a single monolithic generator.

## Current feature set

- Level-based PF2e NPC statistics, saves, Perception, skills, Lore, attacks, and damage benchmarks.
- 16 remastered core class profiles with NPC-facing specializations and signature abilities.
- 16 Player Core / Player Core 2 ancestry profiles with size, Speed, languages, senses, age, and selected intrinsic attacks.
- Hierarchical professions and profession specializations with equipment profiles.
- Ancestry-aware, locale-aware semantic name generation.
- Structured appearance, personality, secrets, and a roleplaying kit.
- Structured biography, social standing, reputation, community role, current problems, GM hooks, and NPC relationships.
- Relationship records include reciprocal type metadata and unresolved target constraints for future Crowd/Encounter graph resolution.
- Prepared and spontaneous spellcasting with compendium-backed spells and Wizard spellbooks.
- Compendium-backed PF2e equipment with level-scaled fundamental weapon/armor runes and reinforcing shield runes.
- NPC melee statistics remain creature-benchmark owned, so equipment runes never double-scale generated Strike damage.
- Optional Affliction Forge injury-poison and Item Forge personal-treasure integration.
- DE/EN UI and generated presentation.
- Production-ready embeddable editor sessions for Encounter Forge, Crowd Forge, and other hosts.

## Architecture

```text
Generation Request
      ↓
Neutral NPC Engine
      ↓
Neutral NPC Model (schema 12)
      ↓
PF2e Document Adapter
      ↓
Foundry NPC Actor + embedded Items
```

The generation engine remains independent from Foundry documents and optional Forge modules. Both the standalone application and external hosts mount the same shared `NpcEditorCore` through a public `NpcEditorSession`.

See `docs/ARCHITECTURE.md`, `docs/NPC_MODEL.md`, and `docs/EMBEDDED_EDITOR.md`.


## 0.9.1 level-scaled equipment

0.9.1 keeps high-level NPC inventories mechanically appropriate instead of leaving a level 12 veteran with completely mundane gear. With **Level-scaled fundamental runes** enabled (the default), generated physical equipment receives the highest fundamental profile available at or below the NPC level:

- weapons: potency and striking progression;
- armor: potency and resilient progression;
- shields: reinforcing rune progression.

This data is stored semantically in `inventory[].fundamentalRunes` and applied to the real PF2e compendium item only during document materialization. Generated NPC `melee` items continue to use GM Core creature-building attack and damage benchmarks, so striking runes do not add a second layer of damage scaling. The editor can disable this progression when a deliberately mundane loadout is desired.

## 0.9.0 narrative social layer

0.9.0 adds a structured social layer instead of storing background as free text:

- origin and formative experience;
- current life situation and current problem;
- optional GM-only background hook;
- social standing, community role, and reputation;
- configurable relationships with public/private visibility;
- reciprocal relationship type IDs such as mentor/student or creditor/debtor;
- unresolved target descriptors that Crowd Forge can later resolve into other generated NPCs or Actors;
- new `backgroundPacks` and `relationshipPacks` provider types;
- dedicated editor controls and preview sections;
- public background information materialized to PF2e public notes and private hooks/relationships to private GM notes.

## Shared editor core

The standalone `ApplicationV2` window is a shell around `api.ui.createEditor()`. Embedded hosts receive the same controls, preview, integration diagnostics, scroll preservation, disclosure-state handling, and the new background/social controls.

Sessions support `mount`, `unmount`, `destroy`, `getRequest`, `getNpc`, `setRequest`, `setNpc`, `generate`, `rerollSection`, `createActor`, `commit`, and `cancel`. Background, relationships, and social context can be rerolled independently.

## External integrations

The editor reports the detected state of Affliction Forge, Item Forge, and Loot Forge.

- **Affliction Forge:** implemented for injury poisons on suitable manufactured weapons.
- **Item Forge:** implemented for personal treasure/art objects.
- **Loot Forge:** detected only; a direct bridge remains planned.

All integrations degrade gracefully.

## Public API

```js
const api = game.modules.get("pf2e-npc-forge")?.api;

const npc = api.engine.generate({
  seed: "dock-guard-01",
  level: 5,
  ancestry: "core.human",
  classProfile: "core.fighter",
  profession: "core.guard",
  role: "core.veteran",
  background: {
    intensity: "medium",
    generateRelationships: true,
    generateSocialContext: true
  }
});

const actor = await api.documents.createActor(npc);
```

Public API version: **0.9.1**  
Neutral model schema: **12**

See `docs/API.md` and `docs/EMBEDDED_EDITOR.md`.

## Development and checks

```bash
npm test
npm run check:release
npm run check
```

`npm run check` runs the complete test suite followed by release-contract validation.
