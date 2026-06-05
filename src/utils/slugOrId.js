/**
 * Prefer SEO slug; fall back to MongoDB id for routes and API params.
 */
export function slugOrId(entity) {
  if (!entity) return '';
  return entity.slug || entity._id || entity.id || '';
}
