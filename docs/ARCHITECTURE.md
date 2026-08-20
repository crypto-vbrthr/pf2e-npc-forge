# Architecture

PF2E NPC Forge 0.8.5 is organized around a strict separation between content generation, PF2e document materialization, reusable editor UI, and optional integrations.

## 1. Neutral NPC Engine

`NpcEngine` consumes a normalized generation request plus `ContentRegistry` data and returns a plain serializable NPC model.

The engine owns deterministic selection; class/profession/role/ancestry resolution; identity, appearance, personality, statistics, skills, abilities, inventory intent, attacks, spellcasting intent, and optional integration intent.

It does not create Foundry Actors and does not call Affliction Forge, Item Forge, or Loot Forge.

## 2. Content Registry

The registry is the extension boundary for add-on content. Registered definitions are deep-cloned and tagged with `sourceModule`.

Namespace ownership is enforced:

- NPC Forge core owns `core.*`.
- An external module `my-module` owns `my-module.*`.
- Add-ons may reference another provider's IDs, such as a core parent, but definitions they register must remain in their own namespace.

## 3. PF2e Document Adapter

`Pf2eDocumentAdapter` converts the neutral model into PF2e NPC Actor sources and embedded Items.

It owns PF2e schema mapping, compendium-backed equipment/spells, NPC attacks/actions/spellcasting entries, notes/flags, and optional external Forge materialization.

`toActorSource()` is synchronous. `toActorSourceAsync()`, `createActor()`, and `createActors()` use the full materialization path.

### Compendium resolver cache

Each adapter owns a resolver cache for pack indexes, successful document resolutions, and failed slug lookups. This avoids repeated pack-index work during batch/Crowd creation.

## 4. External Forge integrations

External modules are wrapped by `IntegrationService`. A service is ready only when the module is installed, active, exposes an API, the bridge is implemented, and required API paths exist.

- Affliction Forge: implemented.
- Item Forge: implemented.
- Loot Forge: detected, bridge planned.

The engine records intent; the adapter performs calls. Integration failures become diagnostics rather than generation failures.

## 5. Shared editor architecture

0.8.5 removes the previous split between a complete standalone editor and a placeholder embedded renderer.

```text
NpcForgeApp (ApplicationV2 shell)
             │
             ▼
      NpcEditorSession  ◀──── external host (Encounter/Crowd/etc.)
             │
             ▼
        NpcEditorCore
             │
             ▼
     npc-editor-core.hbs
```

### `NpcEditorSession`

The session is the public state/lifecycle boundary. It owns:

- request state;
- current neutral NPC;
- capabilities;
- default Actor-creation options;
- host callbacks;
- deterministic section-reroll counters;
- mount/unmount/destroy lifecycle.

Sessions are independent. There is no global current NPC.

### `NpcEditorCore`

The core is an internal renderer/controller shared by every host. It owns:

- Handlebars context preparation;
- form binding and dependent selects;
- integration diagnostics;
- preview presentation;
- scroll/disclosure-state preservation;
- default action bars;
- dispatch into public session methods.

External modules should not import `NpcEditorCore` directly. They should create a session through `api.ui.createEditor()`.

### Standalone shell

`NpcForgeApp` contains no duplicate NPC form. Its template only exposes a mount host, then creates a normal editor session in `mode: "standalone"` and mounts it. Therefore future editor changes automatically affect standalone and embedded use together.

### Host-owned action bars

An embedded host may use `actionBar: "host"` to hide editor footers and drive `generate()`, `commit()`, `cancel()`, or `createActor()` from its own controls.

## 6. Section rerolls

`NpcEditorSession.rerollSection()` generates a candidate with a derived deterministic seed and merges only the requested domain. Partial rerolls freeze the current resolved build axes so rerolling personality does not unexpectedly resolve a different profession/class specialization.

Reroll provenance is stored under `npc.generation.rerolls`.

## 7. Public API

`NpcForgeApi` is the platform surface exposed through the Foundry module API. Consumers should use capability checks and documented methods instead of importing internal implementation files.

See `API.md` and `EMBEDDED_EDITOR.md`.
