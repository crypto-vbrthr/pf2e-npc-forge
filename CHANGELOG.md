# Changelog

## 0.6.1 – Level-scaled Strike Damage & Combat Benchmarks

- Added the GM Core Strike Damage benchmark table for levels -1 through 24.
- Replaced the old `1dx + small level bonus` Strike scaling with level-appropriate benchmark damage.
- Preserves the source weapon damage die while targeting the benchmark average damage recommended by GM Core.
- Added explicit combat metadata to generated attacks: attack tier, damage tier, expected average, actual average, and printed benchmark formula.
- Agile Strikes automatically step down one damage category, matching GM Core guidance.
- Updated the Barbarian core profile to the GM Core-style tradeoff of average attack accuracy and extreme damage.
- Kept compendium weapon item data untouched; NPC Strike damage remains engine-owned so runes and item values are not double-counted.
- Added validation and regression tests for level 12 fighter damage, barbarian accuracy/damage tradeoffs, agile attacks, and full benchmark coverage.
- Advanced the public API to 0.6.1 and neutral NPC schema to version 8.

## 0.6.0 – Personality & Roleplaying

- Added structured, deterministic personality generation.
- Added demeanor, traits, motivation, weakness, quirk, and optional secret.
- Added a table-facing roleplaying kit for first impression, conversation, pressure behavior, and driving goal.
- Added context-aware personality weighting using existing ancestry, profession, class, role, and age metadata.
- Added external personality pack registration through the public content API.
- Added standalone editor controls and Creature-Forge-aligned personality preview.
- Added PF2e adapter persistence; secrets are stored in private GM notes.
- Added EN/DE localization and regression tests.


## 0.5.4 - Appearance & Physical Traits

- Added deterministic, optional physical appearance generation to the neutral NPC Engine.
- Added low/medium/high trait intensity and independent switches for body shape, scars, age features, and posture/movement.
- Added weighted core physical traits including build, facial features, complexion, aging signs, scars, hands, and posture.
- Appearance weighting can react to ancestry, age, profession/class tags, and content-pack requirements.
- Added an Appearance section to the standalone/embedded-ready preview and localized DE/EN physical-trait labels.
- Generated appearance is persisted as structured semantic trait IDs and written to PF2e Actor notes/flags by the Document Adapter.
- External modules can register appearance packs through `api.content.registerAppearancePack()`.
- Added appearance capabilities and regression coverage for determinism, opt-out/category switches, external packs, localization, and preview markup.

## 0.5.3 – Persistent Action Bars Layout Fix

- Moved **Generate** into a dedicated non-scrolling action bar beneath the controls pane so it remains visible while form sections scroll.
- Moved **Create Actor** into a dedicated non-scrolling action bar beneath the preview pane.
- Action bars now occupy their own layout row instead of using sticky overlays, so they no longer cover controls or preview content.
- Split both editor columns into an independently scrolling content area plus a persistent footer.
- Updated preview scroll preservation to track the new preview scroll container.
- Added regression coverage for persistent, non-overlay action bars.


## 0.5.1 - Localization Namespace Hotfix

- Fixed a localization namespace collision introduced in 0.5.0 by mixing flat dotted keys with a nested `NPCFORGE` object in the same language file.
- Normalized both English and German localization catalogs to one flat dotted-key format.
- Restored localization for the application title, form labels, statistics, skills, abilities, equipment, ancestry identity fields, senses, languages, and controls.
- Added regression coverage that rejects nested localization objects and verifies representative DE/EN keys.

# 0.5.0 – Ancestries & Identity

- Expanded core ancestry content to the 16 ancestries from Player Core and Player Core 2.
- Added ancestry size, Speed, traits, languages, senses, age ranges, and selected intrinsic natural attacks.
- Added generated gender and ancestry-aware age identity data.
- Added Identity controls and preview presentation.
- Added public `registerAncestry()` API and ancestry-related capabilities.
- Materializes ancestry traits, size, languages, and senses on generated PF2e NPC actor sources.
- Bumped neutral NPC schema to v4.

# Changelog

## 0.4.0 - Profession System & Inventory

- Expanded the built-in profession catalog to eleven broad categories and more than twenty concrete professions.
- Added hierarchical category-based profession generation so callers can request a general criminal, artisan, soldier-type NPC, and similar broad concepts without choosing a specific profession.
- Added profession specializations such as pickpocket, burglar, weaponsmith, armorsmith, infantry, and archer.
- Profession specializations can contribute skill and attribute biases.
- Added reusable `equipmentProfiles` and connected core professions to appropriate armor, shields, tools, and general gear.
- Extended the PF2e document adapter to resolve non-weapon inventory entries against the regular `pf2e.equipment-srd` compendium while preserving normal PF2e item data and value.
- Kept weapon-to-strike linkage and NPC-level combat scaling intact.
- Added level gates (`minLevel` / `maxLevel`) to equipment profile entries for future scalable inventory packages.
- Added profession category and profession specialization controls to the standalone editor.
- Added an inventory section to the Creature Forge-aligned preview.
- Added German and English localization for new profession categories, professions, specializations, Lore entries, and inventory labels.
- Added capabilities `profession-specializations`, `hierarchical-professions`, `equipment-profile-generation`, and `profession-equipment`.
- Advanced the neutral NPC schema to version 3 and the public API version to 0.4.0.
- Expanded regression coverage for profession breadth, category resolution, specialization behavior, external equipment profiles, profession inventory, and non-weapon compendium cloning.

## 0.3.5 - Preview Scroll Preservation Fix

- Preserved the NPC preview scroll position when changing the selected class profile.
- Applied the same preservation path to full preview regeneration so future partial/full preview refreshes do not unexpectedly jump to the top.
- Centralized preview scroll capture/restore in the standalone editor application instead of patching individual class options.
- Added regression coverage for the scroll-preservation hooks.

## 0.3.4 - Core Class Profile Expansion

- Expanded the built-in class-profile catalog to all sixteen remastered Player Core / Player Core 2 classes.
- Added Bard, Druid, Witch, Alchemist, Barbarian, Investigator, Swashbuckler, Monk, Oracle, Champion, and Sorcerer profiles.
- Added representative, weighted class specializations such as bard muses, druid orders, witch patrons, alchemist research fields, barbarian instincts, investigator methodologies, swashbuckler styles, monk stances, oracle mysteries, champion causes, and sorcerer bloodlines.
- Added NPC-facing signature abilities for every new class profile and specialization.
- Kept spellcasting-oriented abilities deliberately descriptive until the dedicated spellcasting engine is implemented.
- Added class-aware baseline weapon choices for monks, swashbucklers, barbarians, and champions while preserving compendium-backed equipment where applicable.
- Added complete German and English localization for all new class, specialization, ability, and weapon labels.
- Added capability `core-class-profile-expansion`.
- Added regression tests covering full core-class registration, representative specializations, deterministic automatic specialization, and representative class abilities.


## 0.3.3 - Compendium-backed Equipment & Strikes

- Weapons in generated NPC loadouts now carry semantic PF2e equipment-compendium references.
- The PF2e document adapter resolves those references against `pf2e.equipment-srd` when creating actors.
- Resolved weapons are cloned from the regular PF2e compendium, preserving system data such as price, group, base item, traits, descriptions, and other item metadata.
- Matching NPC strikes derive their visible name, traits, and damage type from the resolved compendium weapon while keeping NPC attack and damage scaling owned by the NPC Engine.
- Added `toActorSourceAsync()` for callers that need fully compendium-backed actor sources before document creation.
- `createActor()` and `createActors()` now use asynchronous compendium-backed source generation automatically.
- Missing or unavailable equipment compendia degrade gracefully to the generated fallback weapon source.
- Added public capabilities `compendium-backed-equipment` and `compendium-derived-strikes`.
- Added regression coverage for compendium cloning, preserved item value, strike derivation, and fallback behavior.

## 0.3.2 - Generated Item & Strike Localization

- Added semantic localization keys to baseline generated weapons and matching attacks.
- PF2e actor creation now localizes generated weapon and melee-action names using the active Foundry locale.
- Localized generated profession/class labels and Lore heading in actor notes.
- Preview damage formulas now use localized die notation (`1W6` in German, `1d6` in English).
- Presentation model now exposes localized inventory names for upcoming inventory preview work.

## 0.3.1 – Creature Forge Preview Alignment

- Restyled the NPC preview to visually align with the established Creature Forge preview language.
- Added a prominent identity header with the NPC level anchored to the upper-right.
- Replaced generic collapsible preview cards with strong Pathfinder-style section headings and bordered stat tiles.
- Reorganized defenses into a dedicated grid for AC, HP, Perception, Fortitude, Reflex, Will, and Speed.
- Reworked attributes, skills, abilities, and attacks into consistent visual panels that remain readable as later NPC data is added.
- Kept the editor controls and embedded/public contracts unchanged; this release is presentation-only.
- Added preview markup regression coverage.

## 0.2.0 – Core Statistics & Skills

- Replaced placeholder statistics with PF2e GM Core benchmark tables for levels -1 through 24.
- Added tier-driven ability modifiers, Perception, AC, HP, saves, and ancestry speed.
- Added class-profile statistic preferences and profession attribute biases.
- Added relevant standard-skill generation and profession Lore generation.
- Added role-level narrow statistic and skill adjustments.
- Updated the PF2e document adapter to emit ability modifiers and standard skill bases.
- Added Lore summaries to generated NPC notes.
- Added core-statistics, skill, benchmark-table, and adapter regression tests.
- Neutral NPC schema advanced to version 2; API advanced to 0.2.0.

## 0.1.0 – Architecture Baseline

- Initial engine/API/adapter/editor architecture.

## 0.5.2 – Names & Localization

- Replaced flat core name lists with ancestry-aware, gender-aware name packs.
- Added semantic generated-name parts so speaking surnames can render differently per locale without changing the generated identity or seed.
- Added localized family-name components such as `Ironhand` / `Eisenhand`, `Stonehelm` / `Steinhelm`, and equivalent human, halfling, and gnome components.
- Added a Name Pack selector to the standalone editor, filtered by ancestry and current Foundry locale.
- Preserved manually entered names verbatim and excluded them from localization transforms.
- Added public `registerNamePack()` capability metadata and `listNamePacks()` discovery with ancestry/locale filtering.
- Added backwards compatibility for simple third-party name packs that still provide flat `given` string arrays.
- Advanced neutral NPC schema to version 5 and public API version to 0.5.2.
- Added regression tests for semantic localization, gender-aware pools, external name packs, manual-name preservation, API discovery, and existing preview scroll behavior.
