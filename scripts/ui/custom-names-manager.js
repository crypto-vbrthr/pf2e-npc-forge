import { MODULE_ID } from "../constants.js";
import { emptyCustomNameLibrary, parseNameParts } from "../custom-names/custom-name-library.js";

const TEMPLATE = `modules/${MODULE_ID}/templates/custom-names-manager.hbs`;
const COMPONENT_GROUPS = Object.freeze([
  ["male", "NPCFORGE.CustomNames.Male"],
  ["female", "NPCFORGE.CustomNames.Female"],
  ["neutral", "NPCFORGE.CustomNames.Neutral"],
  ["family", "NPCFORGE.CustomNames.Family"]
]);

const blankPair = () => ({ prefix: [], suffix: [] });
function blankPack() {
  return {
    id: "", title: "", cultureId: null, ancestryIds: ["core.human"],
    given: { male: [], female: [], neutral: [] },
    composites: { male: blankPair(), female: blankPair(), neutral: blankPair(), family: blankPair() },
    family: [], epithets: []
  };
}
function blankCulture() { return { id: "", title: "", ancestryIds: ["core.human"], automatic: false }; }

function uid() {
  return globalThis.crypto?.randomUUID?.().replaceAll("-", "").slice(0, 24)
    ?? `user${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

async function confirmChange(message) {
  const dialog = globalThis.foundry?.applications?.api?.DialogV2;
  if (dialog?.confirm) return dialog.confirm({ content: `<p>${message}</p>` });
  return globalThis.confirm?.(message) ?? false;
}

export class CustomNamesManager {
  constructor({ api } = {}) {
    this.api = api;
    this.library = api.customNames;
    this.host = null;
    this.current = null;
    this._abortController = null;
    this._renderToken = 0;
  }

  mount(host) { this.host = host; void this.render(); return this; }
  destroy() { this._abortController?.abort(); this.host = null; this._renderToken++; }

  async render() {
    if (!this.host) return;
    const token = ++this._renderToken;
    const data = this.library.list();
    const selected = this.current?.type === "culture"
      ? (data.cultures.find((value) => value.id === this.current.id) ?? blankCulture())
      : this.current?.type === "pack"
        ? (data.packs.find((value) => value.id === this.current.id) ?? blankPack())
        : null;
    const selectedAncestries = new Set(selected?.ancestryIds ?? []);
    const selectedCulture = selected?.cultureId ?? null;
    const componentGroups = selected && this.current?.type === "pack"
      ? COMPONENT_GROUPS.map(([key, labelKey]) => ({
        label: game.i18n.localize(labelKey),
        prefixField: `component_${key}_prefix`, suffixField: `component_${key}_suffix`,
        prefix: (selected.composites?.[key]?.prefix ?? []).join("\n"),
        suffix: (selected.composites?.[key]?.suffix ?? []).join("\n")
      })) : [];
    const editPack = this.current?.type === "pack" ? {
      ...selected,
      given: Object.fromEntries(["male", "female", "neutral"].map((key) => [key, (selected.given?.[key] ?? []).join("\n")])),
      family: (selected.family ?? []).join("\n"),
      epithets: (selected.epithets ?? []).join("\n")
    } : null;
    const context = {
      cultures: data.cultures, packs: data.packs,
      editCulture: this.current?.type === "culture" ? selected : null,
      editPack,
      ancestryOptions: this.library.ancestryOptions().map((item) => ({ ...item, selected: selectedAncestries.has(item.id) })),
      cultureOptions: data.cultures.map((item) => ({ ...item, selected: item.id === selectedCulture })),
      componentGroups
    };
    const renderer = globalThis.foundry?.applications?.handlebars?.renderTemplate ?? globalThis.renderTemplate;
    const html = await renderer(TEMPLATE, context);
    if (!this.host || token !== this._renderToken) return;
    this._abortController?.abort();
    this._abortController = new AbortController();
    this.host.innerHTML = html;
    this.host.addEventListener("click", (event) => void this._onClick(event), { signal: this._abortController.signal });
    this.host.querySelector("[data-custom-import]")?.addEventListener("change", (event) => void this._import(event), { signal: this._abortController.signal });
  }

  async _onClick(event) {
    const button = event.target.closest("[data-custom-action]");
    if (!button) return;
    const action = button.dataset.customAction;
    const id = button.dataset.id;
    try {
      if (action === "new-culture") this.current = { type: "culture", id: null };
      if (action === "new-pack") this.current = { type: "pack", id: null };
      if (action === "edit-culture") this.current = { type: "culture", id };
      if (action === "edit-pack") this.current = { type: "pack", id };
      if (action === "cancel") this.current = null;
      if (action === "save-culture") {
        const form = this.host.querySelector("[data-custom-culture-form]");
        const data = new FormData(form);
        await this.library.saveCulture({
          id: this.current.id || uid(),
          title: String(data.get("title") ?? ""),
          ancestryIds: data.getAll("ancestries"),
          automatic: data.has("automatic")
        });
        this.current = null;
        ui.notifications.info(game.i18n.localize("NPCFORGE.CustomNames.Saved"));
      }
      if (action === "save-pack") {
        const form = this.host.querySelector("[data-custom-pack-form]");
        const data = new FormData(form);
        const composites = {};
        for (const [key] of COMPONENT_GROUPS) composites[key] = {
          prefix: parseNameParts(data.get(`component_${key}_prefix`)),
          suffix: parseNameParts(data.get(`component_${key}_suffix`))
        };
        await this.library.savePack({
          id: this.current.id || uid(),
          title: String(data.get("title") ?? ""),
          cultureId: String(data.get("cultureId") ?? "") || null,
          ancestryIds: data.getAll("ancestries"),
          given: {
            male: parseNameParts(data.get("givenMale")),
            female: parseNameParts(data.get("givenFemale")),
            neutral: parseNameParts(data.get("givenNeutral"))
          },
          composites,
          family: parseNameParts(data.get("family")),
          epithets: parseNameParts(data.get("epithets"))
        });
        this.current = null;
        ui.notifications.info(game.i18n.localize("NPCFORGE.CustomNames.Saved"));
      }
      if (action === "delete-culture") {
        if (!await confirmChange(game.i18n.localize("NPCFORGE.CustomNames.ConfirmCultureDelete"))) return;
        await this.library.deleteCulture(id);
        this.current = null;
      }
      if (action === "delete-pack") {
        if (!await confirmChange(game.i18n.localize("NPCFORGE.CustomNames.ConfirmDelete"))) return;
        await this.library.deletePack(id);
        this.current = null;
      }
      if (action === "export") this._export();
      await this.render();
    } catch (error) {
      console.error("PF2E NPC Forge | Custom names error", error);
      ui.notifications.error(`${game.i18n.localize("NPCFORGE.CustomNames.Error")}: ${error.message}`);
    }
  }

  _export() {
    const blob = new Blob([JSON.stringify(this.library.list(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "pf2e-npc-forge-custom-names.json";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async _import(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const content = JSON.parse(await file.text());
      if (!await confirmChange(game.i18n.localize("NPCFORGE.CustomNames.ConfirmImport"))) return;
      await this.library.replace(content ?? emptyCustomNameLibrary());
      this.current = null;
      await this.render();
      ui.notifications.info(game.i18n.localize("NPCFORGE.CustomNames.Imported"));
    } catch (error) {
      console.error("PF2E NPC Forge | Custom names import error", error);
      ui.notifications.error(`${game.i18n.localize("NPCFORGE.CustomNames.Error")}: ${error.message}`);
    } finally { event.target.value = ""; }
  }
}
