# Public API

```js
const api = game.modules.get("pf2e-npc-forge")?.api;
```

## Capability checks

```js
api.capabilities.has("embedded-editor");
api.capabilities.has("profession-registration");
```

## Generate a neutral NPC

```js
const npc = await api.engine.generate({
  seed: "stable-example",
  level: 4,
  ancestry: "core.dwarf",
  classProfile: "core.fighter",
  profession: "core.blacksmith"
});
```

## Create a PF2e Actor

```js
await api.documents.createActor(npc, { folder: folderId });
```

## Register profession content

```js
api.content.registerProfessionCategory("my-module", {
  id: "my-module.sailors",
  labelKey: "MYMODULE.Category.Sailors",
  weight: 10
});

api.content.registerProfession("my-module", {
  id: "my-module.shipwright",
  parentId: "my-module.sailors",
  labelKey: "MYMODULE.Profession.Shipwright",
  tags: ["maritime", "craft"],
  weight: 10
});
```

## Register a class profile

```js
api.content.registerClassProfile("my-module", {
  id: "my-module.duelist",
  labelKey: "MYMODULE.ClassProfile.Duelist",
  tags: ["martial", "finesse"],
  preferredSkills: ["acrobatics"],
  weight: 5
});
```

Duplicate IDs are rejected. External content should always use a module namespace.
