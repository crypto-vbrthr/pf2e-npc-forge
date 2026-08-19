export function validateNpcModel(npc) {
  const errors = [];
  const warnings = [];
  if (!npc || typeof npc !== "object") errors.push("NPC model must be an object");
  if (!npc?.identity?.name) errors.push("NPC requires identity.name");
  if (!Number.isInteger(npc?.build?.level)) errors.push("NPC requires an integer build.level");
  if (!npc?.build?.profession?.id) warnings.push("NPC has no resolved profession");
  if (!npc?.build?.classProfile?.id) warnings.push("NPC has no resolved class profile");
  return { valid: errors.length === 0, errors, warnings };
}
