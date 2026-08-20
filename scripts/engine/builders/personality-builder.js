const CATEGORY_KEYS = Object.freeze({
  demeanor: "NPCFORGE.Personality.Category.Demeanor",
  trait: "NPCFORGE.Personality.Category.Trait",
  motivation: "NPCFORGE.Personality.Category.Motivation",
  flaw: "NPCFORGE.Personality.Category.Flaw",
  quirk: "NPCFORGE.Personality.Category.Quirk",
  secret: "NPCFORGE.Personality.Category.Secret"
});

function tagsOf(...definitions) {
  return new Set(definitions.flatMap((definition) => definition?.tags ?? []));
}

function allTraits(registry) {
  return registry.list("personalityPacks").flatMap((pack) =>
    (pack.traits ?? []).map((trait) => ({
      ...trait,
      sourceModule: trait.sourceModule ?? pack.sourceModule,
      sourcePackId: pack.id,
      packWeight: pack.weight ?? 1
    }))
  );
}

function eligible(trait, context) {
  if (!context.categories.has(trait.category)) return false;
  if (trait.ancestryIds?.length && !trait.ancestryIds.includes(context.ancestry?.id)) return false;
  if (trait.professionIds?.length && !trait.professionIds.includes(context.profession?.id)) return false;
  if (trait.classProfileIds?.length && !trait.classProfileIds.includes(context.classProfile?.id)) return false;
  if (trait.ageCategories?.length && !trait.ageCategories.includes(context.age?.category)) return false;
  if (trait.requiresTags?.length && !trait.requiresTags.every((tag) => context.tags.has(tag))) return false;
  if (trait.excludesTags?.some((tag) => context.tags.has(tag))) return false;
  return true;
}

function weightedCandidate(trait, context) {
  let weight = Number(trait.weight ?? 1) * Number(trait.packWeight ?? 1);
  for (const tag of trait.preferredTags ?? []) if (context.tags.has(tag)) weight *= 1.7;
  for (const tag of trait.avoidsTags ?? []) if (context.tags.has(tag)) weight *= 0.45;
  return { ...trait, weight };
}

function pickOne(resolver, candidates, category, used = new Set()) {
  const pool = candidates.filter((trait) => trait.category === category && !used.has(trait.id));
  if (!pool.length) return null;
  const picked = resolver.resolve(pool);
  if (picked) used.add(picked.id);
  return picked;
}

function normalizeTrait(trait) {
  if (!trait) return null;
  return {
    id: trait.id,
    category: trait.category,
    categoryKey: CATEGORY_KEYS[trait.category] ?? null,
    labelKey: trait.labelKey ?? null,
    label: trait.label ?? trait.id,
    descriptionKey: trait.descriptionKey ?? null,
    description: trait.description ?? null,
    tags: [...(trait.tags ?? [])],
    source: { moduleId: trait.sourceModule ?? null, packId: trait.sourcePackId ?? null }
  };
}

export function buildPersonality({ request = {}, ancestry, profession, professionSpecialization, classProfile, role, age, resolver, registry } = {}) {
  if (request.enabled === false) return null;

  const categories = new Set(["demeanor", "trait", "motivation", "flaw", "quirk"]);
  if (request.allowSecrets !== false) categories.add("secret");
  const context = {
    ancestry,
    profession,
    classProfile,
    age,
    categories,
    tags: tagsOf(ancestry, profession, professionSpecialization, classProfile, role)
  };

  const candidates = allTraits(registry)
    .filter((trait) => eligible(trait, context))
    .map((trait) => weightedCandidate(trait, context));
  const used = new Set();
  const demeanor = normalizeTrait(pickOne(resolver, candidates, "demeanor", used));
  const motivation = normalizeTrait(pickOne(resolver, candidates, "motivation", used));
  const flaw = normalizeTrait(pickOne(resolver, candidates, "flaw", used));
  const quirk = normalizeTrait(pickOne(resolver, candidates, "quirk", used));
  const secret = categories.has("secret") ? normalizeTrait(pickOne(resolver, candidates, "secret", used)) : null;

  const traitCount = ({ low: 1, medium: 2, high: 3 })[request.intensity] ?? 2;
  const traits = [];
  for (let i = 0; i < traitCount; i++) {
    const trait = normalizeTrait(pickOne(resolver, candidates, "trait", used));
    if (!trait) break;
    traits.push(trait);
  }

  return {
    generated: true,
    intensity: request.intensity ?? "medium",
    demeanor,
    traits,
    motivation,
    flaw,
    quirk,
    secret,
    roleplaying: {
      firstImpressionKey: demeanor?.descriptionKey ?? demeanor?.labelKey ?? null,
      conversationKey: quirk?.descriptionKey ?? quirk?.labelKey ?? null,
      underPressureKey: flaw?.descriptionKey ?? flaw?.labelKey ?? null,
      drivingGoalKey: motivation?.descriptionKey ?? motivation?.labelKey ?? null
    }
  };
}
