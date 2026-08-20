# PF2E NPC Forge

**Version 0.8.5 – Embedded Editor Core & Public UI API**

PF2E NPC Forge generates roleplaying-ready Pathfinder 2e NPCs from a neutral, deterministic model and can materialize them as Foundry PF2e NPC Actors. It is designed as a platform for other Forge modules rather than a single monolithic generator.

## Current feature set

- Level-based PF2e NPC statistics, saves, Perception, skills, Lore, attacks, and damage benchmarks.
- 16 remastered core class profiles with NPC-facing specializations and signature abilities.
- 16 Player Core / Player Core 2 ancestry profiles with size, Speed, languages, senses, age, and selected intrinsic attacks.
- Hierarchical professions and profession specializations with equipment profiles.
- Ancestry-aware, locale-aware semantic name generation.
- Structured appearance, personality, secrets, and a roleplaying kit.
- Prepared and spontaneous spellcasting with compendium-backed spells and Wizard spellbooks.
- Compendium-backed PF2e equipment with NPC-owned strike scaling.
- Optional Affliction Forge injury-poison and Item Forge personal-treasure integration.
- DE/EN UI and generated presentation.
- Production-ready embeddable editor sessions for Encounter Forge, Crowd Forge, and other hosts.

## Architecture

```text
Generation Request
      ↓
Neutral NPC Engine
      ↓
Neutral NPC Model (schema 10)
      ↓
PF2e Document Adapter
      ↓
Foundry NPC Actor + embedded Items
```

The generation engine remains independent from Foundry documents and optional Forge modules. The UI is also layered: both the standalone application and external hosts mount the same shared `NpcEditorCore` through a public `NpcEditorSession`.

See `docs/ARCHITECTURE.md`, `docs/NPC_MODEL.md`, and `docs/EMBEDDED_EDITOR.md`.

## 0.8.5 shared editor core

0.8.5 replaces the old embedded-editor placeholder with the complete NPC Forge editor:

- The standalone `ApplicationV2` window is now only a shell around `api.ui.createEditor()`.
- Embedded hosts get the same controls, preview, integration diagnostics, scroll preservation, and disclosure-state handling.
- Sessions support `mount`, `unmount`, `destroy`, `getRequest`, `getNpc`, `setRequest`, `setNpc`, `generate`, `rerollSection`, `createActor`, `commit`, and `cancel`.
- Host capabilities can disable Actor creation, section rerolls, or inventory editing.
- `actionBar: "host"` lets a surrounding application own Save/Cancel controls without duplicating the editor UI.
- Multiple mounted or unmounted sessions remain isolated; no global current-NPC state exists.
- Partial section rerolls preserve resolved build axes and record deterministic reroll metadata.

The public API now advertises `embedded-editor`, `editor-session-api`, `editor-section-reroll`, `host-action-bar`, and `shared-editor-core`.

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
  role: "core.veteran"
});

const actor = await api.documents.createActor(npc);
```

Public API version: **0.8.5**  
Neutral model schema: **10**

Embedded use:

```js
const session = api.ui.createEditor({
  mode: "embedded",
  capabilities: { createActor: false },
  actionBar: "host",
  onCommit: ({ npc }) => saveNpc(npc)
});

session.mount(container);
```

See `docs/API.md` and `docs/EMBEDDED_EDITOR.md`.

## Development and checks

```bash
npm test
npm run check:release
npm run check
```

`npm run check` runs the complete test suite followed by release-contract validation.
