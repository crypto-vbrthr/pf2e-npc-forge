# PF2E NPC Forge

**Version 0.5.0 – Profession System & Inventory**

NPC Forge is a Foundry VTT module for generating fully usable Pathfinder 2e NPCs through a reusable, API-first engine.

## 0.5.0 focus

This release expands NPC Forge from class-driven combat profiles into broader world-facing NPC generation. Professions are now organized into categories, can expose optional specializations, and contribute skills, Lore, attributes, and equipment profiles.

Built-in categories now cover civic, artisan, criminal, military, religious, scholarly, mercantile, rural, maritime, medical, and entertainment professions. A request can target a concrete profession or ask the engine to select a weighted profession from a category.

### Profession equipment

Professions can reference reusable equipment profiles. Equipment entries are semantic references to the regular PF2e equipment compendium and are resolved by the PF2e document adapter during actor creation. This allows generated NPCs to receive real armor, shields, tools, and adventuring gear with the normal PF2e item data and value.

The engine keeps weapons and their NPC strikes linked through `sourceWeaponId`. NPC attack/damage scaling remains engine-owned while item identity and item metadata come from the PF2e compendium.

Equipment profiles support `minLevel` and `maxLevel` gates and can be registered by external modules.

### External content

Add-ons can extend the system with:

- profession categories
- professions
- profession specializations
- equipment profiles
- class profiles and class specializations
- abilities and other registered NPC Forge content

See `docs/CONTENT_PROVIDERS.md` and `docs/API.md`.

## Testing

Run:

```sh
npm test
```

See `docs/TESTING.md`, `docs/API.md`, and `docs/ARCHITECTURE.md`.


## 0.5.0 Ancestries & Identity

Adds the 16 Player Core / Player Core 2 ancestry profiles, ancestry-driven size, Speed, languages, senses and signature natural attacks, plus generated gender and ancestry-aware age data. Ancestries remain public Content Registry entries and can be extended by add-on modules through `api.content.registerAncestry()`.
