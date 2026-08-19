import { deepClone } from "../engine/utils.js";

export class NpcEditorSession {
  constructor({ engine, adapter, initialRequest = {}, initialNpc = null, callbacks = {}, capabilities = {} } = {}) {
    this.engine = engine;
    this.adapter = adapter;
    this.request = deepClone(initialRequest);
    this.npc = initialNpc ? deepClone(initialNpc) : null;
    this.callbacks = callbacks;
    this.capabilities = {
      createActor: capabilities.createActor !== false,
      reroll: capabilities.reroll !== false,
      editInventory: capabilities.editInventory !== false,
      ...capabilities
    };
    this.destroyed = false;
  }

  get value() { return this.npc ? deepClone(this.npc) : null; }
  getRequest() { return deepClone(this.request); }
  getNpc() { return this.value; }

  setRequest(request) {
    this.#assertActive();
    this.request = deepClone(request ?? {});
    return this;
  }

  async generate() {
    this.#assertActive();
    this.npc = await this.engine.generate(this.request);
    await this.#call("onChange", { npc: this.value, request: this.getRequest(), dirty: true });
    return this.value;
  }

  async createActor(options = {}) {
    this.#assertActive();
    if (!this.capabilities.createActor) throw new Error("Actor creation is disabled for this editor session");
    if (!this.npc) await this.generate();
    return this.adapter.createActor(this.npc, options);
  }

  async commit() {
    this.#assertActive();
    if (!this.npc) await this.generate();
    await this.#call("onCommit", { npc: this.value, request: this.getRequest() });
    return this.value;
  }

  async cancel() {
    this.#assertActive();
    await this.#call("onCancel", {});
  }

  mount(element) {
    this.#assertActive();
    if (!(element instanceof HTMLElement)) throw new Error("mount requires an HTMLElement");
    element.dataset.npcForgeEmbedded = "true";
    element.innerHTML = `<div class="npc-forge-embedded-placeholder"><strong>PF2E NPC Forge</strong><p>Embedded editor baseline is ready. Full form controls arrive in later milestones.</p></div>`;
    this.mountElement = element;
    return this;
  }

  unmount() {
    if (this.mountElement) {
      delete this.mountElement.dataset.npcForgeEmbedded;
      this.mountElement.innerHTML = "";
    }
    this.mountElement = null;
    return this;
  }

  destroy() {
    this.unmount();
    this.destroyed = true;
  }

  #assertActive() {
    if (this.destroyed) throw new Error("NPC editor session has been destroyed");
  }

  async #call(name, payload) {
    const callback = this.callbacks?.[name];
    if (typeof callback !== "function") return;
    try { await callback(payload); }
    catch (error) { console.error(`PF2E NPC Forge | Host callback ${name} failed`, error); }
  }
}
