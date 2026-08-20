import { deepClone } from "../engine/utils.js";

export const DEFAULT_EDITOR_REQUEST = Object.freeze({
  level: 3,
  ancestry: "core.human",
  classProfile: "core.fighter",
  classSpecialization: null,
  professionCategory: "core.profession-category.civic",
  profession: "core.guard",
  professionSpecialization: null,
  role: "core.ordinary",
  identity: {
    name: null,
    generateName: true,
    gender: "random",
    ageCategory: "random"
  },
  appearance: {
    enabled: true,
    intensity: "medium",
    allowScars: true,
    allowAgeFeatures: true,
    allowBodyShape: true,
    allowPosture: true
  },
  personality: {
    enabled: true,
    intensity: "medium",
    allowSecrets: true
  },
  background: {
    enabled: true,
    intensity: "medium",
    allowPrivateHooks: true,
    generateRelationships: true,
    generateSocialContext: true,
    relationshipCount: null
  },
  inventory: {
    enabled: true,
    scaleFundamentalRunes: true,
    personalItems: false,
    allowPoisonedWeapons: false,
    poisonPolicy: "automatic"
  }
});

function mergeNested(base, value) {
  return { ...deepClone(base), ...(value ? deepClone(value) : {}) };
}

export function createEditorRequest(initialRequest = {}, { registry = null } = {}) {
  const initial = deepClone(initialRequest ?? {});
  const request = {
    ...deepClone(DEFAULT_EDITOR_REQUEST),
    ...initial,
    identity: mergeNested(DEFAULT_EDITOR_REQUEST.identity, initial.identity),
    appearance: mergeNested(DEFAULT_EDITOR_REQUEST.appearance, initial.appearance),
    personality: mergeNested(DEFAULT_EDITOR_REQUEST.personality, initial.personality),
    background: mergeNested(DEFAULT_EDITOR_REQUEST.background, initial.background),
    inventory: mergeNested(DEFAULT_EDITOR_REQUEST.inventory, initial.inventory)
  };

  // A host can provide only a concrete profession. Infer its category so the
  // editor's dependent profession select remains coherent on first render.
  if (initial.profession && initial.professionCategory == null && registry?.get) {
    const professionId = typeof initial.profession === "string" ? initial.profession : initial.profession?.id;
    const profession = professionId ? registry.get("professions", professionId) : null;
    if (profession?.parentId) request.professionCategory = profession.parentId;
  }

  return request;
}
