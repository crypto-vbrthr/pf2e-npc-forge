export function resolveGender(identity, random) {
  const value = identity?.gender ?? "random";
  if (value && value !== "random") return value;
  return random.pick(["female", "male", "nonbinary"]);
}

function ageRangeFor(ancestry, category) {
  const ranges = ancestry?.ageRanges ?? {};
  return ranges[category] ?? ranges.adult ?? { min: 18, max: 60 };
}

function resolveAge(identity, ancestry, random) {
  let category = identity?.ageCategory ?? "random";
  const supported = Object.keys(ancestry?.ageRanges ?? {});
  if (category === "random") {
    const pool = supported.length ? supported : ["youngAdult", "adult", "middleAged", "elder"];
    const weighted = pool.flatMap((value, index) => Array(Math.max(1, [2, 6, 3, 1][index] ?? 1)).fill(value));
    category = random.pick(weighted) ?? pool[0];
  }
  if (Number.isFinite(identity?.ageYears)) return { category, years: Math.max(0, Math.trunc(identity.ageYears)) };
  const range = ageRangeFor(ancestry, category);
  return { category, years: random.int(Number(range.min ?? 18), Number(range.max ?? range.min ?? 60)) };
}

export function buildIdentity({ normalizedIdentity, ancestry, random, name, nameParts = null, resolvedGender = null }) {
  return {
    name,
    nameParts,
    ancestry,
    gender: resolvedGender ?? resolveGender(normalizedIdentity, random),
    age: resolveAge(normalizedIdentity, ancestry, random),
    size: ancestry?.size ?? "med",
    traits: [...(ancestry?.traits ?? [])],
    languages: [...(ancestry?.languages ?? ["common"])],
    senses: [...(ancestry?.senses ?? [])],
    appearance: null
  };
}
