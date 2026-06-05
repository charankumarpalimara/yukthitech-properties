/**
 * Normalize completion % from API / list payloads (number, string, or nested).
 * Returns an integer 1–100, or null when missing / invalid.
 */
export function getCompletionPercentage(property) {
  if (!property) return null;

  const raw =
    property.completionPercentage ??
    property.completionStats?.total ??
    property.completion?.percentage ??
    null;

  if (raw == null || raw === '') return null;

  const n = typeof raw === 'number' ? raw : Number(String(raw).replace(/%/g, '').trim());

  if (!Number.isFinite(n)) return null;

  const pct = Math.round(Math.min(100, Math.max(0, n)));
  return pct > 0 ? pct : null;
}

export function shouldShowCompletionBadge(property) {
  return getCompletionPercentage(property) != null;
}
