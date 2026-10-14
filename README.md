# PF2E NPC Forge

**Version 1.4.2 – Skills & Strike Adjustment Controls Visibility Fix**

PF2E NPC Forge generates roleplaying-ready Pathfinder 2e NPCs from a neutral, deterministic model and can materialize them as Foundry PF2e NPC Actors. It is designed as a platform for other Forge modules rather than a single monolithic generator.

**1.4.2 hotfix:** Manual `−`/`+` adjustments are now visible for each Skill (including Lore) and each Strike attack bonus. The existing attribute, defense, and saving throw controls continue to work as before. The fix corrects the Handlebars template scope in repeated rows and does not change the NPC model or other editor interactions.


## Part of the Forge Suite

**NPC Forge** is part of the **Forge Suite**, a growing collection of Foundry VTT modules and add-ons built for the busy Game Master. The suite is designed to reduce preparation and bookkeeping, make common GM tasks easier, and add useful tools that help make running and playing campaigns smoother and more enjoyable.

An overview of the Forge Suite, its modules, add-ons, and shared documentation is available here:

**Forge Suite:** https://github.com/crypto-vbrthr/pf2e-forge-suite


## Feedback, Bug Reports & Feature Requests

Found a bug, have an idea for an improvement, or would like to suggest a new feature?

Feedback is always welcome. Please feel free to open a new **GitHub Issue** at any time, whether you want to report a problem, suggest a quality-of-life improvement, propose a new feature, or share an idea for how the module could be made more useful.

When reporting a bug, please include as much relevant information as possible, such as the Foundry VTT version, PF2e system version, module version, steps to reproduce the issue, and any console errors or screenshots that may help identify the problem.

Suggestions and feature requests are equally welcome. Even small ideas can lead to useful improvements.

**Open an issue here:** https://github.com/crypto-vbrthr/pf2e-npc-forge/issues


## Current feature set

- Level-based PF2e NPC statistics, saves, Perception, skills, Lore, attacks, and damage benchmarks.
- 16 remastered core class profiles with NPC-facing specializations and signature abilities.
- 16 Player Core / Player Core 2 ancestry profiles with size, Speed, languages, senses, age, and selected intrinsic attacks.
- Hierarchical professions and profession specializations with equipment profiles.
- Ancestry-aware, locale-aware semantic name generation with optional cultural name providers and compositional name packs.
- **Custom Names** tab for GMs: create, edit, export, and import world-level homebrew cultures and name packs, including gendered given names, name prefixes/suffixes, surnames, and epithets.
- Structured appearance, personality, secrets, and a roleplaying kit.
- Structured biography, social standing, reputation, community role, current problems, GM hooks, and NPC relationships.
- Relationship records include reciprocal type metadata and unresolved target constraints for future Crowd/Encounter graph resolution.
- Prepared and spontaneous spellcasting with compendium-backed spells and Wizard spellbooks.
- Compendium-backed PF2e equipment with level-scaled fundamental weapon/armor runes and reinforcing shield runes.
- NPC melee statistics remain creature-benchmark owned, so equipment runes never double-scale generated Strike damage.
- Optional Affliction Forge injury-poison and Item Forge personal-treasure integration.
- DE/EN UI and generated presentation.
- **One-click section rerolls and locks:** preserve chosen NPC details when generating again or regenerate a single section directly in the preview.
- **Manual +/- statistic controls** in the preview for all six ability modifiers, AC, HP, Perception, saving throws, Speed, individual skills and attack bonuses.
- Production-ready embeddable editor sessions for Encounter Forge, Crowd Forge, and other hosts.

## Manual statistic adjustments (1.4.0)

The NPC preview provides compact **−/+ controls** directly alongside ability modifiers, AC, HP, Perception, Fortitude/Reflex/Will, Speed, individual skills (including Lore), and the hit bonus of every NPC Strike. One click changes only the selected value: one point per click, or **5 feet for Speed**. AC and HP cannot drop below 1; Speed cannot drop below 0. Each control has a localized accessible button label.

The +/- controls are rendered directly in the preview template and immediately update the displayed values. They are **real edits to the neutral NPC model**, not temporary presentation overrides. The resulting Foundry NPC Actor therefore receives the customized values. Altering STR does **not** automatically modify a skill or Strike bonus: PF2e NPC creature-building statistics are independently benchmarked, unlike PC attribute-derived math. Weapon items, damage formulas, and the linkage between equipment and Strikes are not changed when adjusting an attack bonus.

Manual edits remain intact when unrelated sections are rerolled. During **Generate**, an **unlocked** section is regenerated (so its manual changes are replaced); lock **Statistics**, **Skills**, or **Equipment/Attacks** to keep those edited values across subsequent full generations. A closed lock does not stop you from deliberately changing an individual number using +/−. The controls use an in-place update to preserve scroll positions and keyboard focus.

For hosts using the embedded editor, `session.adjustStat(kind, key, delta)` is public. Set `capabilities: { adjustStats: false }` to hide and disable these controls. Changes invoke `onChange` with `reason: "adjustStat"`. `delta` counts clicks: for example `adjustStat("defense", "speed", 1)` adds 5 feet. Pure `api.engine.generate()` is unaffected.

## Section locks and rerolls (1.3.0)

Each generated NPC preview provides a **lock icon** and a **refresh icon** for individual sections. A closed lock preserves that section when **Generate** is clicked again. The refresh icon regenerates only that section without rerolling the rest of the NPC. A locked section cannot be refreshed until it is unlocked.

Locks are available for identity (including the name), appearance, personality, biography, relationships, social context, statistics, skills, abilities, spellcasting, and equipment. Equipment and attacks have **independent lock controls**. When attacks are locked, their referenced weapons remain consistent; when equipment is locked, attacks may be regenerated while remaining associated with the preserved weapons. Attributes and defenses are independently lockable too. A wizard's spellbook remains synchronized with the spellcasting section when either spells or equipment change. Some PF2e rule-driven sections, such as skill modifiers and combat statistics, are deterministic for a fixed build and therefore may not visibly change from an isolated reroll.

Locks are **editor-session state**: they persist across renders and repeated generations in the current editor, but do not change the saved NPC schema or a Foundry Actor. If the GM changes the ancestry or a rules-dependent build choice in a way that conflicts with a locked section, the editor asks them to unlock the relevant section rather than create an internally inconsistent NPC. Embedded editors provide the same UI and a public lock API.

## Architecture

```text
Generation Request
      ↓
Neutral NPC Engine
      ↓
Neutral NPC Model (schema 13)
      ↓
PF2e Document Adapter
      ↓
Foundry NPC Actor + embedded Items
```

The generation engine remains independent from Foundry documents and optional Forge modules. Both the standalone application and external hosts mount the same shared `NpcEditorCore` through a public `NpcEditorSession`.

See `docs/ARCHITECTURE.md`, `docs/NPC_MODEL.md`, and `docs/EMBEDDED_EDITOR.md`.



## 1.2.0 Custom name cultures & homebrew name parts

The standalone NPC Forge window now offers a **Custom Names** tab, available to GMs. Cultures can be assigned to one or more ancestries and can be explicitly selected or optionally enabled for automatic culture resolution. Create multiple name packs per culture, including gender-specific and neutral given-name lists, prefixes and suffixes for composed given names, family names and epithets. Name packs may also be universal (not attached to a culture).

Custom content is saved as a **world setting** and is immediately available in the normal NPC Forge Culture/Name Pack selectors and through the usual content registry. Export/import a JSON library to back up or transfer homebrew names between worlds. External provider packs remain untouched. Existing actor data and the neutral NPC schema remain unchanged at 13.

Plain custom names and components are language-neutral literal text; unlike addon-provided semantic translation keys, they are not automatically translated between German and English. Only GMs can change the world library.

## 1.1.3 PF2e passive ability materialization fix

1.1.3 fixes PF2e Actor materialization for generated passive NPC abilities. PF2e stores `passive` in an ability's action type; the separate action-category field is nullable and does not accept `passive`. NPC Forge now writes passive ability Items with `actionType.value = "passive"` and `category = null`, preventing Foundry/PF2e validation errors during Actor creation. The neutral NPC schema remains **13** and no migration is required.

## 1.1.2 name pool deduplication fix

1.1.2 removes duplicate weighting when the same given name appears in more than one eligible pool. A name listed both as gender-specific and neutral/any is now represented only once in the final selection pool. Fallback aggregation across gender-specific pools is deduplicated as well. Provider data remains unchanged and no schema migration is required.

## 1.1.1 cultural resolution fix

1.1.1 separates **selectable** name cultures from cultures that should participate in automatic ancestry-based resolution. This prevents installing a regional name add-on from silently making every elf, dwarf, or orc belong to the first registered regional culture.

- Name cultures may define `automaticAncestryIds` as a subset of their broader `ancestryIds`.
- `automaticAncestryIds: []` keeps a culture visible and explicitly selectable while excluding it from automatic resolution.
- Omitting `automaticAncestryIds` preserves the 1.1.0 behavior for existing providers.
- When no culture is automatically resolved, universal ancestry packs are chosen before regional packs.
- Hosts can query `listNameCultures({ automaticOnly: true })` when they need only automatic candidates.
- The neutral NPC schema remains **13**; no migration is required.

## 1.1.0 cultural name provider support

1.1.0 adds a setting-neutral cultural layer to NPC Forge's name system so dedicated content add-ons such as **Names of the Inner Sea** can provide regional and cultural naming traditions without patching the NPC Forge core.

- Add-ons can register `nameCultures` and associate one or more `cultureIds` with a name pack.
- The Identity editor displays **Name culture** only when a compatible provider has registered cultures for the selected ancestry/locale.
- Automatic culture selection remains deterministic and weighted; hosts such as Crowd Forge or City Forge can explicitly request a culture.
- Culture-specific generation falls back to universal ancestry packs before considering any other same-ancestry pack, and never crosses into another ancestry just to find a name.
- Name packs may optionally use semantic component generators for very large combinatorial pools while retaining localization of individual components.
- Existing 1.0.0 name packs remain valid and act as universal ancestry fallbacks.

The neutral NPC schema is now **13**, adding resolved `identity.nameCulture` metadata and culture provenance in `identity.nameParts`.

## 1.0.0 final release

1.0.0 promotes the validated release-candidate feature set to the first stable release. No gameplay-generation subsystem or neutral-model migration was added after 0.9.1; the final release keeps the RC architecture, API contracts, deterministic generation coverage, and integration hardening intact.

The neutral NPC schema remains **12**. Consumers should continue to prefer capability checks over version checks.

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

Public API version: **1.4.2**  
Neutral model schema: **13**

See `docs/API.md` and `docs/EMBEDDED_EDITOR.md`.

## Development and checks

```bash
npm test
npm run check:release
npm run check
```

`npm run check` runs the complete test suite followed by release-contract validation.
