import { deepClone } from "../utils.js";

function scaleSneakAttack(level) {
  if (level >= 17) return "4d6";
  if (level >= 11) return "3d6";
  if (level >= 5) return "2d6";
  return "1d6";
}

function resolveAbility(registry, id, { level, classProfile, specialization }) {
  const definition = registry.get("abilityDefinitions", id);
  if (!definition) return null;
  if (Number.isInteger(definition.minLevel) && level < definition.minLevel) return null;
  if (Number.isInteger(definition.maxLevel) && level > definition.maxLevel) return null;

  const ability = deepClone(definition);
  ability.source = {
    type: specialization?.abilityIds?.includes(id) ? "classSpecialization" : "classProfile",
    id: specialization?.abilityIds?.includes(id) ? specialization.id : classProfile?.id
  };

  if (ability.scaling === "sneak-attack") {
    ability.value = scaleSneakAttack(level);
    ability.parameters = { ...(ability.parameters ?? {}), dice: ability.value };
  }
  return ability;
}

export function buildAbilities({ level, classProfile, specialization, registry }) {
  const ids = [
    ...(classProfile?.abilityIds ?? []),
    ...(specialization?.abilityIds ?? [])
  ];
  const seen = new Set();
  const abilities = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    const ability = resolveAbility(registry, id, { level, classProfile, specialization });
    if (ability) abilities.push(ability);
  }
  return abilities;
}
