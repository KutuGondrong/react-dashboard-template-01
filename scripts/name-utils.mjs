/** Shared name normalization for make feature / make generate. */

export function splitFeatureNameParts(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  const normalized = trimmed.replace(/[\s_]+/g, '-');
  if (normalized.includes('-')) {
    return normalized
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '')
      .split('-')
      .filter(Boolean);
  }

  const camelParts = trimmed.replace(/[^a-zA-Z0-9]/g, '').match(/[A-Z]?[a-z0-9]+/g);
  if (camelParts?.length) {
    return camelParts.map((part) => part.toLowerCase());
  }

  return [];
}

export function parseFeatureName(raw) {
  const parts = splitFeatureNameParts(raw);

  if (parts.length === 0) {
    throw new Error('Feature name is required, e.g. products, my-feature, or multiWord');
  }

  const kebab = parts.join('-');
  const pascal = parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  const camel =
    parts[0] +
    parts
      .slice(1)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  return { kebab, pascal, camel, parts };
}

/** Folder / package name — e.g. "my new app" → my-new-app */
export function normalizeAppFolderName(raw) {
  const normalized = raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  if (!normalized) {
    throw new Error('App name is required, e.g. my-new-app');
  }

  return normalized;
}
