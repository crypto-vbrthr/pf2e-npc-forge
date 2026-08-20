const BACKGROUND_CATEGORY_KEYS = Object.freeze({
  origin: "NPCFORGE.Background.Category.Origin",
  formative: "NPCFORGE.Background.Category.Formative",
  currentSituation: "NPCFORGE.Background.Category.CurrentSituation",
  currentProblem: "NPCFORGE.Background.Category.CurrentProblem",
  privateHook: "NPCFORGE.Background.Category.PrivateHook",
  standing: "NPCFORGE.Background.Category.Standing",
  communityRole: "NPCFORGE.Background.Category.CommunityRole",
  reputation: "NPCFORGE.Background.Category.Reputation"
});

function contextTags(...definitions) {
  return new Set(definitions.flatMap((definition) => definition?.tags ?? []));
}

function flattenEntries(registry, type, field) {
  return registry.list(type).flatMap((pack) => (pack[field] ?? []).map((entry) => ({
    ...entry,
    sourceModule: entry.sourceModule ?? pack.sourceModule,
    sourcePackId: pack.id,
    packWeight: Number(pack.weight ?? 1)
  })));
}

function eligible(entry, context) {
  if (entry.ancestryIds?.length && !entry.ancestryIds.includes(context.ancestry?.id)) return false;
  if (entry.professionIds?.length && !entry.professionIds.includes(context.profession?.id)) return false;
  if (entry.professionCategoryIds?.length && !entry.professionCategoryIds.includes(context.professionCategory?.id)) return false;
  if (entry.classProfileIds?.length && !entry.classProfileIds.includes(context.classProfile?.id)) return false;
  if (entry.roleIds?.length && !entry.roleIds.includes(context.role?.id)) return false;
  if (entry.ageCategories?.length && !entry.ageCategories.includes(context.age?.category)) return false;
  if (entry.requiresTags?.length && !entry.requiresTags.every((tag) => context.tags.has(tag))) return false;
  if (entry.excludesTags?.some((tag) => context.tags.has(tag))) return false;
  return true;
}

function weighted(entry, context) {
  let weight = Number(entry.weight ?? 1) * Number(entry.packWeight ?? 1);
  for (const tag of entry.preferredTags ?? []) if (context.tags.has(tag)) weight *= 1.75;
  for (const tag of entry.avoidsTags ?? []) if (context.tags.has(tag)) weight *= 0.45;
  return { ...entry, weight };
}

function normalizeEntry(entry) {
  if (!entry) return null;
  return {
    id: entry.id,
    category: entry.category,
    categoryKey: BACKGROUND_CATEGORY_KEYS[entry.category] ?? null,
    labelKey: entry.labelKey ?? null,
    label: entry.label ?? entry.id,
    descriptionKey: entry.descriptionKey ?? null,
    description: entry.description ?? null,
    visibility: entry.visibility === "private" ? "private" : "public",
    tags: [...(entry.tags ?? [])],
    source: { moduleId: entry.sourceModule ?? null, packId: entry.sourcePackId ?? null }
  };
}

function pickCategory(resolver, entries, category, context, used = new Set()) {
  const candidates = entries
    .filter((entry) => entry.category === category && !used.has(entry.id) && eligible(entry, context))
    .map((entry) => weighted(entry, context));
  if (!candidates.length) return null;
  const picked = resolver.resolve(candidates);
  if (picked) used.add(picked.id);
  return normalizeEntry(picked);
}

function normalizeRelationship(entry, index) {
  if (!entry) return null;
  return {
    id: `relationship-${index + 1}`,
    typeId: entry.id,
    category: entry.category ?? "contact",
    labelKey: entry.labelKey ?? null,
    label: entry.label ?? entry.id,
    descriptionKey: entry.descriptionKey ?? null,
    description: entry.description ?? null,
    reciprocalTypeId: entry.reciprocalTypeId ?? entry.id,
    attitude: entry.attitude ?? "neutral",
    importance: entry.importance ?? "normal",
    visibility: entry.visibility === "private" ? "private" : "public",
    target: {
      kind: "unresolved-npc",
      actorUuid: null,
      npcId: null,
      name: null,
      constraints: {
        preferredTags: [...(entry.targetPreferredTags ?? [])],
        avoidedTags: [...(entry.targetAvoidedTags ?? [])],
        professionCategoryIds: [...(entry.targetProfessionCategoryIds ?? [])],
        roleIds: [...(entry.targetRoleIds ?? [])]
      }
    },
    source: { moduleId: entry.sourceModule ?? null, packId: entry.sourcePackId ?? null }
  };
}

function relationshipCount(request) {
  if (Number.isInteger(request.relationshipCount)) return Math.max(0, Math.min(6, request.relationshipCount));
  return ({ low: 1, medium: 2, high: 3 })[request.intensity] ?? 2;
}

function pickRelationships({ resolver, registry, context, request }) {
  if (request.generateRelationships === false) return [];
  const entries = flattenEntries(registry, "relationshipPacks", "relationships")
    .filter((entry) => eligible(entry, context))
    .map((entry) => weighted(entry, context));
  const count = relationshipCount(request);
  const picked = [];
  const used = new Set();
  for (let i = 0; i < count; i++) {
    const pool = entries.filter((entry) => !used.has(entry.id));
    if (!pool.length) break;
    const entry = resolver.resolve(pool);
    if (!entry) break;
    used.add(entry.id);
    picked.push(normalizeRelationship(entry, picked.length));
  }
  return picked.filter(Boolean);
}

export function buildBackground({
  request = {}, ancestry, profession, professionSpecialization, professionCategory,
  classProfile, role, age, personality, resolver, registry
} = {}) {
  if (request.enabled === false) return { biography: null, relationships: [], socialContext: null };

  const context = {
    ancestry,
    profession,
    professionCategory,
    classProfile,
    role,
    age,
    tags: contextTags(ancestry, profession, professionSpecialization, professionCategory, classProfile, role)
  };
  // Personality can gently steer background without turning narrative generation into a hard dependency.
  for (const tag of personality?.motivation?.tags ?? []) context.tags.add(tag);
  for (const tag of personality?.flaw?.tags ?? []) context.tags.add(tag);

  const entries = flattenEntries(registry, "backgroundPacks", "entries");
  const used = new Set();
  const origin = pickCategory(resolver, entries, "origin", context, used);
  const formative = pickCategory(resolver, entries, "formative", context, used);
  const currentSituation = pickCategory(resolver, entries, "currentSituation", context, used);
  const currentProblem = pickCategory(resolver, entries, "currentProblem", context, used);
  const privateHook = request.allowPrivateHooks === false ? null : pickCategory(resolver, entries, "privateHook", context, used);
  const standing = pickCategory(resolver, entries, "standing", context, used);
  const communityRole = pickCategory(resolver, entries, "communityRole", context, used);
  const reputation = pickCategory(resolver, entries, "reputation", context, used);

  return {
    biography: {
      generated: true,
      intensity: request.intensity ?? "medium",
      origin,
      formative,
      currentSituation,
      currentProblem,
      privateHook
    },
    socialContext: request.generateSocialContext === false ? null : {
      generated: true,
      standing,
      communityRole,
      reputation
    },
    relationships: pickRelationships({ resolver, registry, context, request })
  };
}
