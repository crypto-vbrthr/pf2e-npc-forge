import { spellcastingBenchmark } from "../rules/gm-core-tables.js";

const CORE_CLASS_PROFILES = {
  "core.wizard": { profileId:"core.spellcasting.wizard", tradition:"arcane", mode:"prepared", ability:"int", sourceType:"spellbook", themeId:"core.spells.arcane", tier:"high" },
  "core.cleric": { profileId:"core.spellcasting.cleric", tradition:"divine", mode:"prepared", ability:"wis", sourceType:"divine", themeId:"core.spells.divine", tier:"high" },
  "core.druid": { profileId:"core.spellcasting.druid", tradition:"primal", mode:"prepared", ability:"wis", sourceType:"primal", themeId:"core.spells.primal", tier:"high" },
  "core.bard": { profileId:"core.spellcasting.bard", tradition:"occult", mode:"spontaneous", ability:"cha", sourceType:"repertoire", themeId:"core.spells.occult", tier:"high", focusPoints:1 },
  "core.witch": { profileId:"core.spellcasting.witch", tradition:"occult", mode:"prepared", ability:"int", sourceType:"familiar", themeId:"core.spells.occult", tier:"high", focusPoints:1 },
  "core.oracle": { profileId:"core.spellcasting.oracle", tradition:"divine", mode:"spontaneous", ability:"cha", sourceType:"mystery", themeId:"core.spells.divine", tier:"high", focusPoints:1 },
  "core.sorcerer": { profileId:"core.spellcasting.sorcerer", tradition:"arcane", mode:"spontaneous", ability:"cha", sourceType:"bloodline", themeId:"core.spells.arcane", tier:"high", focusPoints:1 }
};

const SPECIALIZATION_OVERRIDES = {
  "core.witch.wild": { tradition:"primal", themeId:"core.spells.primal" },
  "core.witch.fate": { tradition:"occult", themeId:"core.spells.occult" },
  "core.sorcerer.elemental": { tradition:"primal", themeId:"core.spells.primal" },
  "core.sorcerer.draconic": { tradition:"arcane", themeId:"core.spells.arcane" },
  "core.oracle.life": { themeId:"core.spells.divine-healing" },
  "core.oracle.battle": { themeId:"core.spells.divine-battle" },
  "core.druid.storm": { themeId:"core.spells.primal-storm" },
  "core.druid.leaf": { themeId:"core.spells.primal-growth" },
  "core.bard.maestro": { themeId:"core.spells.occult-support" }
};

function maxSpellRank(level) {
  if (level <= 0) return 0;
  return Math.min(10, Math.ceil(level / 2));
}

function chooseUnique(random, entries, count) {
  const pool = [...entries];
  const out = [];
  while (pool.length && out.length < count) {
    const index = random.int(0, pool.length - 1);
    out.push(pool.splice(index, 1)[0]);
  }
  return out;
}

function mergeRankEntries(primary = [], fallback = []) {
  const seen = new Set();
  return [...primary, ...fallback].filter((entry) => {
    const slug = typeof entry === "string" ? entry : entry?.slug;
    if (!slug || seen.has(slug)) return false;
    seen.add(slug);
    return true;
  });
}

function spellRef(entry, rank, prepared = true) {
  const data = typeof entry === "string" ? { slug: entry } : entry;
  return {
    slug: data.slug,
    rank,
    prepared,
    labelKey: data.labelKey ?? null,
    compendium: { packId: data.packId ?? "pf2e.spells-srd", slug: data.slug, itemType: "spell" }
  };
}

export function buildSpellcasting({ level, classProfile, specialization, profession, registry, random }) {
  if (!classProfile?.tags?.includes("spellcaster")) return { entries: [], inventoryItems: [] };
  const registered = registry.list("spellcastingProfiles").find((entry) => entry.classProfileId === classProfile.id) ?? null;
  const base = { ...(CORE_CLASS_PROFILES[classProfile.id] ?? {}), ...(registered ?? {}) };
  if (!base.tradition) return { entries: [], inventoryItems: [] };
  Object.assign(base, SPECIALIZATION_OVERRIDES[specialization?.id] ?? {});
  const highestRank = maxSpellRank(level);
  const benchmark = spellcastingBenchmark(level, base.tier ?? "high");
  const theme = registry.get("spellThemes", base.themeId) ?? registry.get("spellThemes", `core.spells.${base.tradition}`);
  const fallbackTheme = registry.get("spellThemes", `core.spells.${base.tradition}`) ?? { ranks:{} };
  const cantripPool = mergeRankEntries(theme?.ranks?.[0], fallbackTheme?.ranks?.[0]);
  const cantrips = chooseUnique(random, cantripPool, Math.min(4, cantripPool.length)).map((entry) => spellRef(entry, 0, true));
  const spells = [];
  for (let rank = 1; rank <= highestRank; rank++) {
    const pool = mergeRankEntries(theme?.ranks?.[rank], fallbackTheme?.ranks?.[rank]);
    if (!pool.length) continue;
    const count = rank === highestRank ? 3 : 2;
    for (const entry of chooseUnique(random, pool, Math.min(count, pool.length))) spells.push(spellRef(entry, rank, true));
  }
  const knownSpells = [...cantrips, ...spells].map((spell) => ({ ...spell, prepared: base.mode === "prepared" ? spell.prepared : false }));
  if (base.sourceType === "spellbook") {
    for (let rank = 1; rank <= highestRank; rank++) {
      const pool = mergeRankEntries(theme?.ranks?.[rank], fallbackTheme?.ranks?.[rank]).filter((entry) => !knownSpells.some((spell) => spell.rank === rank && spell.slug === (typeof entry === "string" ? entry : entry.slug)));
      const extra = chooseUnique(random, pool, Math.min(1, pool.length));
      for (const entry of extra) knownSpells.push({ ...spellRef(entry, rank, false), knownOnly:true });
    }
  }
  const entry = {
    id: `spellcasting:${classProfile.id}`,
    profileId: base.profileId ?? null,
    tradition: base.tradition,
    mode: base.mode ?? "prepared",
    ability: base.ability ?? "cha",
    sourceType: base.sourceType ?? "repertoire",
    themeId: base.themeId,
    dc: benchmark?.dc ?? 15,
    attack: benchmark?.attack ?? 7,
    benchmarkTier: base.tier ?? "high",
    highestRank,
    focusPoints: Number(base.focusPoints ?? 0),
    spells: knownSpells,
    preparedSpells: knownSpells.filter((spell) => !spell.knownOnly),
    knownSpells
  };
  const inventoryItems = [];
  if (base.sourceType === "spellbook") {
    inventoryItems.push({
      id: "class:wizard-spellbook",
      type: "equipment",
      name: "Spellbook",
      labelKey: "NPCFORGE.Items.Spellbook",
      quantity: 1,
      purpose: "spellbook",
      ownership: "personal",
      significance: "professional",
      compendiumCandidates: [
        { packId:"pf2e.equipment-srd", slug:"spellbook", itemType:"equipment" },
        { packId:"pf2e.equipment-srd", slug:"spellbook-blank", itemType:"equipment" },
        { packId:"pf2e.equipment-srd", slug:"blank-spellbook", itemType:"equipment" }
      ],
      spellbook: { tradition: base.tradition, spells: knownSpells.map((spell) => ({ slug:spell.slug, rank:spell.rank })) }
    });
  }
  return { entries:[entry], inventoryItems };
}
