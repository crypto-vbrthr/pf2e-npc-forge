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
  for (const skill of npc?.skills ?? []) {
    if (!skill.slug || !Number.isFinite(skill.modifier)) errors.push("Each NPC skill requires slug and numeric modifier");
  }
  for (const ability of npc?.abilities ?? []) {
    if (!ability.id || !ability.labelKey) errors.push("Each NPC ability requires id and labelKey");
    if (!new Set(["action", "reaction", "free", "passive"]).has(ability.actionType)) errors.push(`Invalid NPC ability actionType for ${ability.id ?? "unknown"}`);
  }
  return { valid: errors.length === 0, errors, warnings };
}
