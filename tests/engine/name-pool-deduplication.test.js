import test from "node:test";
import assert from "node:assert/strict";
import { ContentRegistry } from "../../scripts/engine/content/content-registry.js";
import { generateNameData } from "../../scripts/engine/names/name-generator.js";

function captureGivenPool(pack, gender = "male") {
  const registry = new ContentRegistry();
  registry.register("namePacks", "test-addon", {
    id: "test-addon.names",
    ancestryIds: ["core.human"],
    supportedLocales: ["en"],
    family: [],
    weight: 1,
    ...pack
  });

  const pickedPools = [];
  const random = {
    pick(values) {
      pickedPools.push(values);
      return values[0] ?? null;
    },
    chance() { return false; }
  };
  const resolver = { resolve(values) { return values[0] ?? null; } };

  generateNameData({
    registry,
    resolver,
    ancestry: { id: "core.human" },
    random,
    gender,
    request: {
      nameLocale: "en",
      namePack: { mode: "fixed", id: "test-addon.names" }
    }
  });

  return pickedPools[0] ?? [];
}

test("neutral and any given names do not receive duplicate weight when also present in the preferred gender pool", () => {
  const pool = captureGivenPool({
    given: {
      male: ["Finn", "Arvo"],
      neutral: ["Finn", "Ryn"],
      any: ["Ryn", "Vale"]
    }
  });

  assert.deepEqual(pool.map((entry) => entry.literal), ["Finn", "Arvo", "Ryn", "Vale"]);
});

test("fallback aggregation deduplicates names shared by multiple gender-specific pools", () => {
  const pool = captureGivenPool({
    given: {
      male: ["Sam", "Borin"],
      female: ["Sam", "Dagna"]
    }
  }, "unspecified");

  assert.deepEqual(pool.map((entry) => entry.literal), ["Sam", "Borin", "Dagna"]);
});
