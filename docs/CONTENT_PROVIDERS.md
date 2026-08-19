# Content Providers

NPC Forge content is registry-driven. External modules can add class profiles, profession categories, professions, profession specializations, roles, name packs, personality packs, appearance packs, equipment profiles, and quick presets.

## Profession hierarchy

Version 0.1.0 supports `parentId` on profession definitions. A generation request can select a category and let the weighted resolver choose a child profession.

```js
const npc = api.engine.generate({
  profession: { mode: "category", id: "core.profession-category.criminal" }
});
```

Weights are relative and do not need to sum to 100.
