/** Title-case city name for display (API values unchanged for routing/search). */
export function formatCityName(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
