function apiCapabilities(api) {
  if (!api) return null;
  if (api.capabilities instanceof Set) return [...api.capabilities];
  if (Array.isArray(api.capabilities)) return [...api.capabilities];
  if (typeof api.getCapabilities === "function") {
    try { return api.getCapabilities(); } catch { return null; }
  }
  return api.capabilities ?? null;
}

export class IntegrationService {
  constructor(moduleId, { probe = apiCapabilities, required = [], implemented = true } = {}) {
    this.moduleId = moduleId;
    this.probe = probe;
    this.required = required;
    this.implemented = implemented;
  }

  get module() {
    return globalThis.game?.modules?.get?.(this.moduleId) ?? null;
  }

  get api() {
    return this.module?.api ?? null;
  }

  get installed() {
    return Boolean(this.module);
  }

  get active() {
    return Boolean(this.module?.active);
  }

  get available() {
    return Boolean(this.api);
  }

  get capabilities() {
    return this.available ? this.probe(this.api) : null;
  }

  get ready() {
    if (!this.implemented || !this.active || !this.available) return false;
    return this.required.every((path) => {
      let value = this.api;
      for (const part of path.split(".")) value = value?.[part];
      return typeof value === "function" || Boolean(value);
    });
  }

  status() {
    return {
      moduleId: this.moduleId,
      installed: this.installed,
      active: this.active,
      available: this.available,
      ready: this.ready,
      capabilities: this.capabilities,
      implemented: this.implemented,
      planned: !this.implemented
    };
  }
}

export function createExternalIntegrations() {
  return {
    afflictions: new IntegrationService("pf2e-affliction-forge", {
      required: ["libraries.search", "templates.read", "references.createInjuryPoison", "references.addToSource"]
    }),
    items: new IntegrationService("pf2e-item-forge", {
      probe: (api) => typeof api?.getCapabilities === "function" ? api.getCapabilities() : apiCapabilities(api),
      required: ["generate"]
    }),
    loot: new IntegrationService("pf2e-loot-forge", { implemented: false })
  };
}
