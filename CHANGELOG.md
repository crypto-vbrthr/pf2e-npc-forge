# Changelog

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
