import { MODULE_ID, SCHEMA_VERSION } from "../constants.js";
import { deepClone, slugify } from "../engine/utils.js";

function meleeItemFromAttack(attack) {
  return {
    name: attack.label,
    type: "melee",
    system: {
      bonus: { value: attack.modifier },
      damageRolls: {
        primary: {
          damage: attack.damage.formula,
          damageType: attack.damage.type
        }
      },
      traits: { value: [...(attack.traits ?? [])] },
      weaponType: { value: "melee" }
    },
    flags: {
      [MODULE_ID]: {
        generated: true,
        sourceWeaponId: attack.sourceWeaponId ?? null
      }
    }
  };
}

function physicalItemFromInventory(item) {
  if (item.type !== "weapon") return null;
  return {
    name: item.name,
    type: "weapon",
    system: {
      category: "simple",
      group: null,
      baseItem: null,
      damage: {
        dice: item.damage?.dice ?? 1,
        die: item.damage?.die ?? "d4",
        damageType: item.damage?.type ?? "bludgeoning"
      },
      traits: { value: [...(item.traits ?? [])], rarity: "common" },
      quantity: 1,
      equipped: { carryType: "held", handsHeld: 1 }
    },
    flags: {
      [MODULE_ID]: {
        generated: true,
        inventoryId: item.id
      }
    }
  };
}

export class Pf2eDocumentAdapter {
  constructor({ integrations = {} } = {}) {
    this.integrations = integrations;
  }

  toActorSource(npc, { folder = null } = {}) {
    const items = [];
    for (const inventoryItem of npc.inventory ?? []) {
      const source = physicalItemFromInventory(inventoryItem);
      if (source) items.push(source);
    }
    for (const attack of npc.attacks ?? []) items.push(meleeItemFromAttack(attack));

    return {
      name: npc.identity.name,
      type: "npc",
      folder,
      system: {
        details: {
          level: { value: npc.build.level },
          publicNotes: `<p><strong>${npc.build.profession?.label ?? npc.build.profession?.id ?? "NPC"}</strong></p>`,
          privateNotes: ""
        },
        traits: {
          value: [],
          rarity: "common",
          size: { value: "med" },
          languages: { value: [] }
        },
        attributes: {
          ac: { value: npc.statistics.ac },
          hp: { value: npc.statistics.hp, max: npc.statistics.hp },
          speed: { value: npc.statistics.speed }
        },
        perception: { mod: npc.statistics.perception },
        saves: {
          fortitude: { value: npc.statistics.saves.fortitude },
          reflex: { value: npc.statistics.saves.reflex },
          will: { value: npc.statistics.saves.will }
        }
      },
      items,
      flags: {
        [MODULE_ID]: {
          schemaVersion: SCHEMA_VERSION,
          generated: true,
          seed: npc.generation.seed,
          ancestryId: npc.identity.ancestry?.id ?? null,
          classProfileId: npc.build.classProfile?.id ?? null,
          professionId: npc.build.profession?.id ?? null,
          roleId: npc.build.role?.id ?? null,
          sourceSlug: slugify(npc.identity.name)
        }
      }
    };
  }

  async createActor(npc, options = {}) {
    const source = this.toActorSource(npc, options);
    if (!globalThis.Actor?.create) throw new Error("Foundry Actor.create is unavailable");
    const actor = await globalThis.Actor.create(deepClone(source), { renderSheet: options.renderSheet ?? true });
    return actor;
  }

  async createActors(npcs, options = {}) {
    if (!Array.isArray(npcs)) throw new Error("createActors expects an array");
    if (!globalThis.Actor?.createDocuments) {
      const actors = [];
      for (const npc of npcs) actors.push(await this.createActor(npc, { ...options, renderSheet: false }));
      return actors;
    }
    const sources = npcs.map((npc) => this.toActorSource(npc, options));
    return globalThis.Actor.createDocuments(sources);
  }
}
