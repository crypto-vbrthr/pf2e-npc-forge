import { deepClone } from "../engine/utils.js";
import { MODULE_ID } from "../constants.js";

function hash01(value) {
  let hash = 2166136261;
  for (const ch of String(value ?? "")) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

function localized(key, fallback = "") {
  if (!key || !globalThis.game?.i18n?.localize) return fallback;
  const value = globalThis.game.i18n.localize(key);
  return value && value !== key ? value : fallback;
}

function relevantPoisonChance(npc) {
  const classId = npc.build?.classProfile?.id;
  const specId = npc.build?.classSpecialization?.id;
  const professionTags = new Set(npc.build?.profession?.tags ?? []);
  if (specId?.includes("toxicologist")) return 0.9;
  if (classId === "core.rogue" || classId === "core.alchemist" || professionTags.has("criminal")) return 0.65;
  if (["core.ranger", "core.swashbuckler", "core.investigator"].includes(classId)) return 0.25;
  return 0.1;
}

function poisonEligibleAttack(attack) {
  return ["piercing", "slashing"].includes(attack?.damage?.type);
}

function poisonLevelWindow(level) {
  const numeric = Number(level ?? 0);
  return { minLevel: Math.max(0, numeric - 3), maxLevel: Math.max(0, numeric + 1) };
}

async function findInjuryPoison(api, npc) {
  const window = poisonLevelWindow(npc.build?.level);
  const descriptors = await api.libraries.search({ types: ["poison"], ...window });
  const valid = [];
  for (const descriptor of descriptors ?? []) {
    const uuid = descriptor.uuid ?? descriptor.sourceUuid ?? null;
    if (!uuid) continue;
    try {
      const definition = await api.templates.read(uuid);
      if (definition?.delivery?.injuryPoison === true) valid.push({ descriptor, definition, uuid });
    } catch {
      // Ignore malformed/unreadable external templates and continue searching.
    }
  }
  if (!valid.length) return null;
  valid.sort((a, b) => Math.abs(Number(a.descriptor.level ?? 0) - npc.build.level) - Math.abs(Number(b.descriptor.level ?? 0) - npc.build.level) || String(a.descriptor.name).localeCompare(String(b.descriptor.name)));
  const topDistance = Math.abs(Number(valid[0].descriptor.level ?? 0) - npc.build.level);
  const pool = valid.filter((candidate) => Math.abs(Number(candidate.descriptor.level ?? 0) - npc.build.level) <= topDistance + 1);
  return pool[Math.floor(hash01(`${npc.generation.seed}:injury-poison`) * pool.length) % pool.length];
}

function poisonCharges(npc) {
  const level = Number(npc.build?.level ?? 0);
  if (level >= 15) return 3;
  if (level >= 8) return 2;
  return 1;
}

export async function applyAfflictionForgeIntegration({ npc, meleeItems, integrations, diagnostics }) {
  const request = npc.integrations?.afflictionForge;
  if (!request?.requested) return { applied: false, reason: "not-requested" };
  const service = integrations?.afflictions;
  if (!service?.ready) {
    diagnostics?.fallbacks?.push("affliction-forge-unavailable");
    return { applied: false, reason: "unavailable" };
  }

  const eligible = (npc.attacks ?? []).map((attack, index) => ({ attack, item: meleeItems[index] })).filter(({ attack, item }) => item && poisonEligibleAttack(attack));
  if (!eligible.length) return { applied: false, reason: "no-eligible-attack" };
  if (request.policy !== "always" && hash01(`${npc.generation.seed}:poison-chance`) >= relevantPoisonChance(npc)) return { applied: false, reason: "chance" };

  const candidate = await findInjuryPoison(service.api, npc);
  if (!candidate) {
    diagnostics?.fallbacks?.push("no-injury-poison-match");
    return { applied: false, reason: "no-match" };
  }

  const charges = request.charges ?? poisonCharges(npc);
  const reference = service.api.references.createInjuryPoison({ templateUuid: candidate.uuid, label: candidate.descriptor.name, charges });
  const host = eligible[0].item;
  const enriched = service.api.references.addToSource(host, reference);
  Object.assign(host, enriched);
  host.flags ??= {};
  host.flags[MODULE_ID] = {
    ...(host.flags[MODULE_ID] ?? {}),
    injuryPoison: { templateUuid: candidate.uuid, label: candidate.descriptor.name, charges }
  };
  return { applied: true, templateUuid: candidate.uuid, label: candidate.descriptor.name, charges, attackId: eligible[0].attack.id };
}

function personalTreasureCategory(npc) {
  const tags = new Set([...(npc.build?.profession?.tags ?? []), ...(npc.build?.role?.tags ?? [])]);
  if (tags.has("scholar") || tags.has("academic")) return "treasure.book";
  if (tags.has("religion") || tags.has("divine")) return "treasure.ceremonial";
  if (tags.has("merchant") || tags.has("noble") || tags.has("social")) return "treasure.jewelry";
  if (tags.has("maritime")) return "treasure.luxury";
  return ["treasure.jewelry", "treasure.art", "treasure.tableware", "treasure.book"][Math.floor(hash01(`${npc.generation.seed}:treasure-category`) * 4) % 4];
}

function personalTreasureTarget(level) {
  const bands = [2, 4, 7, 12, 20, 35, 55, 85, 130, 200, 300, 450, 650, 900, 1250, 1750, 2400, 3300, 4500, 6000, 8000, 10000, 13000, 16000, 20000, 25000];
  return bands[Math.max(0, Math.min(bands.length - 1, Number(level ?? 0) + 1))];
}

function cleanGeneratedItemSource(source) {
  const clone = deepClone(source);
  delete clone._id;
  delete clone.folder;
  delete clone.sort;
  clone.flags ??= {};
  clone.flags[MODULE_ID] = {
    ...(clone.flags[MODULE_ID] ?? {}),
    generated: true,
    purpose: "personal",
    origin: "item-forge",
    significance: "personal"
  };
  return clone;
}

export async function generateItemForgePersonalTreasure({ npc, integrations, diagnostics }) {
  const request = npc.integrations?.itemForge;
  if (!request?.requested) return { applied: false, reason: "not-requested", itemSource: null };
  const service = integrations?.items;
  if (!service?.ready) {
    diagnostics?.fallbacks?.push("item-forge-unavailable");
    return { applied: false, reason: "unavailable", itemSource: null };
  }
  const category = request.category ?? personalTreasureCategory(npc);
  const target = request.targetValue ?? personalTreasureTarget(npc.build?.level);
  try {
    const result = await service.api.generate({
      mode: "treasure",
      category,
      seed: `${npc.generation.seed}:personal-treasure`,
      value: { mode: "target", target, tolerance: 0.25 },
      solver: { maxAttempts: 50 },
      treasure: { type: "any", material: "any", condition: "any", craftsmanship: "any", motif: "any", style: "any" }
    });
    if (!result?.itemSource) throw new Error("Item Forge returned no itemSource");
    return { applied: true, category, targetValue: target, itemSource: cleanGeneratedItemSource(result.itemSource), metadata: result.metadata ?? null };
  } catch (error) {
    diagnostics?.warnings?.push(`${localized("NPCFORGE.Integrations.ItemForgeFailed", "Item Forge personal item generation failed")}: ${error.message}`);
    diagnostics?.fallbacks?.push("item-forge-generation-failed");
    return { applied: false, reason: "error", itemSource: null, error };
  }
}
