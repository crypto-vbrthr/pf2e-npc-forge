# Content Providers

External modules can register profiles through the public content API.

## Class profile statistic hints

A class profile can now provide tier-based hints:

```js
{
  id: "my-module.martial",
  attributeTiers: { str: "high", dex: "average", con: "high" },
  statistics: {
    perception: "average",
    ac: "high",
    hp: "average",
    attack: "high",
    saves: { fortitude: "high", reflex: "average", will: "low" }
  },
  skillBias: { athletics: "high" }
}
```

Supported tiers are `low`, `average`, `high`, and `extreme`; perception and saves additionally support `terrible`. Extreme ability modifiers at levels where GM Core has no extreme entry automatically fall back to high.

## Profession hints

Professions may provide `attributeBias`, `skillBias`, and `lore`. Profession bias can strengthen a class-profile preference but does not reduce it.
