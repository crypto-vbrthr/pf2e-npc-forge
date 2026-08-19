import { MODULE_ID, SCHEMA_VERSION } from "../constants.js";
import { deepClone, slugify } from "../engine/utils.js";

const STANDARD_SKILLS = new Set([
  "acrobatics", "arcana", "athletics", "crafting", "deception", "diplomacy", "intimidation", "medicine", "nature", "occultism", "performance", "religion", "society", "stealth", "survival", "thievery"
]);


function getPack(packId) {
  return globalThis.game?.packs?.get?.(packId) ?? null;
}

async function findCompendiumDocument(reference) {
  if (!reference?.packId || !reference?.slug) return null;
  const pack = getPack(reference.packId);
  if (!pack) return null;
  const index = await pack.getIndex({ fields: ["system.slug", "type"] });
  const entry = Array.from(index ?? []).find((candidate) => (!reference.itemType || candidate.type === reference.itemType) && candidate.system?.slug === reference.slug);
  if (!entry) return null;
  return pack.getDocument(entry._id);
}

function cleanEmbeddedItemSource(source) {
  const clone = deepClone(source);
  delete clone._id;
  delete clone.folder;
  delete clone.sort;
  return clone;
}

function weaponFactsFromSource(source) {
  const system = source?.system ?? {};
  const damage = system.damage ?? {};
  return {
    name: source?.name ?? null,
    damageType: damage.damageType ?? damage.type ?? null,
    die: damage.die ?? null,
    dice: Number(damage.dice ?? 1),
    traits: [...(system.traits?.value ?? [])]
  };
}

function meleeItemFromAttack(attack, weaponFacts = null) {
  return {
    name: weaponFacts?.name ?? (attack.labelKey ? localized(attack.labelKey, attack.label) : attack.label),
    type: "melee",
    system: {
      bonus: { value: attack.modifier },
      damageRolls: {
        primary: { damage: attack.damage.formula, damageType: weaponFacts?.damageType ?? attack.damage.type }
      },
      traits: { value: [...(weaponFacts?.traits?.length ? weaponFacts.traits : (attack.traits ?? []))] },
      weaponType: { value: "melee" }
    },
    flags: { [MODULE_ID]: { generated: true, sourceWeaponId: attack.sourceWeaponId ?? null } }
  };
}


function localized(key, fallback = "") {
  if (!key || !globalThis.game?.i18n?.localize) return fallback;
  const value = globalThis.game.i18n.localize(key);
  return value && value !== key ? value : fallback;
}

function humanizeSlug(value = "") {
  return String(value).replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function actionItemFromAbility(ability) {
  const description = ability.descriptionKey ? localized(ability.descriptionKey, ability.descriptionKey).replace("{dice}", ability.parameters?.dice ?? "") : (ability.description ?? "");
  const actionType = ability.actionType === "passive" ? "passive" : ability.actionType === "reaction" ? "reaction" : ability.actionType === "free" ? "free" : "action";
  return {
    name: ability.labelKey ? localized(ability.labelKey, ability.id) : ability.id,
    type: "action",
    system: {
      actionType: { value: actionType },
      actions: { value: ability.actions ?? null },
      category: ability.actionType === "passive" ? "passive" : "offensive",
      description: { value: description },
      traits: { value: [...(ability.traits ?? [])] }
    },
    flags: { [MODULE_ID]: { generated: true, abilityId: ability.id, source: ability.source ?? null, parameters: ability.parameters ?? null } }
  };
}

function physicalItemFromInventory(item) {
  if (item.type === "unarmed") return null;
  const base = {
    name: item.labelKey ? localized(item.labelKey, item.name) : item.name,
    type: item.type === "equipment" ? "equipment" : item.type,
    system: {
      quantity: item.quantity ?? 1,
      traits: { value: [...(item.traits ?? [])], rarity: "common" }
    },
    flags: { [MODULE_ID]: { generated: true, inventoryId: item.id, purpose: item.purpose ?? null, origin: item.origin ?? null } }
  };
  if (item.type === "weapon") {
    base.system = {
      category: "simple",
      group: null,
      baseItem: null,
      damage: { dice: item.damage?.dice ?? 1, die: item.damage?.die ?? "d4", damageType: item.damage?.type ?? "bludgeoning" },
      traits: { value: [...(item.traits ?? [])], rarity: "common" },
      quantity: item.quantity ?? 1,
      equipped: { carryType: item.equipped ? "held" : "worn", handsHeld: item.handsHeld ?? (item.equipped ? 1 : 0) }
    };
  }
  return base;
}

async function physicalItemFromInventoryAsync(item) {
  if (item.type === "unarmed") return { source: null, facts: null, compendiumBacked: false };
  const document = await findCompendiumDocument(item.compendium);
  if (!document) {
    const source = physicalItemFromInventory(item);
    return { source, facts: item.type === "weapon" ? weaponFactsFromSource(source) : null, compendiumBacked: false };
  }
  const source = cleanEmbeddedItemSource(document.toObject());
  source.system ??= {};
  if ("quantity" in source.system) source.system.quantity = item.quantity ?? source.system.quantity ?? 1;
  if (item.equipped && source.type === "weapon") {
    source.system.equipped ??= {};
    source.system.equipped.carryType = "held";
    source.system.equipped.handsHeld = item.handsHeld ?? 1;
  }
  source.flags ??= {};
  source.flags[MODULE_ID] = {
    ...(source.flags[MODULE_ID] ?? {}),
    generated: true,
    inventoryId: item.id,
    purpose: item.purpose ?? null,
    origin: item.origin ?? null,
    compendiumBacked: true,
    sourcePack: item.compendium.packId,
    sourceSlug: item.compendium.slug,
    sourceUuid: document.uuid ?? null
  };
  return { source, facts: source.type === "weapon" ? weaponFactsFromSource(source) : null, compendiumBacked: true };
}

function skillSource(skills = []) {
  const result = {};
  for (const skill of skills) {
    if (!STANDARD_SKILLS.has(skill.slug)) continue;
    result[skill.slug] = { base: skill.modifier, note: "" };
  }
  return result;
}

function loreNotes(skills = []) {
  return skills
    .filter((skill) => skill.type === "lore")
    .map((skill) => `${skill.labelKey ? localized(skill.labelKey, (skill.label && skill.label !== skill.slug ? skill.label : humanizeSlug(skill.slug))) : ((skill.label && skill.label !== skill.slug ? skill.label : humanizeSlug(skill.slug)))} +${skill.modifier}`);
}

function attributeSource(attributes = {}) {
  return Object.fromEntries(["str", "dex", "con", "int", "wis", "cha"].map((ability) => [ability, { mod: Number(attributes[ability] ?? 0) }]));
}

export class Pf2eDocumentAdapter {
  constructor({ integrations = {} } = {}) { this.integrations = integrations; }

  toActorSource(npc, { folder = null } = {}) {
    const items = [];
    for (const inventoryItem of npc.inventory ?? []) {
      const source = physicalItemFromInventory(inventoryItem);
      if (source) items.push(source);
    }
    for (const attack of npc.attacks ?? []) items.push(meleeItemFromAttack(attack));
    for (const ability of npc.abilities ?? []) items.push(actionItemFromAbility(ability));

    const profession = npc.build.profession?.labelKey ? localized(npc.build.profession.labelKey, npc.build.profession?.label ?? npc.build.profession?.id ?? "NPC") : (npc.build.profession?.label ?? npc.build.profession?.id ?? "NPC");
    const classProfile = npc.build.classProfile?.labelKey ? localized(npc.build.classProfile.labelKey, npc.build.classProfile?.label ?? npc.build.classProfile?.id ?? "") : (npc.build.classProfile?.label ?? npc.build.classProfile?.id ?? "");
    const lore = loreNotes(npc.skills);
    const ancestryName = npc.identity.ancestry?.labelKey ? localized(npc.identity.ancestry.labelKey, npc.identity.ancestry?.id ?? "") : (npc.identity.ancestry?.label ?? npc.identity.ancestry?.id ?? "");
    const identityBits = [ancestryName, profession, classProfile].filter(Boolean).join(" · ");
    const publicNotes = [
      `<p><strong>${identityBits}</strong></p>`,
      `<p>${localized("NPCFORGE.Fields.Age", "Age")}: ${npc.identity.age?.years ?? "–"} · ${localized("NPCFORGE.Fields.Gender", "Gender")}: ${localized(`NPCFORGE.Identity.Gender${String(npc.identity.gender ?? "").replace(/^./, c => c.toUpperCase())}`, npc.identity.gender ?? "–")}</p>`,
      lore.length ? `<p><strong>${localized("NPCFORGE.Fields.Lore", "Lore")}:</strong> ${lore.join(", ")}</p>` : ""
    ].filter(Boolean).join("");

    return {
      name: npc.identity.name,
      type: "npc",
      folder,
      system: {
        abilities: attributeSource(npc.statistics.attributes),
        details: { level: { value: npc.build.level }, publicNotes, privateNotes: "" },
        traits: { value: [...(npc.identity.traits ?? [])], rarity: npc.identity.ancestry?.rarity ?? "common", size: { value: npc.identity.size ?? "med" }, languages: { value: [...(npc.identity.languages ?? [])] } },
        attributes: {
          ac: { value: npc.statistics.ac },
          hp: { value: npc.statistics.hp, max: npc.statistics.hp },
          speed: { value: npc.statistics.speed }
        },
        perception: { mod: npc.statistics.perception, senses: (npc.identity.senses ?? []).map((sense) => ({ type: sense === "low-light-vision" ? "lowLightVision" : sense, acuity: "precise", range: null, source: npc.identity.ancestry?.id ?? null })) },
        saves: {
          fortitude: { value: npc.statistics.saves.fortitude },
          reflex: { value: npc.statistics.saves.reflex },
          will: { value: npc.statistics.saves.will }
        },
        skills: skillSource(npc.skills)
      },
      items,
      flags: {
        [MODULE_ID]: {
          schemaVersion: SCHEMA_VERSION,
          generated: true,
          seed: npc.generation.seed,
          ancestryId: npc.identity.ancestry?.id ?? null,
          gender: npc.identity.gender ?? null,
          ageCategory: npc.identity.age?.category ?? null,
          ageYears: npc.identity.age?.years ?? null,
          classProfileId: npc.build.classProfile?.id ?? null,
          classSpecializationId: npc.build.classSpecialization?.id ?? null,
          professionId: npc.build.profession?.id ?? null,
          professionSpecializationId: npc.build.professionSpecialization?.id ?? null,
          roleId: npc.build.role?.id ?? null,
          sourceSlug: slugify(npc.identity.name),
          benchmark: npc.generation.benchmark ?? null
        }
      }
    };
  }

  async toActorSourceAsync(npc, { folder = null } = {}) {
    const source = this.toActorSource(npc, { folder });
    const abilityItems = source.items.filter((item) => item.type === "action");
    const inventoryItems = [];
    const weaponFactsById = new Map();

    for (const inventoryItem of npc.inventory ?? []) {
      const resolved = await physicalItemFromInventoryAsync(inventoryItem);
      if (!resolved.source) continue;
      inventoryItems.push(resolved.source);
      if (resolved.facts) weaponFactsById.set(inventoryItem.id, resolved.facts);
      if (resolved.compendiumBacked) source.flags[MODULE_ID].compendiumEquipment = true;
    }

    const meleeItems = (npc.attacks ?? []).map((attack) => meleeItemFromAttack(attack, weaponFactsById.get(attack.sourceWeaponId) ?? null));
    source.items = [...inventoryItems, ...meleeItems, ...abilityItems];
    return source;
  }

  async createActor(npc, options = {}) {
    const source = await this.toActorSourceAsync(npc, options);
    if (!globalThis.Actor?.create) throw new Error("Foundry Actor.create is unavailable");
    return globalThis.Actor.create(deepClone(source), { renderSheet: options.renderSheet ?? true });
  }

  async createActors(npcs, options = {}) {
    if (!Array.isArray(npcs)) throw new Error("createActors expects an array");
    if (!globalThis.Actor?.createDocuments) {
      const actors = [];
      for (const npc of npcs) actors.push(await this.createActor(npc, { ...options, renderSheet: false }));
      return actors;
    }
    const sources = [];
    for (const npc of npcs) sources.push(await this.toActorSourceAsync(npc, options));
    return globalThis.Actor.createDocuments(sources);
  }
}
