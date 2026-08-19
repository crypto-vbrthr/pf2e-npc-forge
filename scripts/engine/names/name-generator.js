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

function supportedForLocale(pack, locale) {
  const supported = pack?.supportedLocales;
  return !Array.isArray(supported) || supported.length === 0 || supported.includes(locale);
}

export function availableNamePacks(registry, { ancestryId = null, locale = "en", allowUntranslated = false } = {}) {
  return registry.list("namePacks").filter((pack) => {
    const ancestryMatches = !pack.ancestryIds?.length || pack.ancestryIds.includes(ancestryId);
    return ancestryMatches && (allowUntranslated || supportedForLocale(pack, locale));
  });
}

export function generateNameData({ registry, resolver, ancestry, random, gender = "nonbinary", request = {} }) {
  const locale = request?.nameLocale ?? "en";
  const allowUntranslated = request?.allowUntranslatedNamePacks === true;
  let pack = null;
  if (request?.namePack?.mode === "fixed" && request.namePack.id) {
    pack = registry.get("namePacks", request.namePack.id);
  } else {
    pack = resolver.resolve(availableNamePacks(registry, { ancestryId: ancestry?.id, locale, allowUntranslated }));
  }
  if (!pack) return { name: "Unnamed NPC", nameParts: null, pack: null };

  const given = random.pick(givenPool(pack, gender)) ?? { literal: "Unnamed" };
  const familyEntries = Array.isArray(pack.family) ? pack.family.map(normalizeEntry).filter(Boolean) : [];
  const family = familyEntries.length ? random.pick(familyEntries) : null;
  const epithetEntries = Array.isArray(pack.epithets) ? pack.epithets.map(normalizeEntry).filter(Boolean) : [];
  const epithet = epithetEntries.length && random.chance(Number(pack.epithetChance ?? 0)) ? random.pick(epithetEntries) : null;
  const nameParts = {
    packId: pack.id,
    given,
    family,
    epithet,
    epithetPatternKey: pack.epithetPatternKey ?? "NPCFORGE.Names.Pattern.Epithet"
  };
  return { name: renderGeneratedName(nameParts, (key) => key), nameParts, pack };
}
