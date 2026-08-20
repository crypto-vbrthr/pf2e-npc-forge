export function validateNpcModel(npc) {
  const errors = [];
  const warnings = [];
  if (!npc || typeof npc !== "object") errors.push("NPC model must be an object");
  if (!npc?.identity?.name) errors.push("NPC requires identity.name");
  if (!Number.isInteger(npc?.build?.level)) errors.push("NPC requires an integer build.level");
  if (Number.isInteger(npc?.build?.level) && (npc.build.level < -1 || npc.build.level > 24)) errors.push("NPC build.level must be between -1 and 24");
  if (!npc?.build?.profession?.id) warnings.push("NPC has no resolved profession");
  if (!npc?.build?.classProfile?.id) warnings.push("NPC has no resolved class profile");

  const stats = npc?.statistics;
  if (!stats || typeof stats !== "object") errors.push("NPC requires statistics");
  for (const ability of ["str", "dex", "con", "int", "wis", "cha"]) {
    if (!Number.isFinite(stats?.attributes?.[ability])) errors.push(`NPC requires numeric statistics.attributes.${ability}`);
  }
  for (const field of ["perception", "ac", "hp", "speed"]) {
    if (!Number.isFinite(stats?.[field])) errors.push(`NPC requires numeric statistics.${field}`);
  }
  for (const save of ["fortitude", "reflex", "will"]) {
    if (!Number.isFinite(stats?.saves?.[save])) errors.push(`NPC requires numeric statistics.saves.${save}`);
  }
  if (!Array.isArray(npc?.skills)) errors.push("NPC skills must be an array");
  if (!Array.isArray(npc?.abilities)) errors.push("NPC abilities must be an array");
  if (!Array.isArray(npc?.attacks)) errors.push("NPC attacks must be an array");
  for (const attack of npc?.attacks ?? []) {
    if (!attack.id || !Number.isFinite(attack.modifier)) errors.push("Each NPC attack requires id and numeric modifier");
    if (!attack.damage?.formula || !attack.damage?.type) errors.push(`NPC attack ${attack.id ?? "unknown"} requires damage formula and type`);
    if (attack.damage?.expectedAverage != null && !Number.isFinite(attack.damage.expectedAverage)) errors.push(`NPC attack ${attack.id ?? "unknown"} has invalid expectedAverage`);
  }
  for (const skill of npc?.skills ?? []) {
    if (!skill.slug || !Number.isFinite(skill.modifier)) errors.push("Each NPC skill requires slug and numeric modifier");
  }
  for (const ability of npc?.abilities ?? []) {
    if (!ability.id || !ability.labelKey) errors.push("Each NPC ability requires id and labelKey");
    if (!new Set(["action", "reaction", "free", "passive"]).has(ability.actionType)) errors.push(`Invalid NPC ability actionType for ${ability.id ?? "unknown"}`);
  }
  for (const entry of npc.spellcasting ?? []) {
    if (!entry.tradition) errors.push("Spellcasting entry requires a tradition");
    if (!Number.isFinite(entry.dc) || !Number.isFinite(entry.attack)) errors.push("Spellcasting entry requires DC and attack modifier");
    if ((entry.spells ?? []).some((spell) => !spell.slug || !Number.isInteger(spell.rank))) errors.push("Spellcasting spells require slug and integer rank");
  }

  if (npc?.biography != null) {
    if (typeof npc.biography !== "object") errors.push("NPC biography must be an object or null");
    for (const key of ["origin", "formative", "currentSituation", "currentProblem", "privateHook"]) {
      const entry = npc.biography?.[key];
      if (entry != null && (!entry.id || !entry.category)) errors.push(`NPC biography.${key} requires id and category`);
    }
  }
  if (!Array.isArray(npc?.relationships)) errors.push("NPC relationships must be an array");
  for (const relationship of npc?.relationships ?? []) {
    if (!relationship.id || !relationship.typeId) errors.push("Each NPC relationship requires id and typeId");
    if (!relationship.reciprocalTypeId) warnings.push(`NPC relationship ${relationship.id ?? "unknown"} has no reciprocalTypeId`);
    if (relationship.target?.kind !== "unresolved-npc" && !relationship.target?.actorUuid && !relationship.target?.npcId) {
      errors.push(`NPC relationship ${relationship.id ?? "unknown"} requires an unresolved or linked target`);
    }
  }
  if (npc?.socialContext != null && typeof npc.socialContext !== "object") errors.push("NPC socialContext must be an object or null");
  return { valid: errors.length === 0, errors, warnings };
}
