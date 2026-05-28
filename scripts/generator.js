import { ROLES } from "./data/roles.js";
import { PROFESSIONS } from "./data/professions.js";
import { LEVEL_STATS } from "./data/level-stats.js";

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

  const items = [
    createStrikeActionItem(professionData, stats),
    ...createAbilityItems(roleData, professionData, stats, level)
  ];

  console.log("NPC Forge | Items werden erstellt:", items);

  try {
    await actor.createEmbeddedDocuments("Item", items);
  } catch (error) {
    console.error("NPC Forge | Fehler beim Erstellen der Items:", error);
    ui.notifications.error("Fehler beim Erstellen von Angriffen/Fähigkeiten. Siehe Konsole.");
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
  const loreName = professionData.lore;

  for (const skill of professionSkills) {
    skills[skill] = {
      base: stats.skill,
      value: stats.skill,
      visible: true
    };
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

function createStrikeActionItem(professionData, stats) {
  const weapon = professionData.weapon ?? {
    name: "Faust",
    damageDie: "d4",
    damageType: "bludgeoning"
  };

  const dice = stats.damageDice ?? 1;
  const die = weapon.damageDie ?? "d6";
  const bonus = stats.damageBonus ?? 0;

  const damageFormula = bonus > 0
    ? `${dice}${die}+${bonus}`
    : `${dice}${die}`;

  return {
    name: weapon.name,
    type: "action",
    system: {
      actionType: {
        value: "action"
      },
      actions: {
        value: 1
      },
      traits: {
        value: ["attack"]
      },
      description: {
        value: `
          <p><strong>Angriff</strong> +${stats.attack}</p>
          <p><strong>Schaden</strong> ${damageFormula} ${weapon.damageType ?? "bludgeoning"}</p>
        `
      },
      deathNote: false
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
    damageBonus: stats.damageBonus
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

function renderTemplateText(text, values) {
  return String(text ?? "")
    .replaceAll("{dc}", String(values.dc))
    .replaceAll("{skill}", String(values.skill))
    .replaceAll("{attack}", String(values.attack))
    .replaceAll("{level}", String(values.level))
    .replaceAll("{damageBonus}", String(values.damageBonus));
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
    "visual"
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
