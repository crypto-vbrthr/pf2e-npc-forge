export function registerCoreContent(registry) {
  const source = "pf2e-npc-forge";
  registry.register("ancestries", source, { id: "core.human", labelKey: "NPCFORGE.Content.Ancestry.Human", weight: 10 });
  registry.register("ancestries", source, { id: "core.dwarf", labelKey: "NPCFORGE.Content.Ancestry.Dwarf", weight: 5 });

  registry.register("classProfiles", source, {
    id: "core.fighter",
    labelKey: "NPCFORGE.Content.ClassProfile.Fighter",
    tags: ["martial"],
    preferredSkills: ["athletics", "intimidation"],
    weight: 10
  });

  registry.register("professionCategories", source, { id: "core.profession-category.civic", labelKey: "NPCFORGE.Content.Category.Civic", weight: 10 });
  registry.register("professionCategories", source, { id: "core.profession-category.artisan", labelKey: "NPCFORGE.Content.Category.Artisan", weight: 10 });
  registry.register("professionCategories", source, { id: "core.profession-category.criminal", labelKey: "NPCFORGE.Content.Category.Criminal", weight: 6 });

  registry.register("professions", source, {
    id: "core.guard",
    parentId: "core.profession-category.civic",
    labelKey: "NPCFORGE.Content.Profession.Guard",
    tags: ["civic", "martial", "security"],
    skillBias: { athletics: "high", society: "medium" },
    weight: 10
  });
  registry.register("professions", source, {
    id: "core.blacksmith",
    parentId: "core.profession-category.artisan",
    labelKey: "NPCFORGE.Content.Profession.Blacksmith",
    tags: ["artisan", "craft"],
    skillBias: { crafting: "high", athletics: "medium" },
    weight: 10
  });
  registry.register("professions", source, {
    id: "core.thief",
    parentId: "core.profession-category.criminal",
    labelKey: "NPCFORGE.Content.Profession.Thief",
    tags: ["criminal", "stealth"],
    skillBias: { thievery: "high", stealth: "high" },
    weight: 8
  });
  registry.register("professions", source, {
    id: "core.highwayman",
    parentId: "core.profession-category.criminal",
    labelKey: "NPCFORGE.Content.Profession.Highwayman",
    tags: ["criminal", "robber", "martial"],
    skillBias: { intimidation: "high", athletics: "medium" },
    weight: 4
  });
  registry.register("professions", source, {
    id: "core.assassin",
    parentId: "core.profession-category.criminal",
    labelKey: "NPCFORGE.Content.Profession.Assassin",
    tags: ["criminal", "assassin", "stealth"],
    skillBias: { stealth: "high", deception: "medium" },
    weight: 1
  });

  registry.register("roles", source, { id: "core.veteran", labelKey: "NPCFORGE.Content.Role.Veteran", weight: 5 });
  registry.register("roles", source, { id: "core.ordinary", labelKey: "NPCFORGE.Content.Role.Ordinary", weight: 10 });

  registry.register("namePacks", source, {
    id: "core.generic-human",
    ancestryIds: ["core.human"],
    given: ["Alden", "Mira", "Tarin", "Lysa", "Bren"],
    family: ["Miller", "Warden", "Stone", "Reed", "Vale"],
    weight: 10
  });
  registry.register("namePacks", source, {
    id: "core.generic-dwarf",
    ancestryIds: ["core.dwarf"],
    given: ["Hargun", "Dagna", "Borin", "Runa", "Keld"],
    family: ["Ironhand", "Stonehelm", "Deepdelver", "Forgeheart"],
    weight: 10
  });
}
