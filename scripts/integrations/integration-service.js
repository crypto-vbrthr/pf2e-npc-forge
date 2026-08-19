export class IntegrationService {
  constructor(moduleId, capabilityProbe = () => null) {
    this.moduleId = moduleId;
    this.capabilityProbe = capabilityProbe;
  }

  get api() {
    return globalThis.game?.modules?.get?.(this.moduleId)?.api ?? null;
  }

  get available() {
    return Boolean(this.api);
  }

  get capabilities() {
    return this.available ? this.capabilityProbe(this.api) : null;
  }
}

export function createExternalIntegrations() {
  return {
    afflictions: new IntegrationService("pf2e-affliction-forge", (api) => api?.capabilities ?? null),
    items: new IntegrationService("pf2e-item-forge", (api) => api?.capabilities ?? null),
    loot: new IntegrationService("pf2e-loot-forge", (api) => api?.capabilities ?? null)
  };
}
