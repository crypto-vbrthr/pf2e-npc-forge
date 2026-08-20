import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { ContentRegistry } from "../engine/content/content-registry.js";
import { registerCoreContent } from "../engine/content/core-content.js";
import { API_VERSION, SCHEMA_VERSION } from "../constants.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const failures = [];

function walk(dir) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...walk(full));
    else result.push(full);
  }
  return result;
}

const jsFiles = walk(root).filter((file) => file.endsWith(".js"));
for (const file of jsFiles) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) failures.push(`Syntax: ${path.relative(root, file)}\n${result.stderr}`);
}

const jsonFiles = walk(root).filter((file) => file.endsWith(".json"));
for (const file of jsonFiles) {
  try { JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (error) { failures.push(`JSON: ${path.relative(root, file)}: ${error.message}`); }
}

const en = JSON.parse(fs.readFileSync(path.join(root, "lang/en.json"), "utf8"));
const de = JSON.parse(fs.readFileSync(path.join(root, "lang/de.json"), "utf8"));
const enKeys = Object.keys(en).sort();
const deKeys = Object.keys(de).sort();
for (const key of enKeys.filter((key) => !Object.hasOwn(de, key))) failures.push(`Localization missing in de: ${key}`);
for (const key of deKeys.filter((key) => !Object.hasOwn(en, key))) failures.push(`Localization missing in en: ${key}`);

const moduleJson = JSON.parse(fs.readFileSync(path.join(root, "module.json"), "utf8"));
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
if (moduleJson.version !== API_VERSION) failures.push(`module.json version ${moduleJson.version} != API_VERSION ${API_VERSION}`);
if (packageJson.version !== API_VERSION) failures.push(`package.json version ${packageJson.version} != API_VERSION ${API_VERSION}`);
if (!Number.isInteger(SCHEMA_VERSION) || SCHEMA_VERSION < 1) failures.push(`Invalid schema version: ${SCHEMA_VERSION}`);

try {
  const registry = new ContentRegistry();
  registerCoreContent(registry);
  const checks = [
    registry.validateHierarchy("classSpecializations", { parentType: "classProfiles" }),
    registry.validateHierarchy("professions", { parentType: "professionCategories" }),
    registry.validateHierarchy("professionSpecializations", { parentType: "professions" })
  ];
  for (const check of checks) if (!check.valid) failures.push(...check.errors.map((error) => `Content: ${error}`));

  const relationshipPacks = registry.list("relationshipPacks");
  const relationshipIds = new Set(
    relationshipPacks.flatMap((pack) => (pack.relationships ?? []).map((relationship) => relationship.id))
  );
  for (const pack of relationshipPacks) {
    for (const relationship of pack.relationships ?? []) {
      if (!relationship.reciprocalTypeId) {
        failures.push(`Content: relationship ${relationship.id} missing reciprocalTypeId`);
      } else if (!relationshipIds.has(relationship.reciprocalTypeId)) {
        failures.push(`Content: relationship ${relationship.id} references missing reciprocal ${relationship.reciprocalTypeId}`);
      }
    }
  }
} catch (error) {
  failures.push(`Content registration: ${error.stack ?? error.message}`);
}

if (failures.length) {
  console.error(`NPC Forge release checks failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`NPC Forge release checks passed: ${jsFiles.length} JS files, ${jsonFiles.length} JSON files, ${enKeys.length} localization keys, API ${API_VERSION}, schema ${SCHEMA_VERSION}.`);
