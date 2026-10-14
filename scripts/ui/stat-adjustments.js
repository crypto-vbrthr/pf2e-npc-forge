import { deepClone } from "../engine/utils.js";

// Creature stat blocks own their individual benchmarks. In particular,
// changing STR must not silently add a second STR bonus to NPC Strikes/skills.
const ATTRIBUTES = new Set(["str", "dex", "con", "int", "wis", "cha"]);
const SAVES = new Set(["fortitude", "reflex", "will"]);
const DEFENSES = new Set(["ac", "hp", "perception", "speed"]);

/**
 * Change exactly one numeric field on a *copy* of an existing neutral NPC.
 * The editor applies this to the model, not to the presentation layer, so
 * the resulting Actor and any embedded host see the same number.
 *
 * `delta` counts button presses (speed uses 5 feet per press).
 */
export function adjustNpcStat(npc, kind, key, delta) {
  if (!npc || typeof npc !== "object") throw new Error("Generate an NPC before adjusting its statistics");
  if (!Number.isSafeInteger(delta) || delta === 0 || Math.abs(delta) > 1000) {
    throw new Error("Statistic adjustments must be non-zero integer steps");
  }
  const next = deepClone(npc);
  let record;
  let field;
  let minimum = -Infinity;
  let step = 1;

  switch (kind) {
    case "attribute":
      if (!ATTRIBUTES.has(key)) throw new Error(`Unknown attribute: ${key}`);
      record = next.statistics?.attributes;
      field = key;
      break;
    case "defense":
      if (!DEFENSES.has(key)) throw new Error(`Unknown defense statistic: ${key}`);
      record = next.statistics;
      field = key;
      if (key === "hp" || key === "ac") minimum = 1;
      if (key === "speed") { minimum = 0; step = 5; }
      break;
    case "save":
      if (!SAVES.has(key)) throw new Error(`Unknown saving throw: ${key}`);
      record = next.statistics?.saves;
      field = key;
      break;
    case "skill":
      record = next.skills?.find((skill) => skill.slug === key);
      field = "modifier";
      if (!record) throw new Error(`Unknown NPC skill: ${key}`);
      break;
    case "attack":
      record = next.attacks?.find((attack) => attack.id === key);
      field = "modifier";
      if (!record) throw new Error(`Unknown NPC attack: ${key}`);
      break;
    default:
      throw new Error(`Unknown statistic kind: ${kind}`);
  }

  if (!record || !Number.isFinite(record[field])) {
    throw new Error(`Missing numeric statistic: ${kind}.${key}`);
  }
  const value = Math.max(minimum, record[field] + delta * step);
  if (!Number.isSafeInteger(value)) throw new Error(`Statistic adjustment is out of range: ${kind}.${key}`);
  record[field] = value;
  return next;
}
