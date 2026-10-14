import { deepClone } from "../engine/utils.js";
import { createEditorRequest } from "./editor-request.js";
import { NpcEditorCore } from "./npc-editor-core.js";
import { adjustNpcStat } from "./stat-adjustments.js";

const REROLL_ALIASES = Object.freeze({
  equipment: "inventory",
  spells: "spellcasting",
  social: "socialContext"
});

export const SUPPORTED_REROLL_SECTIONS = Object.freeze([
  "all",
  "identity",
  "appearance",
  "personality",
  "background",
  "biography",
  "relationships",
  "socialContext",
  "skills",
  "abilities",
  "spellcasting",
  "inventory",
  "attacks",
  "combat",
  "statistics", "attributes", "defenses"
]);

export function canonicalSection(section) {
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

// Inventory attacks and the spellbook are materializations of other generated
// sections. Never leave references to an unrelated random candidate behind.
const LOCKABLE_SECTIONS = new Set([
  "identity", "appearance", "personality", "background", "relationships",
  "socialContext", "statistics", "attributes", "defenses", "skills", "abilities", "spellcasting", "inventory", "attacks"
]);

function lockSectionId(section) {
  const canonical = canonicalSection(section);
  if (canonical === "biography") return "background";
  return canonical;
}

function spellbookItems(items = []) {
  return items.filter((item) => item?.purpose === "spellbook");
}

function regularInventory(items = []) {
  return items.filter((item) => item?.purpose !== "spellbook");
}

function synchronizeSpellbooks(npc, spellbookSource) {
  npc.inventory = [
    ...regularInventory(npc.inventory),
    ...deepClone(spellbookItems(spellbookSource?.inventory))
  ];
}

// Preserve the source weapons of locked attacks when the remaining equipment
// is regenerated. Strikes reference stable inventory IDs and must not end up
// pointing at a different newly rolled weapon.
function synchronizeAttackWeapons(npc, attackSource) {
  const sourceWeapons = new Map((attackSource?.inventory ?? []).map((item) => [item.id, item]));
  const needed = new Set((npc.attacks ?? []).map((attack) => attack.sourceWeaponId).filter(Boolean));
  const replacement = new Map([...needed].filter((id) => sourceWeapons.has(id)).map((id) => [id, deepClone(sourceWeapons.get(id))]));
  if (!replacement.size) return;
  const replacePurposes = new Set([...replacement.values()].map((item) => item.purpose).filter(Boolean));
  npc.inventory = (npc.inventory ?? []).filter((item) =>
    !replacement.has(item.id) && !(["weapon", "unarmed"].includes(item.type) && replacePurposes.has(item.purpose))
  );
  npc.inventory.unshift(...replacement.values());
}

// Equipment can be fixed while attack bonuses are regenerated; in that case
// keep candidate strike numbers but restore their weapon-facing identity.
function synchronizeAttacksToInventory(npc, original) {
  const weapons = new Map((npc.inventory ?? []).map((item) => [item.id, item]));
  const oldAttacks = new Map((original?.attacks ?? []).map((attack) => [attack.id, attack]));
  npc.attacks = (npc.attacks ?? []).map((attack) => {
    if (weapons.has(attack.sourceWeaponId)) {
      const old = oldAttacks.get(attack.id);
      if (old?.sourceWeaponId === attack.sourceWeaponId) return {
        ...attack,
        label: old.label,
        labelKey: old.labelKey,
        traits: deepClone(old.traits),
        damage: { ...deepClone(attack.damage), type: old.damage?.type ?? attack.damage?.type }
      };
      return attack;
    }
    return deepClone(oldAttacks.get(attack.id) ?? attack);
  });
}

function preserveSection(next, previous, section) {
  switch (section) {
    case "identity": {
      // Appearance is a separate reroll/lock dimension.
      const appearance = deepClone(next.identity?.appearance ?? null);
      next.identity = deepClone(previous.identity);
      if (next.identity) next.identity.appearance = appearance;
      break;
    }
    case "appearance": {
      if (next.identity) next.identity.appearance = deepClone(previous.identity?.appearance ?? null);
      break;
    }
    case "personality": next.personality = deepClone(previous.personality); break;
    case "background": next.biography = deepClone(previous.biography); break;
    case "relationships": next.relationships = deepClone(previous.relationships); break;
    case "socialContext": next.socialContext = deepClone(previous.socialContext); break;
    case "statistics": next.statistics = deepClone(previous.statistics); break; // Legacy full-stat lock
    case "attributes": next.statistics.attributes = deepClone(previous.statistics?.attributes); break;
    case "defenses": {
      for (const key of ["ac", "hp", "perception", "speed", "saves"]) {
        next.statistics[key] = deepClone(previous.statistics?.[key]);
      }
      break;
    }
    case "skills": next.skills = deepClone(previous.skills); break;
    case "abilities": next.abilities = deepClone(previous.abilities); break;
    case "spellcasting": next.spellcasting = deepClone(previous.spellcasting); break;
    case "inventory": {
      next.inventory = deepClone(regularInventory(previous.inventory ?? []));
      // Preserve the associated request/poison decisions, not just the items.
      next.integrations = deepClone(previous.integrations);
      break;
    }
    case "attacks": next.attacks = deepClone(previous.attacks); break;
    default: break;
  }
}

function withPreservedSections(candidate, previous, lockedSections = []) {
  if (!previous || !lockedSections.length) return deepClone(candidate);
  const next = deepClone(candidate);
  // Identity must be applied before Appearance, regardless of click order.
  for (const section of LOCKABLE_SECTIONS) {
    if (lockedSections.includes(section)) preserveSection(next, previous, section);
  }
  if (lockedSections.includes("attacks")) synchronizeAttackWeapons(next, previous);
  else if (lockedSections.includes("inventory")) synchronizeAttacksToInventory(next, previous);
  // A Wizard's physical spellbook must always describe the *selected*
  // spellcasting section (whether the inventory or spells were locked).
  const spellSource = lockedSections.includes("spellcasting") ? previous : candidate;
  synchronizeSpellbooks(next, spellSource);
  return next;
}

function requestId(value) {
  return typeof value === "string" ? value : value?.id ?? (value?.mode === "fixed" ? value.id : null);
}

function requestForLockedGeneration(request, previous, locks) {
  if (!previous || !locks.length) return request;
  const build = previous.build ?? {};
  const frozenCombat = locks.some((section) =>
    ["statistics", "attributes", "defenses", "skills", "abilities", "spellcasting", "inventory", "attacks"].includes(section));
  const lockedAncestry = locks.some((section) => ["identity", "appearance", "statistics", "attributes", "defenses", "inventory", "attacks"].includes(section));
  if (lockedAncestry && requestId(request.ancestry) && requestId(request.ancestry) !== previous.identity?.ancestry?.id) {
    throw new Error("The selected ancestry differs from a locked section. Unlock that section before changing ancestry.");
  }
  if (!frozenCombat) return request;
  if (typeof request.level === "number" && request.level !== build.level) {
    throw new Error("Level has changed while rules-dependent sections are locked. Unlock them first.");
  }
  for (const [field, resolved] of [
    ["classProfile", build.classProfile?.id],
    ["role", build.role?.id],
    ["professionCategory", build.professionCategory?.id],
    ["profession", build.profession?.id],
    ["classSpecialization", build.classSpecialization?.id],
    ["professionSpecialization", build.professionSpecialization?.id]
  ]) {
    if (requestId(request[field]) && requestId(request[field]) !== resolved) {
      throw new Error(`The selected ${field} differs from a locked rules-dependent section. Unlock it first.`);
    }
  }
  const fixed = resolvedRequestForReroll(request, previous);
  // Pin only build selections, never the generated name/age/gender. The
  // identity is handled by its own lock and must be free to reroll.
  fixed.identity = deepClone(request.identity);
  return fixed;
}

function mergeRerolledSection(current, candidate, section) {
  if (section === "all") return deepClone(candidate);
  const next = deepClone(current);
  if (section === "identity") {
    const previousAppearance = deepClone(current.identity?.appearance ?? null);
    next.identity = deepClone(candidate.identity);
    if (next.identity) next.identity.appearance = previousAppearance;
  }
  if (section === "appearance" && next.identity) next.identity.appearance = deepClone(candidate.identity?.appearance ?? null);
  if (section === "personality") next.personality = deepClone(candidate.personality);
  if (section === "background") {
    next.biography = deepClone(candidate.biography);
    next.relationships = deepClone(candidate.relationships);
    next.socialContext = deepClone(candidate.socialContext);
  }
  if (section === "biography") next.biography = deepClone(candidate.biography);
  if (section === "relationships") next.relationships = deepClone(candidate.relationships);
  if (section === "socialContext") next.socialContext = deepClone(candidate.socialContext);
  if (section === "statistics") next.statistics = deepClone(candidate.statistics);
  if (section === "attributes") next.statistics.attributes = deepClone(candidate.statistics.attributes);
  if (section === "defenses") for (const key of ["ac", "hp", "perception", "speed", "saves"]) next.statistics[key] = deepClone(candidate.statistics[key]);
  if (section === "skills") next.skills = deepClone(candidate.skills);
  if (section === "abilities") next.abilities = deepClone(candidate.abilities);
  if (section === "spellcasting") {
    next.spellcasting = deepClone(candidate.spellcasting);
    synchronizeSpellbooks(next, candidate);
  }
  if (section === "inventory") {
    next.inventory = deepClone(regularInventory(candidate.inventory ?? []));
    next.integrations = deepClone(candidate.integrations);
    synchronizeSpellbooks(next, current);
  }
  if (section === "attacks") next.attacks = deepClone(candidate.attacks);
  if (section === "combat") {
    next.statistics = deepClone(candidate.statistics);
    next.skills = deepClone(candidate.skills);
    next.abilities = deepClone(candidate.abilities);
    next.spellcasting = deepClone(candidate.spellcasting);
    next.inventory = deepClone(candidate.inventory);
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
      sectionLocks: capabilities.sectionLocks !== false,
      adjustStats: capabilities.adjustStats !== false,
      ...capabilities
    });
    this.createActorOptions = { ...(createActorOptions ?? {}) };
    this.destroyed = false;
    this.mountElement = null;
    this._rerollCounts = new Map();
    this._lockedSections = new Set();
    this._generationCount = 0;
    this._viewFactory = viewFactory ?? ((options) => new NpcEditorCore(options));
    this._view = null;
  }

  get value() { return this.npc ? deepClone(this.npc) : null; }
  getRequest() { return deepClone(this.request); }
  getNpc() { return this.value; }

  setRequest(request, { render = true, notify = false } = {}) {
    this.#assertActive();
    const nextRequest = createEditorRequest(request ?? {}, { registry: this.api?.registry });
    if (nextRequest.seed !== this.request.seed) this._generationCount = 0;
    this.request = nextRequest;
    if (notify) void this.#call("onRequestChange", { request: this.getRequest(), npc: this.value });
    if (render) void this.render();
    return this;
  }

  setNpc(npc, { render = true, notify = false, preserveLocks = false } = {}) {
    this.#assertActive();
    this.npc = npc ? deepClone(npc) : null;
    if (!preserveLocks) this._lockedSections.clear();
    if (notify) void this.#call("onChange", { npc: this.value, request: this.getRequest(), dirty: true, reason: "setNpc" });
    if (render) void this.render();
    return this;
  }

  getLockedSections() { return [...this._lockedSections]; }
  isSectionLocked(section) {
    const id = lockSectionId(section);
    if (id === "attributes" || id === "defenses") return this._lockedSections.has(id) || this._lockedSections.has("statistics");
    if (id === "statistics") return this._lockedSections.has("statistics") || (this._lockedSections.has("attributes") && this._lockedSections.has("defenses"));
    return this._lockedSections.has(id);
  }

  setSectionLocked(section, locked = true, { render = true } = {}) {
    this.#assertActive();
    if (!this.capabilities.sectionLocks) throw new Error("Section locking is disabled for this editor session");
    const canonical = lockSectionId(section);
    if (!LOCKABLE_SECTIONS.has(canonical)) throw new Error(`Unsupported NPC editor lock section: ${section}`);
    if (locked && !this.npc) throw new Error("Generate an NPC before locking a section");
    if (canonical === "statistics" && locked) {
      this._lockedSections.delete("attributes");
      this._lockedSections.delete("defenses");
      this._lockedSections.add("statistics");
    } else if (canonical === "attributes" || canonical === "defenses") {
      if (this._lockedSections.delete("statistics")) {
        this._lockedSections.add(canonical === "attributes" ? "defenses" : "attributes");
      }
      if (locked) this._lockedSections.add(canonical);
      else this._lockedSections.delete(canonical);
    } else {
      if (locked) this._lockedSections.add(canonical);
      else this._lockedSections.delete(canonical);
      if (canonical === "statistics") {
        this._lockedSections.delete("attributes");
        this._lockedSections.delete("defenses");
      }
    }
    if (render) void this.render();
    return this.getLockedSections();
  }

  toggleSectionLock(section, options = {}) {
    return this.setSectionLocked(section, !this.isSectionLocked(section), options);
  }

  clearSectionLocks({ render = true } = {}) {
    this.#assertActive();
    this._lockedSections.clear();
    if (render) void this.render();
    return this;
  }

  async generate() {
    this.#assertActive();
    this.request.identity = { ...(this.request.identity ?? {}), nameLocale: globalThis.game?.i18n?.lang ?? this.request.identity?.nameLocale ?? "en" };
    const previous = this.npc;
    const request = deepClone(this.request);
    // Editor generations with a fixed seed must still produce a fresh (but
    // reproducible) variant on a second click. The request itself is unchanged.
    if (request.seed != null && this._generationCount > 0) request.seed = `${request.seed}::generate:${this._generationCount}`;
    const lockedRequest = requestForLockedGeneration(request, previous, this.getLockedSections());
    const candidate = await this.engine.generate(lockedRequest);
    const next = withPreservedSections(candidate, previous, this.getLockedSections());
    const validation = this.engine.validate?.(next);
    if (validation && !validation.valid) throw new Error(`Generated NPC is invalid after locked sections: ${validation.errors?.join("; ") ?? "validation failed"}`);
    this._generationCount += 1;
    this.npc = next;
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
    if (canonical !== "all" && this.isSectionLocked(canonical)) {
      throw new Error(`Unlock the ${canonical} section before rerolling it`);
    }

    const count = (this._rerollCounts.get(canonical) ?? 0) + 1;
    this._rerollCounts.set(canonical, count);
    const baseSeed = this.npc?.generation?.seed ?? this.request.seed ?? "npc-editor";
    const request = canonical === "all"
      ? requestForLockedGeneration(deepClone(this.request), this.npc, this.getLockedSections())
      : resolvedRequestForReroll(this.request, this.npc, { rerollIdentity: canonical === "identity" });
    request.seed = `${baseSeed}::reroll:${canonical}:${count}`;
    const candidate = await this.engine.generate(request);
    const next = mergeRerolledSection(this.npc, candidate, canonical);
    // A broad reroll must not silently overwrite other locked sections.
    const covered = canonical === "statistics" ? ["statistics", "attributes", "defenses"] : [canonical];
    const preserved = this.getLockedSections().filter((locked) => !covered.includes(locked));
    for (const locked of LOCKABLE_SECTIONS) {
      if (preserved.includes(locked)) preserveSection(next, this.npc, locked);
    }
    if (this.isSectionLocked("attacks") && canonical !== "attacks") synchronizeAttackWeapons(next, this.npc);
    else if (this.isSectionLocked("inventory") && canonical !== "inventory") synchronizeAttacksToInventory(next, this.npc);
    if (canonical === "spellcasting" || canonical === "inventory" || canonical === "combat" || canonical === "all") {
      const spellSource = this.isSectionLocked("spellcasting") && canonical !== "spellcasting" ? this.npc : candidate;
      synchronizeSpellbooks(next, spellSource);
    }
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

  /**
   * Edit a single already-generated statistic without rebuilding the NPC.
   * Locks only control future generation; they never prohibit manual edits.
   * A locked statistics/skills/inventory section will also retain its edits
   * across subsequent full Generate operations.
   */
  async adjustStat(kind, key, delta, { render = true } = {}) {
    this.#assertActive();
    if (!this.capabilities.adjustStats) throw new Error("Manual statistic adjustments are disabled for this editor session");
    const adjusted = adjustNpcStat(this.npc, kind, key, delta);
    const validation = this.engine?.validate?.(adjusted);
    if (validation && !validation.valid) {
      throw new Error(`Edited NPC is invalid: ${validation.errors?.join("; ") ?? "validation failed"}`);
    }
    this.npc = adjusted;
    await this.#call("onChange", { npc: this.value, request: this.getRequest(), dirty: true, reason: "adjustStat", kind, key, delta });
    if (render) await this.render();
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
    if (!handled) {
      if (error?.message?.includes("locked") || error?.message?.includes("Unlock")) {
        globalThis.ui?.notifications?.warn?.(error.message);
      }
      console.error(`PF2E NPC Forge | Editor action ${action} failed`, error);
    }
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
