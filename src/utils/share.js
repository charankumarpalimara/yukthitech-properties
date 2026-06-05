import { API_URL } from '../service/api.js';
import { usePropertiesStore } from '../store/propertiesStore';
import { slugOrId } from './slugOrId.js';

/**
 * getImageUrl — Returns a full image URL
 */
export function getImageUrl(imagePath) {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const baseUrl = API_URL.replace('/api/website', '');
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${path}`;
}

const DEFAULT_PROPERTY_IMAGE =
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=700&q=80';

export function resolvePropertyImage(property, fallback = DEFAULT_PROPERTY_IMAGE) {
  const raw =
    property?.media?.poster ||
    property?.media?.photos?.[0] ||
    property?.img ||
    property?.coverPhoto ||
    null;

  if (!raw) return fallback;
  const url = getImageUrl(raw);
  return url || fallback;
}

export function getPropertyShareUrl(property) {
  const segment = slugOrId(property);
  if (!segment) return window.location.href;
  return `${window.location.origin}/property/${segment}`;
}

/** @deprecated Use usePropertiesStore.getState().recordShare */
export async function recordPropertyShare(property) {
  return usePropertiesStore.getState().recordShare(property);
}

/** @deprecated Use usePropertiesStore.getState().shareProperty */
export async function shareProperty(property, setCopied) {
  return usePropertiesStore.getState().shareProperty(property, { onCopied: setCopied });
}
