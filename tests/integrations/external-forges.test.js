import test from "node:test";
import assert from "node:assert/strict";
import { applyAfflictionForgeIntegration, generateItemForgePersonalTreasure } from "../../scripts/integrations/external-forge-orchestrator.js";

function baseNpc(overrides = {}) {
  return {
    generation: { seed: "integration-seed" },
    build: { level: 8, classProfile: { id: "core.rogue" }, profession: { id: "core.thief", tags: ["criminal"] }, role: { tags: [] } },
    attacks: [{ id: "primary-attack", damage: { type: "piercing" } }],
    integrations: { afflictionForge: { requested: true, policy: "always" }, itemForge: { requested: true } },
    ...overrides
  };
}

test("Affliction Forge injury poison is attached to the matching melee source", async () => {
  const added = [];
  const api = {
    libraries: { search: async () => [{ uuid: "Compendium.poison.Item.venom", name: "Venom", level: 7 }] },
    templates: { read: async () => ({ delivery: { injuryPoison: true } }) },
    references: {
      createInjuryPoison: ({ templateUuid, label, charges }) => ({ id: "injury-poison", templateUuid, label, charges }),
      addToSource: (source, reference) => { added.push(reference); return { ...source, flags: { ...(source.flags ?? {}), "pf2e-affliction-forge": { afflictionReferences: [reference] } } }; }
    }
  };
  const meleeItems = [{ name: "Dagger", type: "melee", flags: {} }];
  const result = await applyAfflictionForgeIntegration({ npc: baseNpc(), meleeItems, integrations: { afflictions: { ready: true, api } }, diagnostics: { warnings: [], fallbacks: [] } });
  assert.equal(result.applied, true);
  assert.equal(result.charges, 2);
  assert.equal(added[0].templateUuid, "Compendium.poison.Item.venom");
  assert.equal(meleeItems[0].flags["pf2e-affliction-forge"].afflictionReferences.length, 1);
});

test("Affliction Forge gracefully degrades when unavailable", async () => {
  const diagnostics = { warnings: [], fallbacks: [] };
  const result = await applyAfflictionForgeIntegration({ npc: baseNpc(), meleeItems: [{}], integrations: { afflictions: { ready: false } }, diagnostics });
  assert.equal(result.applied, false);
  assert.ok(diagnostics.fallbacks.includes("affliction-forge-unavailable"));
});

test("Item Forge personal treasure becomes a creation-ready personal Item source", async () => {
  const api = {
    generate: async (request) => ({
      itemSource: { _id: "remove-me", name: "Silver Brooch", type: "treasure", system: { price: { value: { gp: 80 } } }, flags: {} },
      metadata: { category: request.category }
    })
  };
  const result = await generateItemForgePersonalTreasure({ npc: baseNpc(), integrations: { items: { ready: true, api } }, diagnostics: { warnings: [], fallbacks: [] } });
  assert.equal(result.applied, true);
  assert.equal(result.itemSource._id, undefined);
  assert.equal(result.itemSource.flags["pf2e-npc-forge"].purpose, "personal");
  assert.equal(result.itemSource.flags["pf2e-npc-forge"].origin, "item-forge");
});

test("Item Forge gracefully degrades when unavailable", async () => {
  const diagnostics = { warnings: [], fallbacks: [] };
  const result = await generateItemForgePersonalTreasure({ npc: baseNpc(), integrations: { items: { ready: false } }, diagnostics });
  assert.equal(result.applied, false);
  assert.ok(diagnostics.fallbacks.includes("item-forge-unavailable"));
});
