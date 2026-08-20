import { MODULE_ID } from "../constants.js";
import { presentNpc } from "./npc-presentation.js";

const TEMPLATE = `modules/${MODULE_ID}/templates/npc-editor-core.hbs`;

function definitionOptions(values, selectedId) {
  return values.map((entry) => ({
    value: entry.id,
    labelKey: entry.labelKey,
    label: entry.label ?? entry.id,
    selected: entry.id === selectedId
  }));
}

function integrationRow(labelKey, status, { details = null } = {}) {
  let stateKey = "NPCFORGE.Integrations.StatusUnavailable";
  let stateClass = "unavailable";
  if (status?.ready) {
    stateKey = "NPCFORGE.Integrations.StatusConnected";
    stateClass = "connected";
  } else if (status?.planned && (status?.active || status?.available)) {
    stateKey = "NPCFORGE.Integrations.StatusDetectedPlanned";
    stateClass = "planned";
  } else if (status?.active) {
    stateKey = "NPCFORGE.Integrations.StatusIncomplete";
    stateClass = "incomplete";
  } else if (status?.installed) {
    stateKey = "NPCFORGE.Integrations.StatusInactive";
    stateClass = "inactive";
  }
  return {
    moduleId: status?.moduleId ?? null,
    label: game.i18n.localize(labelKey),
    statusLabel: game.i18n.localize(stateKey),
    stateClass,
    details
  };
}

async function renderTemplateCompat(path, context) {
  const renderer = globalThis.foundry?.applications?.handlebars?.renderTemplate ?? globalThis.renderTemplate;
  if (typeof renderer !== "function") throw new Error("Foundry Handlebars renderer is unavailable");
  return renderer(path, context);
}

function isElement(value) {
  if (!value) return false;
  if (globalThis.HTMLElement && value instanceof globalThis.HTMLElement) return true;
  return value.nodeType === 1 && typeof value.querySelector === "function";
}

export class NpcEditorCore {
  constructor({ session, api, mode = "embedded", actionBar = "default" } = {}) {
    this.session = session;
    this.api = api;
    this.mode = mode === "standalone" ? "standalone" : "embedded";
    this.actionBar = ["default", "host", "none"].includes(actionBar) ? actionBar : "default";
    this.mountElement = null;
    this._abortController = null;
    this._pendingUiState = null;
    this._integrationInspectionCache = null;
    this._renderToken = 0;
    this._renderPromise = Promise.resolve();
  }

  mount(element) {
    if (!isElement(element)) throw new Error("mount requires an HTMLElement-like host element");
    if (this.mountElement && this.mountElement !== element) this.unmount();
    this.mountElement = element;
    element.dataset.npcForgeEmbedded = this.mode === "embedded" ? "true" : "false";
    element.classList?.add?.("npc-forge-editor-host");
    this.render({ preserveUiState: false });
    return this;
  }

  unmount() {
    this._abortController?.abort?.();
    this._abortController = null;
    if (this.mountElement) {
      delete this.mountElement.dataset.npcForgeEmbedded;
      this.mountElement.classList?.remove?.("npc-forge-editor-host");
      this.mountElement.innerHTML = "";
    }
    this.mountElement = null;
    this._pendingUiState = null;
    return this;
  }

  destroy() {
    this.unmount();
    this.session = null;
    this.api = null;
  }

  captureUiState() {
    if (!this.mountElement) return null;
    const controls = this.mountElement.querySelector?.(".npc-forge-controls-scroll");
    const preview = this.mountElement.querySelector?.(".npc-forge-preview-scroll");
    const sections = {};
    for (const section of this.mountElement.querySelectorAll?.("details[data-section-id]") ?? []) {
      sections[section.dataset.sectionId] = section.open;
    }
    this._pendingUiState = {
      controlsScrollTop: controls?.scrollTop ?? 0,
      previewScrollTop: preview?.scrollTop ?? 0,
      sections
    };
    return this._pendingUiState;
  }

  async render({ preserveUiState = true } = {}) {
    if (!this.mountElement || !this.session || !this.api) return this;
    if (preserveUiState && !this._pendingUiState) this.captureUiState();
    const token = ++this._renderToken;
    this._renderPromise = (async () => {
      const context = await this._prepareContext();
      const html = await renderTemplateCompat(TEMPLATE, context);
      if (!this.mountElement || token !== this._renderToken) return;
      this._abortController?.abort?.();
      this._abortController = new AbortController();
      this.mountElement.innerHTML = html;
      this._bindEvents();
      this._restoreUiState();
    })();
    await this._renderPromise;
    return this;
  }

  whenRendered() {
    return this._renderPromise;
  }

  async _inspectIntegrations() {
    const level = Number(this.session.request.level ?? 0);
    const now = Date.now();
    const cached = this._integrationInspectionCache;
    if (cached?.level === level && now - cached.timestamp < 5000) return cached.value;
    const value = await this.api.integrations.inspect({ level });
    this._integrationInspectionCache = { level, timestamp: now, value };
    return value;
  }

  async _prepareContext() {
    const request = this.session.request;
    const preview = this.session.npc;
    const localize = (key) => game.i18n.localize(key);
    const classSpecializations = this.api.registry.children("classSpecializations", request.classProfile);
    const professions = request.professionCategory
      ? this.api.registry.children("professions", request.professionCategory)
      : this.api.content.list("professions");
    const professionSpecializations = request.profession
      ? this.api.registry.children("professionSpecializations", request.profession)
      : [];
    const namePacks = this.api.content.listNamePacks({ ancestryId: request.ancestry, locale: game.i18n.lang ?? "en" });
    const integrationStatus = await this._inspectIntegrations();
    const afflictionStatus = integrationStatus.afflictionForge;
    let afflictionDetails = null;
    if (afflictionStatus?.ready) {
      if (afflictionStatus.probeError) {
        afflictionDetails = game.i18n.localize("NPCFORGE.Integrations.ProbeFailed");
      } else if (Number.isInteger(afflictionStatus.injuryPoisonsInRange)) {
        afflictionDetails = game.i18n.format("NPCFORGE.Integrations.AfflictionDetails", {
          libraries: afflictionStatus.enabledLibraries ?? "?",
          poisons: afflictionStatus.injuryPoisonsInRange,
          total: afflictionStatus.injuryPoisonsTotal ?? afflictionStatus.injuryPoisonsInRange
        });
      }
    }
    const integrationRows = [
      integrationRow("NPCFORGE.Integrations.AfflictionForgeName", afflictionStatus, { details: afflictionDetails }),
      integrationRow("NPCFORGE.Integrations.ItemForgeName", integrationStatus.itemForge),
      integrationRow("NPCFORGE.Integrations.LootForgeName", integrationStatus.lootForge)
    ];
    const defaultActions = this.actionBar === "default";
    return {
      preview,
      view: presentNpc(preview, localize),
      hasPreview: Boolean(preview),
      request,
      embedded: this.mode === "embedded",
      standalone: this.mode === "standalone",
      capabilities: this.session.capabilities,
      showGenerate: defaultActions,
      showCreateActor: defaultActions && this.session.capabilities.createActor && Boolean(preview),
      showCommit: defaultActions && this.mode === "embedded",
      showCancel: defaultActions && this.mode === "embedded",
      showPreviewActions: defaultActions && ((this.session.capabilities.createActor && Boolean(preview)) || this.mode === "embedded"),
      ancestryOptions: definitionOptions(this.api.content.list("ancestries"), request.ancestry),
      classOptions: definitionOptions(this.api.content.list("classProfiles"), request.classProfile),
      roleOptions: definitionOptions(this.api.content.list("roles"), request.role),
      specializationOptions: definitionOptions(classSpecializations, request.classSpecialization),
      hasSpecializations: classSpecializations.length > 0,
      professionCategoryOptions: definitionOptions(this.api.content.list("professionCategories"), request.professionCategory),
      professionOptions: definitionOptions(professions, request.profession),
      professionSpecializationOptions: definitionOptions(professionSpecializations, request.professionSpecialization),
      hasProfessionSpecializations: professionSpecializations.length > 0,
      namePackOptions: definitionOptions(namePacks, request.identity?.namePack ?? null),
      genderOptions: [
        { value: "random", labelKey: "NPCFORGE.Fields.Automatic", selected: (request.identity?.gender ?? "random") === "random" },
        { value: "female", labelKey: "NPCFORGE.Identity.GenderFemale", selected: request.identity?.gender === "female" },
        { value: "male", labelKey: "NPCFORGE.Identity.GenderMale", selected: request.identity?.gender === "male" },
        { value: "nonbinary", labelKey: "NPCFORGE.Identity.GenderNonbinary", selected: request.identity?.gender === "nonbinary" }
      ],
      appearanceEnabled: request.appearance?.enabled !== false,
      appearanceAllowScars: request.appearance?.allowScars !== false,
      appearanceAllowAgeFeatures: request.appearance?.allowAgeFeatures !== false,
      appearanceAllowBodyShape: request.appearance?.allowBodyShape !== false,
      appearanceAllowPosture: request.appearance?.allowPosture !== false,
      appearanceIntensityOptions: [
        { value: "low", labelKey: "NPCFORGE.Appearance.IntensityLow", selected: (request.appearance?.intensity ?? "medium") === "low" },
        { value: "medium", labelKey: "NPCFORGE.Appearance.IntensityMedium", selected: (request.appearance?.intensity ?? "medium") === "medium" },
        { value: "high", labelKey: "NPCFORGE.Appearance.IntensityHigh", selected: (request.appearance?.intensity ?? "medium") === "high" }
      ],
      personalityEnabled: request.personality?.enabled !== false,
      personalityAllowSecrets: request.personality?.allowSecrets !== false,
      inventoryEnabled: request.inventory?.enabled !== false,
      personalItemsEnabled: request.inventory?.personalItems === true,
      poisonedWeaponsEnabled: request.inventory?.allowPoisonedWeapons === true,
      poisonPolicyOptions: [
        { value: "automatic", labelKey: "NPCFORGE.Integrations.PoisonPolicyAutomatic", selected: (request.inventory?.poisonPolicy ?? "automatic") === "automatic" },
        { value: "always", labelKey: "NPCFORGE.Integrations.PoisonPolicyAlways", selected: request.inventory?.poisonPolicy === "always" }
      ],
      integrationRows,
      personalityIntensityOptions: [
        { value: "low", labelKey: "NPCFORGE.Personality.IntensityLow", selected: (request.personality?.intensity ?? "medium") === "low" },
        { value: "medium", labelKey: "NPCFORGE.Personality.IntensityMedium", selected: (request.personality?.intensity ?? "medium") === "medium" },
        { value: "high", labelKey: "NPCFORGE.Personality.IntensityHigh", selected: (request.personality?.intensity ?? "medium") === "high" }
      ],
      ageOptions: [
        { value: "random", labelKey: "NPCFORGE.Fields.Automatic", selected: (request.identity?.ageCategory ?? "random") === "random" },
        { value: "youngAdult", labelKey: "NPCFORGE.Identity.AgeYoungAdult", selected: request.identity?.ageCategory === "youngAdult" },
        { value: "adult", labelKey: "NPCFORGE.Identity.AgeAdult", selected: request.identity?.ageCategory === "adult" },
        { value: "middleAged", labelKey: "NPCFORGE.Identity.AgeMiddleAged", selected: request.identity?.ageCategory === "middleAged" },
        { value: "elder", labelKey: "NPCFORGE.Identity.AgeElder", selected: request.identity?.ageCategory === "elder" }
      ]
    };
  }

  _restoreUiState() {
    if (!this._pendingUiState || !this.mountElement) return;
    const state = this._pendingUiState;
    this._pendingUiState = null;

    for (const section of this.mountElement.querySelectorAll?.("details[data-section-id]") ?? []) {
      if (Object.hasOwn(state.sections, section.dataset.sectionId)) section.open = state.sections[section.dataset.sectionId];
    }

    const restoreScroll = () => {
      if (!this.mountElement) return;
      const controls = this.mountElement.querySelector?.(".npc-forge-controls-scroll");
      const preview = this.mountElement.querySelector?.(".npc-forge-preview-scroll");
      if (controls) controls.scrollTop = state.controlsScrollTop;
      if (preview) preview.scrollTop = state.previewScrollTop;
    };

    const raf = globalThis.requestAnimationFrame ?? ((callback) => setTimeout(callback, 0));
    raf(() => raf(restoreScroll));
  }

  _bindEvents() {
    if (!this.mountElement) return;
    const signal = this._abortController?.signal;
    const form = this.mountElement.querySelector("form[data-npc-forge-request]");
    form?.addEventListener("input", () => this._onFormInput(form), { signal });
    this.mountElement.addEventListener("click", (event) => this._onClick(event), { signal });
  }

  _onFormInput(form) {
    const data = new FormData(form);
    const current = this.session.request;
    const nextClass = String(data.get("classProfile") ?? "core.fighter");
    const classChanged = nextClass !== current.classProfile;
    const nextAncestry = String(data.get("ancestry") ?? "core.human");
    const ancestryChanged = nextAncestry !== current.ancestry;
    const nextCategory = String(data.get("professionCategory") ?? "") || null;
    const categoryChanged = nextCategory !== current.professionCategory;
    const nextProfession = categoryChanged ? null : (String(data.get("profession") ?? "") || null);
    const professionChanged = nextProfession !== current.profession;
    const nextRequest = {
      ...current,
      level: Number(data.get("level") ?? 3),
      ancestry: nextAncestry,
      classProfile: nextClass,
      role: String(data.get("role") ?? "core.ordinary"),
      classSpecialization: classChanged ? null : (String(data.get("classSpecialization") ?? "") || null),
      professionCategory: nextCategory,
      profession: nextProfession,
      professionSpecialization: (categoryChanged || professionChanged) ? null : (String(data.get("professionSpecialization") ?? "") || null),
      identity: {
        ...(current.identity ?? {}),
        name: String(data.get("identityName") ?? "").trim() || null,
        generateName: !String(data.get("identityName") ?? "").trim(),
        gender: String(data.get("identityGender") ?? "random"),
        ageCategory: String(data.get("identityAgeCategory") ?? "random"),
        namePack: ancestryChanged ? null : (String(data.get("identityNamePack") ?? "") || null),
        nameLocale: game.i18n.lang ?? "en"
      },
      appearance: {
        ...(current.appearance ?? {}),
        enabled: data.get("appearanceEnabled") === "on",
        intensity: String(data.get("appearanceIntensity") ?? "medium"),
        allowScars: data.get("appearanceAllowScars") === "on",
        allowAgeFeatures: data.get("appearanceAllowAgeFeatures") === "on",
        allowBodyShape: data.get("appearanceAllowBodyShape") === "on",
        allowPosture: data.get("appearanceAllowPosture") === "on"
      },
      personality: {
        ...(current.personality ?? {}),
        enabled: data.get("personalityEnabled") === "on",
        intensity: String(data.get("personalityIntensity") ?? "medium"),
        allowSecrets: data.get("personalityAllowSecrets") === "on"
      },
      inventory: this.session.capabilities.editInventory ? {
        ...(current.inventory ?? {}),
        enabled: data.get("inventoryEnabled") === "on",
        personalItems: data.get("personalItems") === "on",
        allowPoisonedWeapons: data.get("allowPoisonedWeapons") === "on",
        poisonPolicy: String(data.get("poisonPolicy") ?? "automatic") === "always" ? "always" : "automatic"
      } : { ...(current.inventory ?? {}) }
    };
    this.session.setRequest(nextRequest, { render: false, notify: true });
    if (classChanged || categoryChanged || professionChanged || ancestryChanged) {
      this.captureUiState();
      this.render({ preserveUiState: false });
    }
  }

  async _onClick(event) {
    const button = event.target?.closest?.("[data-editor-action]");
    if (!button || !this.mountElement?.contains?.(button)) return;
    const action = button.dataset.editorAction;
    try {
      if (action === "generate") {
        this.captureUiState();
        await this.session.generate();
      } else if (action === "createActor") {
        await this.session.createActor();
      } else if (action === "commit") {
        await this.session.commit();
      } else if (action === "cancel") {
        await this.session.cancel();
      }
    } catch (error) {
      await this.session.reportError(action, error);
    }
  }
}
