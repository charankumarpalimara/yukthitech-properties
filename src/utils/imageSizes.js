import { getImageUrl } from './share.js';

/** Append width/quality query params (same pattern as blog `imageBase`). */
export function withImageWidth(url, width, quality = 80) {
  if (!url || String(url).startsWith('data:')) return url || '';
  const base = String(url).trim();
  if (!base) return '';
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}w=${width}&q=${quality}`;
}

const CARD_WIDTHS = [240, 400, 560];

/** Prefer API thumb fields when present; otherwise resize poster for list cards. */
export function resolvePropertyCardImage(property, fallback) {
  const raw =
    property?.media?.posterThumb ||
    property?.media?.thumbnail ||
    property?.media?.poster ||
    property?.media?.photos?.[0] ||
    property?.img ||
    property?.coverPhoto ||
    null;

  if (!raw) return fallback || '';
  const full = getImageUrl(raw);
  return withImageWidth(full, 400) || full;
}

export function buildPropertyCardSrcSet(property) {
  const raw =
    property?.media?.posterThumb ||
    property?.media?.thumbnail ||
    property?.media?.poster ||
    property?.media?.photos?.[0] ||
    property?.img ||
    null;
  if (!raw) return undefined;
  const full = getImageUrl(raw);
  return CARD_WIDTHS.map((w) => `${withImageWidth(full, w)} ${w}w`).join(', ');
}

export const PROPERTY_CARD_SIZES = '(max-width: 480px) 45vw, (max-width: 1024px) 240px, 280px';

export function resolveCategoryImage(url, width = 224) {
  if (!url) return url;
  if (url.startsWith('/') && !url.startsWith('http')) {
    return withImageWidth(url, width);
  }
  const resolved = getImageUrl(url);
  return withImageWidth(resolved, width);
}

export function resolveCityCardImage(imagePath, width = 400) {
  if (!imagePath) return '';
  const resolved = getImageUrl(imagePath);
  return withImageWidth(resolved, width);
}
