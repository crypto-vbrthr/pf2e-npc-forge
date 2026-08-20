import test from "node:test";
import assert from "node:assert/strict";
import { IntegrationService } from "../../scripts/integrations/integration-service.js";
import { inspectExternalIntegrations } from "../../scripts/integrations/external-forge-orchestrator.js";

test("IntegrationService distinguishes installed, active, available and ready", () => {
  const previousGame = globalThis.game;
  globalThis.game = {
    modules: new Map([["example", { active: true, api: { ping() {} } }]])
  };
  try {
    const service = new IntegrationService("example", { required: ["ping"] });
    assert.deepEqual(service.status(), {
      moduleId: "example",
      installed: true,
      active: true,
      available: true,
      ready: true,
      capabilities: null,
      implemented: true,
      planned: false
    });
  } finally {
    globalThis.game = previousGame;
  }
});

test("integration inspection reports Affliction Forge library and injury-poison availability", async () => {
  const afflictions = {
    ready: true,
    status: () => ({ moduleId: "pf2e-affliction-forge", installed: true, active: true, available: true, ready: true, capabilities: [] }),
    api: {
      libraries: {
        summary: () => ({ enabled: 3, providers: 2 }),
        search: async (options = {}) => options.minLevel != null
          ? [{ uuid: "A", name: "Injury", level: 8 }, { uuid: "B", name: "Contact", level: 8 }]
          : [{ uuid: "A", name: "Injury", level: 8 }]
      },
      templates: {
        read: async (uuid) => ({ afflictionType: "poison", delivery: { injuryPoison: uuid === "A" } })
      }
    }
  };
  const details = await inspectExternalIntegrations({
    integrations: {
      afflictions,
      items: { status: () => ({ moduleId: "pf2e-item-forge", installed: true, active: true, available: true, ready: true }) },
      loot: { status: () => ({ moduleId: "pf2e-loot-forge", installed: false, active: false, available: false, ready: false }) }
    },
    level: 8
  });
  assert.equal(details.afflictionForge.enabledLibraries, 3);
  assert.equal(details.afflictionForge.providers, 2);
  assert.equal(details.afflictionForge.poisonsInRange, 2);
  assert.equal(details.afflictionForge.injuryPoisonsInRange, 1);
});


test("IntegrationService is not ready when the module is inactive even if an API object exists", () => {
  const previousGame = globalThis.game;
  globalThis.game = { modules: new Map([["example", { active: false, api: { ping() {} } }]]) };
  try {
    const service = new IntegrationService("example", { required: ["ping"] });
    assert.equal(service.available, true);
    assert.equal(service.active, false);
    assert.equal(service.ready, false);
  } finally {
    globalThis.game = previousGame;
  }
});

test("planned integrations report planned instead of ready", () => {
  const previousGame = globalThis.game;
  globalThis.game = { modules: new Map([["planned", { active: true, api: {} }]]) };
  try {
    const service = new IntegrationService("planned", { implemented: false });
    const status = service.status();
    assert.equal(status.ready, false);
    assert.equal(status.planned, true);
    assert.equal(status.active, true);
  } finally {
    globalThis.game = previousGame;
  }
});
