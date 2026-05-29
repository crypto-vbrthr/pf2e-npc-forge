import { ROLES } from "./data/roles.js";
import { PROFESSIONS } from "./data/professions.js";
import { LEVEL_STATS } from "./data/level-stats.js";
import { SPELLCASTING_PROFILES } from "./data/spellcasting.js";

export async function createGeneratedNpc({ name, level, role, profession }) {
  const roleData = ROLES[role];
  const professionData = PROFESSIONS[profession];

  if (!roleData) {
    ui.notifications.error(`Unbekannte Rolle: ${role}`);
    return;
  }

  if (!professionData) {
    ui.notifications.error(`Unbekannter Beruf: ${profession}`);
    return;
  }

  const stats = buildStats(level, roleData);
  const skills = buildSkills(professionData, stats);

  const actorData = {
    name: name || "NSC",
    type: "npc",
    system: {
      details: {
        level: { value: Number(level) },
        publicNotes: `${professionData.label}, ${roleData.label}, Stufe ${level}`
      },

      traits: {
        value: ["humanoid"],
        rarity: "common"
      },

      attributes: {
        ac: { value: stats.ac },
        hp: {
          value: stats.hp,
          max: stats.hp
        },
        speed: { value: 25 }
      },

      perception: {
        mod: stats.perception
      },

      saves: {
        fortitude: { value: stats.fortitude },
        reflex: { value: stats.reflex },
        will: { value: stats.will }
      },

      skills
    }
  };

  const actor = await Actor.create(actorData);
  const equipmentItems = await createEquipmentItemsFromCompendia(professionData);

  const items = [
    createStrikeItem(professionData, stats),
    ...createAbilityItems(roleData, professionData, stats, level),
    ...createSpellcastingItems(professionData, stats, level),
    ...equipmentItems
  ];

  console.log("NPC Forge | Items werden erstellt:", items);

  try {
    await actor.createEmbeddedDocuments("Item", items);
  } catch (error) {
    console.error("NPC Forge | Fehler beim Erstellen der Items:", error);
    ui.notifications.error("Fehler beim Erstellen von Angriffen/Fähigkeiten/Ausrüstung. Siehe Konsole.");
  }

  actor.sheet.render(true);
  ui.notifications.info(`${actor.name} wurde erstellt.`);
}

function buildStats(level, roleData) {
  return {
    ac: resolveLevelStat(level, "ac", roleData.ac),
    hp: resolveLevelStat(level, "hp", roleData.hp),

    attack: resolveLevelStat(level, "attack", roleData.attack),
    damageDice: resolveLevelStat(level, "damageDice", roleData.damage),
    damageBonus: resolveLevelStat(level, "damageBonus", roleData.damage),

    perception: resolveLevelStat(level, "perception", roleData.perception),

    fortitude: resolveLevelStat(level, "save", roleData.fortitude),
    reflex: resolveLevelStat(level, "save", roleData.reflex),
    will: resolveLevelStat(level, "save", roleData.will),

    dc: resolveLevelStat(level, "dc", roleData.dc ?? "moderate"),
    skill: resolveLevelStat(level, "skill", roleData.skill ?? "moderate")
  };
}

function resolveLevelStat(level, statType, quality) {
  const normalizedLevel = String(level);
  const levelData = LEVEL_STATS[normalizedLevel];

  if (!levelData) {
    throw new Error(`Keine Stufenwerte für Stufe ${normalizedLevel} gefunden.`);
  }

  const statBlock = levelData[statType];

  if (!statBlock) {
    throw new Error(`Stat-Typ "${statType}" existiert nicht für Stufe ${normalizedLevel}.`);
  }

  const value = statBlock[quality];

  if (value === undefined) {
    throw new Error(
      `Qualität "${quality}" existiert nicht für "${statType}" auf Stufe ${normalizedLevel}.`
    );
  }

  return value;
}

function buildSkills(professionData, stats) {
  const skills = {};

  const professionSkills = professionData.skills ?? [];
  const spellcasting = professionData.spellcasting;
  const loreName = professionData.lore;

  for (const skill of professionSkills) {
    skills[skill] = {
      base: stats.skill,
      value: stats.skill,
      visible: true
    };
  }

  if (spellcasting) {
    const profile = SPELLCASTING_PROFILES[spellcasting.profile];

    if (profile?.skill && !skills[profile.skill]) {
      skills[profile.skill] = {
        base: stats.skill,
        value: stats.skill,
        visible: true
      };
    }
  }

  if (loreName) {
    const slug = slugify(loreName);

    skills[slug] = {
      base: stats.skill,
      value: stats.skill,
      visible: true,
      lore: true,
      label: loreName
    };
  }

  return skills;
}

function createStrikeItem(professionData, stats) {
  const weapon = professionData.weapon ?? {
    name: "Faust",
    kind: "melee",
    damageDie: "d4",
    damageType: "bludgeoning",
    traits: ["agile", "nonlethal", "unarmed"],
    group: "brawling"
  };

  const dice = stats.damageDice ?? 1;
  const die = weapon.damageDie ?? "d6";
  const bonus = stats.damageBonus ?? 0;

  const damageFormula = bonus > 0
    ? `${dice}${die}+${bonus}`
    : `${dice}${die}`;

  const isRanged = weapon.kind === "ranged";

  return {
    name: weapon.name,
    type: "melee",
    system: {
      description: {
        value: ""
      },

      traits: {
        value: filterWeaponTraits(weapon.traits ?? []),
        rarity: "common"
      },

      weaponType: {
        value: isRanged ? "ranged" : "melee"
      },

      group: {
        value: weapon.group ?? "club"
      },

      bonus: {
        value: stats.attack
      },

      damageRolls: {
        main: {
          damage: damageFormula,
          damageType: weapon.damageType ?? "bludgeoning"
        }
      },

      attackEffects: {
        value: []
      },

      range: {
        value: isRanged ? weapon.range ?? 30 : null
      }
    }
  };
}

function createAbilityItems(roleData, professionData, stats, level) {
  const abilities = [
    ...(roleData.abilities ?? []),
    ...(professionData.abilities ?? [])
  ];

  if (abilities.length === 0) {
    abilities.push({
      name: "Improvisierte Handlung",
      actions: 1,
      traits: [],
      text: "Der NSC nutzt eine einfache situationsabhängige Handlung."
    });
  }

  return abilities.map((ability) => createAbilityItem(ability, stats, level));
}

function createAbilityItem(ability, stats, level) {
  const text = renderTemplateText(ability.text, {
    dc: stats.dc,
    skill: stats.skill,
    attack: stats.attack,
    level: Number(level),
    damageBonus: stats.damageBonus,
    spellDamage: calculateSpellDamage(stats, level),
    spellHealing: calculateSpellHealing(stats, level)
  });

  return {
    name: ability.name,
    type: "action",
    system: {
      actionType: {
        value: ability.actionType ?? "action"
      },
      actions: {
        value: ability.actions ?? 1
      },
      description: {
        value: `<p>${text}</p>`
      },
      traits: {
        value: filterAbilityTraits(ability.traits ?? [])
      },
      deathNote: false
    }
  };
}

function createSpellcastingItems(professionData, stats, level) {
  const spellcasting = professionData.spellcasting;

  if (!spellcasting) return [];

  const profile = SPELLCASTING_PROFILES[spellcasting.profile];

  if (!profile) {
    console.warn(`NPC Forge | Unbekanntes Spellcasting-Profil: ${spellcasting.profile}`);
    return [];
  }

  const items = [];

  items.push(createSpellAttackItem(spellcasting, profile, stats, level));

  for (const spell of spellcasting.spells ?? []) {
    items.push(createSpellActionItem(spell, profile, stats, level));
  }

  return items;
}

function createSpellAttackItem(spellcasting, profile, stats, level) {
  const spellDamage = calculateSpellDamage(stats, level);

  return {
    name: spellcasting.attackName ?? `${profile.label}er Angriff`,
    type: "action",
    system: {
      actionType: {
        value: "action"
      },
      actions: {
        value: 2
      },
      description: {
        value: `
          <p><strong>Zauberangriff</strong> +${stats.attack}</p>
          <p><strong>Schaden</strong> ${spellDamage} ${spellcasting.damageType ?? "force"}</p>
          <p><strong>Zauber-SG</strong> ${stats.dc}</p>
        `
      },
      traits: {
        value: filterAbilityTraits(profile.traits ?? [])
      },
      deathNote: false
    }
  };
}

function createSpellActionItem(spell, profile, stats, level) {
  const text = renderTemplateText(spell.text, {
    dc: stats.dc,
    skill: stats.skill,
    attack: stats.attack,
    level: Number(level),
    damageBonus: stats.damageBonus,
    spellDamage: calculateSpellDamage(stats, level),
    spellHealing: calculateSpellHealing(stats, level)
  });

  const traits = [
    ...(profile.traits ?? []),
    ...(spell.traits ?? [])
  ];

  return {
    name: spell.name,
    type: "action",
    system: {
      actionType: {
        value: spell.actionType ?? "action"
      },
      actions: {
        value: spell.actions ?? 2
      },
      description: {
        value: `<p>${text}</p>`
      },
      traits: {
        value: filterAbilityTraits(traits)
      },
      deathNote: false
    }
  };
}

async function createEquipmentItemsFromCompendia(professionData) {
  const equipment = professionData.equipment ?? {};
  const items = [];

  for (const entry of equipment.compendiumItems ?? []) {
    const item = await findCompendiumItem(entry);

    if (item) {
      const source = item.toObject();

      source.system ??= {};
      source.system.quantity = entry.quantity ?? 1;

      items.push(source);
    } else {
      console.warn("NPC Forge | Kompendium-Item nicht gefunden:", entry);

      items.push(
        createSimpleLootItem(
          entry.name ?? entry.slug ?? "Unbekannter Gegenstand",
          entry.quantity ?? 1
        )
      );
    }
  }

  for (const loot of equipment.fallbackLoot ?? []) {
    items.push(createSimpleLootItem(loot.name, loot.quantity ?? 1));
  }

  return items;
}

async function findCompendiumItem(entry) {
  const pack = game.packs.get(entry.pack);

  if (!pack) {
    console.warn(`NPC Forge | Pack nicht gefunden: ${entry.pack}`);
    return null;
  }

  const index = await pack.getIndex({
    fields: ["name", "type", "system.slug"]
  });

  const match = index.find((i) => {
    if (entry.uuid && i.uuid === entry.uuid) return true;
    if (entry.slug && i.system?.slug === entry.slug) return true;
    if (entry.name && i.name === entry.name) return true;
    return false;
  });

  if (!match) return null;

  return await pack.getDocument(match._id);
}

function createSimpleLootItem(name, quantity = 1) {
  return {
    name,
    type: "treasure",
    system: {
      quantity,
      description: {
        value: ""
      }
    }
  };
}

function calculateSpellDamage(stats, level) {
  const dice = Math.max(1, Math.ceil(Number(level) / 2));
  const bonus = stats.damageBonus ?? 0;

  return `${dice}d6+${bonus}`;
}

function calculateSpellHealing(stats, level) {
  const dice = Math.max(1, Math.ceil(Number(level) / 2));
  const bonus = stats.damageBonus ?? 0;

  return `${dice}d8+${bonus}`;
}

function renderTemplateText(text, values) {
  return String(text ?? "")
    .replaceAll("{dc}", String(values.dc))
    .replaceAll("{skill}", String(values.skill))
    .replaceAll("{attack}", String(values.attack))
    .replaceAll("{level}", String(values.level))
    .replaceAll("{damageBonus}", String(values.damageBonus))
    .replaceAll("{spellDamage}", String(values.spellDamage))
    .replaceAll("{spellHealing}", String(values.spellHealing));
}

function filterAbilityTraits(traits) {
  const allowed = new Set([
    "attack",
    "auditory",
    "concentrate",
    "emotion",
    "exploration",
    "fear",
    "healing",
    "incapacitation",
    "linguistic",
    "magical",
    "manipulate",
    "mental",
    "move",
    "visual",

    "arcane",
    "divine",
    "occult",
    "primal",

    "force",
    "spirit",
    "fire",
    "cold",
    "electricity",
    "acid",
    "void",
    "vitality"
  ]);

  return traits.filter((trait) => allowed.has(trait));
}

function filterWeaponTraits(traits) {
  const allowed = new Set([
    "agile",
    "backswing",
    "backstabber",
    "deadly-d6",
    "deadly-d8",
    "deadly-d10",
    "deadly-d12",
    "disarm",
    "finesse",
    "forceful",
    "free-hand",
    "grapple",
    "jousting-d6",
    "nonlethal",
    "parry",
    "propulsive",
    "reach",
    "shove",
    "sweep",
    "thrown-10",
    "thrown-20",
    "thrown-30",
    "trip",
    "two-hand-d6",
    "two-hand-d8",
    "two-hand-d10",
    "two-hand-d12",
    "unarmed",
    "versatile-b",
    "versatile-p",
    "versatile-s"
  ]);

  return traits.filter((trait) => allowed.has(trait));
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
