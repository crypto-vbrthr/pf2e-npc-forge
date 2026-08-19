# Public API

Obtain the API from `game.modules.get("pf2e-npc-forge")?.api` after the module is ready.

## Versions

- API version: `0.2.0`
- Neutral NPC schema: `2`

## Generation

```js
const npc = api.engine.generate({
  seed: "example-guard",
  level: 5,
  ancestry: "core.human",
  classProfile: "core.fighter",
  profession: "core.guard",
  role: "core.veteran"
});
```

The returned object is plain serializable data. In 0.2.0 it includes benchmark-driven attributes, Perception, AC, HP, saves, speed, relevant skills, and profession Lore.

## Actor creation

```js
const actor = await api.documents.createActor(npc, { folder: folderId });
```

## Capabilities

Check `api.capabilities` rather than assuming a feature from the module version. New 0.2.0 capabilities include `gm-core-statistics`, `skill-generation`, and `profession-lore`.
