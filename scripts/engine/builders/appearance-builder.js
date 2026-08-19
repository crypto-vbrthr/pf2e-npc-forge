const CATEGORY_KEYS = Object.freeze({
  build: "NPCFORGE.Appearance.Category.Build",
  facial: "NPCFORGE.Appearance.Category.Facial",
  age: "NPCFORGE.Appearance.Category.Age",
  scar: "NPCFORGE.Appearance.Category.Scars",
  hands: "NPCFORGE.Appearance.Category.Hands",
  posture: "NPCFORGE.Appearance.Category.Posture",
  complexion: "NPCFORGE.Appearance.Category.Complexion"
});

function enabledCategories(request = {}) {
  const categories = ["facial", "complexion", "hands"];
  if (request.allowBodyShape !== false) categories.unshift("build");
  if (request.allowAgeFeatures !== false) categories.push("age");
  if (request.allowScars !== false) categories.push("scar");
  if (request.allowPosture !== false) categories.push("posture");
  return new Set(categories);
}

function intensityCount(request = {}) {
  if (Number.isInteger(request.maxTraits)) return request.maxTraits;
  return ({ low: 2, medium: 3, high: 4 })[request.intensity] ?? 3;
}

function tagsOf(...definitions) {
  return new Set(definitions.flatMap((definition) => definition?.tags ?? []));
}

function eligibleTrait(trait, context) {
  if (!context.categories.has(trait.category)) return false;
  if (trait.ageCategories?.length && !trait.ageCategories.includes(context.age?.category)) return false;
  if (trait.ancestryIds?.length && !trait.ancestryIds.includes(context.ancestry?.id)) return false;
  if (trait.excludeAncestryIds?.includes(context.ancestry?.id)) return false;
  if (trait.requiresTags?.length && !trait.requiresTags.some((tag) => context.tags.has(tag))) return false;
  if (trait.excludesTags?.some((tag) => context.tags.has(tag))) return false;
  return true;
}

function traitWeight(trait, context) {
  let weight = Number(trait.weight ?? 1);
  for (const tag of trait.preferredTags ?? []) if (context.tags.has(tag)) weight *= 2.2;
  if (trait.ageCategories?.includes(context.age?.category)) weight *= 1.5;
  if (trait.ancestryIds?.includes(context.ancestry?.id)) weight *= 1.5;
  return weight;
}

function selectTrait(resolver, candidates, context, usedIds, usedCategories, { preferUnusedCategory = true } = {}) {
  let pool = candidates.filter((trait) => !usedIds.has(trait.id) && eligibleTrait(trait, context));
  if (preferUnusedCategory) {
    const fresh = pool.filter((trait) => !usedCategories.has(trait.category));
    if (fresh.length) pool = fresh;
  }
  return resolver.resolve(pool, { weight: (trait) => traitWeight(trait, context) });
}

export function buildAppearance({ request, ancestry, profession, professionSpecialization, classProfile, age, random, resolver, registry }) {
  if (request?.enabled === false) return null;

  const packs = registry.list("appearancePacks").filter((pack) => {
    if (pack.ancestryIds?.length && !pack.ancestryIds.includes(ancestry?.id)) return false;
    return pack.enabled !== false;
  });
  const candidates = packs.flatMap((pack) => (pack.traits ?? []).map((trait) => ({
    ...trait,
    sourceModule: pack.sourceModule,
    sourcePackId: pack.id
  })));

  const context = {
    categories: enabledCategories(request),
    ancestry,
    age,
    tags: tagsOf(ancestry, profession, professionSpecialization, classProfile)
  };
  const targetCount = Math.max(1, Math.min(6, intensityCount(request)));
  const selected = [];
  const usedIds = new Set();
  const usedCategories = new Set();

  // A body-build trait is a useful visual anchor whenever body-shape generation is enabled.
  if (request.allowBodyShape !== false) {
    const buildCandidates = candidates.filter((trait) => trait.category === "build");
    const build = selectTrait(resolver, buildCandidates, context, usedIds, usedCategories, { preferUnusedCategory: false });
    if (build) {
      selected.push(build);
      usedIds.add(build.id);
      usedCategories.add(build.category);
    }
  }

  while (selected.length < targetCount) {
    const trait = selectTrait(resolver, candidates, context, usedIds, usedCategories);
    if (!trait) break;
    selected.push(trait);
    usedIds.add(trait.id);
    usedCategories.add(trait.category);
  }

  return {
    generated: true,
    intensity: request.intensity ?? "medium",
    traits: selected.map((trait) => ({
      id: trait.id,
      category: trait.category,
      categoryKey: CATEGORY_KEYS[trait.category] ?? null,
      labelKey: trait.labelKey ?? null,
      label: trait.label ?? trait.id,
      source: { moduleId: trait.sourceModule ?? null, packId: trait.sourcePackId ?? null }
    }))
  };
}
