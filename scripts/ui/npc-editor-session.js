import { deepClone } from "../engine/utils.js";
import { createEditorRequest } from "./editor-request.js";
import { NpcEditorCore } from "./npc-editor-core.js";

const REROLL_ALIASES = Object.freeze({
  equipment: "inventory",
  spells: "spellcasting"
});

export const SUPPORTED_REROLL_SECTIONS = Object.freeze([
  "all",
  "identity",
  "appearance",
  "personality",
  "skills",
  "abilities",
  "spellcasting",
  "inventory",
  "attacks",
  "combat"
]);

function canonicalSection(section) {
  const value = String(section ?? "").trim();
  return REROLL_ALIASES[value] ?? value;
}

function resolvedRequestForReroll(request, npc, { rerollIdentity = false } = {}) {
  const next = deepClone(request ?? {});
  if (npc?.build?.level != null) next.level = npc.build.level;
  if (npc?.identity?.ancestry?.id) next.ancestry = npc.identity.ancestry.id;
  if (npc?.build?.classProfile?.id) next.classProfile = npc.build.classProfile.id;
  next.classSpecialization = npc?.build?.classSpecialization?.id ?? null;
  if (npc?.build?.professionCategory?.id) next.professionCategory = npc.build.professionCategory.id;
  if (npc?.build?.profession?.id) next.profession = npc.build.profession.id;
  next.professionSpecialization = npc?.build?.professionSpecialization?.id ?? null;
  if (npc?.build?.role?.id) next.role = npc.build.role.id;

  if (!rerollIdentity && npc?.identity) {
    next.identity = {
      ...(next.identity ?? {}),
      name: npc.identity.name ?? next.identity?.name ?? null,
      generateName: false,
      gender: npc.identity.gender ?? next.identity?.gender ?? "random",
      ageCategory: npc.identity.age?.category ?? next.identity?.ageCategory ?? "random",
      ageYears: npc.identity.age?.years ?? next.identity?.ageYears ?? null
    };
  }
  return next;
}

function mergeRerolledSection(current, candidate, section) {
  if (section === "all") return deepClone(candidate);
  const next = deepClone(current);
  if (section === "identity") next.identity = deepClone(candidate.identity);
  if (section === "appearance") next.identity.appearance = deepClone(candidate.identity?.appearance ?? null);
  if (section === "personality") next.personality = deepClone(candidate.personality);
  if (section === "skills") next.skills = deepClone(candidate.skills);
  if (section === "abilities") next.abilities = deepClone(candidate.abilities);
  if (section === "spellcasting") next.spellcasting = deepClone(candidate.spellcasting);
  if (section === "inventory") {
    next.inventory = deepClone(candidate.inventory);
    next.attacks = deepClone(candidate.attacks);
    next.integrations = deepClone(candidate.integrations);
  }
  if (section === "attacks") next.attacks = deepClone(candidate.attacks);
  if (section === "combat") {
    next.statistics = deepClone(candidate.statistics);
    next.skills = deepClone(candidate.skills);
    next.abilities = deepClone(candidate.abilities);
    next.spellcasting = deepClone(candidate.spellcasting);
    next.inventory = deepClone(candidate.inventory);
    next.attacks = deepClone(candidate.attacks);
    next.integrations = deepClone(candidate.integrations);
  }
  return next;
}

export class NpcEditorSession {
  constructor({
    api = null,
    engine,
    adapter,
    initialRequest = {},
    initialNpc = null,
    callbacks = {},
    onChange = null,
    onRequestChange = null,
    onCommit = null,
    onCancel = null,
    onActorCreated = null,
    onError = null,
    capabilities = {},
    mode = "embedded",
    actionBar = "default",
    createActorOptions = {},
    viewFactory = null
  } = {}) {
    this.api = api;
    this.engine = engine;
    this.adapter = adapter;
    this.mode = mode === "standalone" ? "standalone" : "embedded";
    this.actionBar = ["default", "host", "none"].includes(actionBar) ? actionBar : "default";
    this.request = createEditorRequest(initialRequest, { registry: api?.registry });
    this.npc = initialNpc ? deepClone(initialNpc) : null;
    this.callbacks = {
      ...callbacks,
      ...(typeof onChange === "function" ? { onChange } : {}),
      ...(typeof onRequestChange === "function" ? { onRequestChange } : {}),
      ...(typeof onCommit === "function" ? { onCommit } : {}),
      ...(typeof onCancel === "function" ? { onCancel } : {}),
      ...(typeof onActorCreated === "function" ? { onActorCreated } : {}),
      ...(typeof onError === "function" ? { onError } : {})
    };
    this.capabilities = Object.freeze({
      createActor: capabilities.createActor !== false,
      reroll: capabilities.reroll !== false,
      editInventory: capabilities.editInventory !== false,
      ...capabilities
    });
    this.createActorOptions = { ...(createActorOptions ?? {}) };
    this.destroyed = false;
    this.mountElement = null;
    this._rerollCounts = new Map();
    this._viewFactory = viewFactory ?? ((options) => new NpcEditorCore(options));
    this._view = null;
  }

  get value() { return this.npc ? deepClone(this.npc) : null; }
  getRequest() { return deepClone(this.request); }
  getNpc() { return this.value; }

  setRequest(request, { render = true, notify = false } = {}) {
    this.#assertActive();
    this.request = createEditorRequest(request ?? {}, { registry: this.api?.registry });
    if (notify) void this.#call("onRequestChange", { request: this.getRequest(), npc: this.value });
    if (render) void this.render();
    return this;
  }

  setNpc(npc, { render = true, notify = false } = {}) {
    this.#assertActive();
    this.npc = npc ? deepClone(npc) : null;
    if (notify) void this.#call("onChange", { npc: this.value, request: this.getRequest(), dirty: true, reason: "setNpc" });
    if (render) void this.render();
    return this;
  }

  async generate() {
    this.#assertActive();
    this.request.identity = { ...(this.request.identity ?? {}), nameLocale: globalThis.game?.i18n?.lang ?? this.request.identity?.nameLocale ?? "en" };
    this.npc = await this.engine.generate(this.request);
    await this.#call("onChange", { npc: this.value, request: this.getRequest(), dirty: true, reason: "generate" });
    await this.render();
    return this.value;
  }

  async rerollSection(section) {
    this.#assertActive();
    if (!this.capabilities.reroll) throw new Error("Section reroll is disabled for this editor session");
    const canonical = canonicalSection(section);
    if (!SUPPORTED_REROLL_SECTIONS.includes(canonical)) {
      throw new Error(`Unsupported NPC editor reroll section: ${section}`);
    }
    if (!this.npc) await this.generate();

    const count = (this._rerollCounts.get(canonical) ?? 0) + 1;
    this._rerollCounts.set(canonical, count);
    const baseSeed = this.npc?.generation?.seed ?? this.request.seed ?? "npc-editor";
    const request = canonical === "all"
      ? deepClone(this.request)
      : resolvedRequestForReroll(this.request, this.npc, { rerollIdentity: canonical === "identity" });
    request.seed = `${baseSeed}::reroll:${canonical}:${count}`;
    const candidate = await this.engine.generate(request);
    const next = mergeRerolledSection(this.npc, candidate, canonical);
    next.generation = {
      ...(next.generation ?? {}),
      rerolls: {
        ...(this.npc?.generation?.rerolls ?? {}),
        [canonical]: { count, seed: request.seed }
      }
    };
    const validation = this.engine.validate?.(next);
    if (validation && !validation.valid) throw new Error(`Rerolled NPC is invalid: ${validation.errors?.join("; ") ?? "validation failed"}`);
    this.npc = deepClone(next);
    await this.#call("onChange", { npc: this.value, request: this.getRequest(), dirty: true, reason: "reroll", section: canonical });
    await this.render();
    return this.value;
  }

  async createActor(options = {}) {
    this.#assertActive();
    if (!this.capabilities.createActor) throw new Error("Actor creation is disabled for this editor session");
    if (!this.npc) await this.generate();
    const actor = await this.adapter.createActor(this.npc, { ...this.createActorOptions, ...options });
    await this.#call("onActorCreated", { actor, npc: this.value, request: this.getRequest() });
    return actor;
  }

  async commit() {
    this.#assertActive();
    if (!this.npc) await this.generate();
    await this.#call("onCommit", { npc: this.value, request: this.getRequest() });
    return this.value;
  }

  async cancel() {
    this.#assertActive();
    await this.#call("onCancel", { npc: this.value, request: this.getRequest() });
  }

  mount(element) {
    this.#assertActive();
    if (!this.api) throw new Error("Embedded editor rendering requires the NPC Forge public API context");
    if (!this._view) this._view = this._viewFactory({ session: this, api: this.api, mode: this.mode, actionBar: this.actionBar });
    this._view.mount(element);
    this.mountElement = element;
    return this;
  }

  async render(options = {}) {
    this.#assertActive();
    if (this._view) await this._view.render(options);
    return this;
  }

  whenRendered() {
    return this._view?.whenRendered?.() ?? Promise.resolve();
  }

  unmount() {
    this._view?.unmount?.();
    this.mountElement = null;
    return this;
  }

  destroy() {
    if (this.destroyed) return;
    this._view?.destroy?.();
    this._view = null;
    this.mountElement = null;
    this.destroyed = true;
  }

  async reportError(action, error) {
    const handled = await this.#call("onError", { action, error, npc: this.value, request: this.getRequest() });
    if (!handled) console.error(`PF2E NPC Forge | Editor action ${action} failed`, error);
  }

  #assertActive() {
    if (this.destroyed) throw new Error("NPC editor session has been destroyed");
  }

  async #call(name, payload) {
    const callback = this.callbacks?.[name];
    if (typeof callback !== "function") return false;
    try {
      await callback(payload);
      return true;
    } catch (error) {
      console.error(`PF2E NPC Forge | Host callback ${name} failed`, error);
      return false;
    }
  }
}
