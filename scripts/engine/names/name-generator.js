import { renderGeneratedName } from "./name-renderer.js";

function normalizeEntry(entry) {
  if (typeof entry === "string") return { literal: entry };
  if (!entry || typeof entry !== "object") return null;
  return { ...entry };
}

function givenPool(pack, gender) {
  if (Array.isArray(pack?.given)) return pack.given.map(normalizeEntry).filter(Boolean);
  const given = pack?.given ?? {};
  const preferred = Array.isArray(given[gender]) ? given[gender] : [];
  const neutral = Array.isArray(given.neutral) ? given.neutral : [];
  const any = Array.isArray(given.any) ? given.any : [];
  const combined = [...preferred, ...neutral, ...any].map(normalizeEntry).filter(Boolean);
  if (combined.length) return combined;
  return Object.values(given).flatMap((entries) => Array.isArray(entries) ? entries : []).map(normalizeEntry).filter(Boolean);
}

function supportedForLocale(definition, locale) {
  const supported = definition?.supportedLocales;
  return !Array.isArray(supported) || supported.length === 0 || supported.includes(locale);
}

function ancestryMatches(definition, ancestryId) {
  return !definition?.ancestryIds?.length || definition.ancestryIds.includes(ancestryId);
}

export function availableNameCultures(registry, { ancestryId = null, locale = "en", allowUntranslated = false } = {}) {
  return registry.list("nameCultures").filter((culture) => ancestryMatches(culture, ancestryId)
    && (allowUntranslated || supportedForLocale(culture, locale)));
}

export function availableNamePacks(registry, {
  ancestryId = null,
  cultureId = null,
  locale = "en",
  allowUntranslated = false,
  includeUniversal = true
} = {}) {
  return registry.list("namePacks").filter((pack) => {
    if (!ancestryMatches(pack, ancestryId)) return false;
    if (!(allowUntranslated || supportedForLocale(pack, locale))) return false;
    if (!cultureId) return true;
    const cultures = Array.isArray(pack.cultureIds) ? pack.cultureIds : [];
    return cultures.includes(cultureId) || (includeUniversal && cultures.length === 0);
  });
}

function resolveCulture({ registry, resolver, ancestryId, locale, allowUntranslated, request }) {
  const requested = request?.nameCulture;
  if (requested?.mode === "fixed" && requested.id) return registry.get("nameCultures", requested.id);

  // An explicitly selected pack is authoritative. If it belongs to a culture,
  // expose that culture; a universal pack must not acquire a random culture
  // merely because a cultural add-on is installed.
  if (request?.namePack?.mode === "fixed" && request.namePack.id) {
    const pack = registry.get("namePacks", request.namePack.id);
    const cultureIds = Array.isArray(pack?.cultureIds) ? pack.cultureIds : [];
    const cultures = cultureIds.map((id) => registry.get("nameCultures", id)).filter(Boolean);
    return cultures.length ? resolver.resolve(cultures) : null;
  }

  const cultures = availableNameCultures(registry, { ancestryId, locale, allowUntranslated });
  return cultures.length ? resolver.resolve(cultures) : null;
}

function generatorFor(pack, part) {
  if (pack?.generators?.[part]?.type === "components") return pack.generators[part];
  if (part === "given" && pack?.generator?.type === "components") return pack.generator;
  return null;
}

function componentPool(generator, key) {
  const values = generator?.components?.[key];
  return Array.isArray(values) ? values.map(normalizeEntry).filter(Boolean) : [];
}

function generateComposite(generator, random) {
  if (!generator || generator.type !== "components") return null;
  const patterns = Array.isArray(generator.patterns) ? generator.patterns.filter(Array.isArray) : [];
  const pattern = random.pick(patterns);
  if (!pattern?.length) return null;
  const parts = [];
  for (const key of pattern) {
    const pool = componentPool(generator, key);
    if (!pool.length) return null;
    parts.push(random.pick(pool));
  }
  return {
    composite: true,
    separator: typeof generator.separator === "string" ? generator.separator : "",
    parts
  };
}

function selectPack({ registry, resolver, ancestryId, culture, locale, allowUntranslated, request }) {
  if (request?.namePack?.mode === "fixed" && request.namePack.id) return { pack: registry.get("namePacks", request.namePack.id), fallback: null };

  if (culture?.id) {
    const culturallyMatched = availableNamePacks(registry, {
      ancestryId,
      cultureId: culture.id,
      locale,
      allowUntranslated,
      includeUniversal: false
    });
    if (culturallyMatched.length) return { pack: resolver.resolve(culturallyMatched), fallback: null };

    const universal = availableNamePacks(registry, { ancestryId, locale, allowUntranslated })
      .filter((pack) => !Array.isArray(pack.cultureIds) || pack.cultureIds.length === 0);
    if (universal.length) return { pack: resolver.resolve(universal), fallback: "universal-ancestry-pack" };

    const sameAncestry = availableNamePacks(registry, { ancestryId, locale, allowUntranslated });
    if (sameAncestry.length) return { pack: resolver.resolve(sameAncestry), fallback: "other-culture-same-ancestry" };
    return { pack: null, fallback: "no-compatible-name-pack" };
  }

  const candidates = availableNamePacks(registry, { ancestryId, locale, allowUntranslated });
  return { pack: candidates.length ? resolver.resolve(candidates) : null, fallback: candidates.length ? null : "no-compatible-name-pack" };
}

export function generateNameData({ registry, resolver, ancestry, random, gender = "nonbinary", request = {} }) {
  const locale = request?.nameLocale ?? "en";
  const allowUntranslated = request?.allowUntranslatedNamePacks === true;
  const culture = resolveCulture({ registry, resolver, ancestryId: ancestry?.id, locale, allowUntranslated, request });
  const { pack, fallback } = selectPack({ registry, resolver, ancestryId: ancestry?.id, culture, locale, allowUntranslated, request });
  if (!pack) return { name: "Unnamed NPC", nameParts: null, pack: null, culture, fallback };

  const generatedGiven = generateComposite(generatorFor(pack, "given"), random);
  const given = generatedGiven ?? random.pick(givenPool(pack, gender)) ?? { literal: "Unnamed" };

  const generatedFamily = generateComposite(generatorFor(pack, "family"), random);
  const familyEntries = Array.isArray(pack.family) ? pack.family.map(normalizeEntry).filter(Boolean) : [];
  const family = generatedFamily ?? (familyEntries.length ? random.pick(familyEntries) : null);

  const generatedEpithet = generateComposite(generatorFor(pack, "epithet"), random);
  const epithetEntries = Array.isArray(pack.epithets) ? pack.epithets.map(normalizeEntry).filter(Boolean) : [];
  const epithetChance = Number(pack.epithetChance ?? 0);
  const epithet = (generatedEpithet || epithetEntries.length) && random.chance(epithetChance)
    ? (generatedEpithet ?? random.pick(epithetEntries))
    : null;

  const nameParts = {
    packId: pack.id,
    cultureId: culture?.id ?? null,
    fallback,
    given,
    family,
    epithet,
    epithetPatternKey: pack.epithetPatternKey ?? "NPCFORGE.Names.Pattern.Epithet"
  };
  return { name: renderGeneratedName(nameParts, (key) => key), nameParts, pack, culture, fallback };
}
