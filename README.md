# PF2E NPC Forge

**Version 0.8.4 – Architecture & Contract Hardening**

PF2E NPC Forge generates roleplaying-ready Pathfinder 2e NPCs from a neutral, deterministic model and can materialize them as Foundry PF2e NPC Actors. The project is designed as a platform for other Forge modules rather than a single monolithic generator.

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

## Architecture

The generation path is deliberately split:

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

The neutral engine does not need Foundry documents or optional Forge modules. External integrations are invoked only by the asynchronous document adapter during Actor materialization.

See `docs/ARCHITECTURE.md` and `docs/NPC_MODEL.md`.

## 0.8.4 hardening

0.8.4 focuses on contracts rather than adding a new content domain:

- External content IDs are now required to belong to the registering module's namespace. Third-party modules can no longer claim `core.*` or another add-on's namespace.
- The standalone editor exposes the NPC **Role** and the preview includes it.
- Automatic class specialization remains automatic after regeneration instead of being silently converted into a fixed choice.
- Item Forge context now recognizes the actual scholarly, religious, mercantile, class, and specialization tags used by NPC Forge content.
- Loot Forge is reported as **detected / integration planned**, not falsely as a completed connection.
- Integration readiness now requires the external module to be active.
- Item Forge errors stored in Actor flags are plain serializable text.
- Size presentation supports Tiny, Small, Medium, Large, Huge, and Gargantuan.
- Injury poisons are restricted to manufactured weapon attacks by default; intrinsic claws, bites, and similar attacks are not poisoned accidentally.
- PF2e compendium indexes and resolved documents are cached per document adapter, which substantially reduces repeated pack work for batch/Crowd generation.
- Release checks now verify tests, JavaScript syntax, JSON, localization parity, version consistency, and core content hierarchy.

## External integrations

The standalone editor has an **External Integrations** section showing the detected state of Affliction Forge, Item Forge, and Loot Forge.

- **Affliction Forge:** implemented. Can attach injury-poison references to suitable manufactured piercing/slashing weapon strikes.
- **Item Forge:** implemented. Can generate a personal treasure/art object appropriate to broad NPC context.
- **Loot Forge:** detected only. A direct Loot Forge bridge is planned, but 0.8.4 does not call Loot Forge generation APIs.

All integrations degrade gracefully. NPC creation continues if a specialist Forge is missing, inactive, incomplete, or returns no suitable result.

## Public API

After `pf2eNpcForgeReady`:

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

The public API version is **0.8.4** and the neutral model schema is **10**. Consumers should check `api.capabilities` rather than infer features from the module version.

See `docs/API.md` and `docs/CONTENT_PROVIDERS.md`.

## Embedded editor status

`api.ui.createEditor()` and the editor-session lifecycle remain **experimental** in 0.8.4. The current `mount()` renderer is still a placeholder and therefore the module deliberately does **not** advertise the production `embedded-editor` capability yet. The planned 0.8.5 block will make the standalone and embedded UI share the same real editor core.

See `docs/EMBEDDED_EDITOR.md`.

## Development and checks

```bash
npm test
npm run check:release
npm run check
```

`npm run check` runs the complete test suite followed by release-contract validation.
