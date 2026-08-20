# Architecture

PF2E NPC Forge 0.8.4 is organized around a strict separation between content generation, PF2e document materialization, UI, and optional integrations.

## 1. Neutral NPC Engine

`NpcEngine` consumes a normalized generation request plus `ContentRegistry` data and returns a plain serializable NPC model.

The engine owns:

- deterministic seeded selection;
- class, profession, role, ancestry, identity, appearance, and personality resolution;
- GM Core-style statistics and strike benchmarks;
- inventory intent and attack definitions;
- spellcasting intent and semantic spell references;
- optional integration intent.

The engine does not create Foundry Actors and does not call Affliction Forge, Item Forge, or Loot Forge.

## 2. Content Registry

The registry is the extension boundary for add-on content. Registered definitions are deep-cloned and tagged with `sourceModule`.

### Namespace ownership

0.8.4 enforces ownership of registry IDs:

- NPC Forge core content is registered by `pf2e-npc-forge` and owns `core.*`.
- An external module `my-module` owns `my-module.*`.
- A module may reference another provider's IDs through fields such as `parentId`, but the ID of the definition it creates must remain in its own namespace.

This prevents silent namespace capture and makes provider provenance reliable.

## 3. PF2e Document Adapter

`Pf2eDocumentAdapter` turns the neutral model into a PF2e NPC Actor source.

It owns:

- PF2e Actor schema mapping;
- compendium-backed equipment and spell resolution;
- NPC `melee`, `action`, `spellcastingEntry`, and spell Item creation;
- public/private notes and Forge provenance flags;
- optional external Forge materialization.

`toActorSource()` is synchronous and does not perform compendium I/O. `toActorSourceAsync()`, `createActor()`, and `createActors()` use the full materialization path.

### Compendium resolver cache

Each adapter owns a `CompendiumResolver` that caches:

- pack indexes by pack ID;
- resolved documents by pack + item type + slug;
- failed slug lookups for the lifetime of the adapter.

This prevents repeated `getIndex()` work when many NPCs are generated in one batch. `clearCompendiumCache()` can invalidate the cache if pack content changes during a session.

## 4. External Forge integrations

External services are wrapped by `IntegrationService`.

A service is `ready` only when:

1. its module is installed;
2. the module is active;
3. an API object is available;
4. the integration is implemented;
5. all required API paths exist.

Current states:

- Affliction Forge: implemented.
- Item Forge: implemented.
- Loot Forge: detection only, integration planned.

The neutral engine records intent. The adapter performs calls. Failures are diagnostics, not fatal NPC-generation errors.

## 5. UI layers

### Standalone application

`NpcForgeApp` is the currently complete user-facing editor shell. It owns form state, generation, preview, integration diagnostics, Actor creation, and UI-state preservation.

### Editor session API

`NpcEditorSession` provides an isolated host/session contract but its mounted renderer remains experimental in 0.8.4. It is intentionally advertised as `experimental-editor-session`, not `embedded-editor`.

0.8.5 is intended to extract a shared editor core so the standalone window and host-mounted editor render the same controls and preview.

## 6. Public API

`NpcForgeApi` is the platform surface exposed through the Foundry module API. Consumers should use capability checks and documented methods rather than importing internal files.

See `API.md` for stability categories.
