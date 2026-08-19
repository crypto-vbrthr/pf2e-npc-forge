function resolvePart(part, localize = (key) => key) {
  if (!part) return "";
  if (typeof part === "string") return part;
  if (part.labelKey) {
    const localized = localize(part.labelKey);
    if (localized && localized !== part.labelKey) return localized;
  }
  return part.literal ?? part.fallback ?? part.label ?? part.id ?? "";
}

export function renderGeneratedName(nameParts, localize = (key) => key) {
  if (!nameParts) return "";
  if (nameParts.manual) return nameParts.manual;
  const given = resolvePart(nameParts.given, localize);
  const family = resolvePart(nameParts.family, localize);
  const epithet = resolvePart(nameParts.epithet, localize);
  const base = [given, family].filter(Boolean).join(" ");
  if (!epithet) return base;
  const patternKey = nameParts.epithetPatternKey ?? "NPCFORGE.Names.Pattern.Epithet";
  const pattern = localize(patternKey);
  if (pattern && pattern !== patternKey) return pattern.replace("{name}", base).replace("{epithet}", epithet);
  return `${base} ${epithet}`.trim();
}

export function fallbackGeneratedName(nameParts) {
  return renderGeneratedName(nameParts, (key) => key);
}
