/**
 * City thumbnails via Google Maps JavaScript API (Places Photos).
 * Same script/key as Navbar autocomplete — frontend only, no backend.
 *
 * Flow for search results:
 *   Autocomplete (placeId) → PlacesService.getDetails(photos) → photo.getUrl()
 */

const formatCityName = (city) =>
  String(city)
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

let placesServiceInstance = null;
const photoCache = new Map();
const pendingPhotoRequests = new Map();

const getPlacesService = () => {
  if (typeof window === 'undefined' || !window.google?.maps?.places) {
    return null;
  }
  if (!placesServiceInstance) {
    const mapEl = document.createElement('div');
    const map = new window.google.maps.Map(mapEl);
    placesServiceInstance = new window.google.maps.places.PlacesService(map);
  }
  return placesServiceInstance;
};

export function waitForGooglePlaces(timeoutMs = 10000) {
  return new Promise((resolve) => {
    const ready = () => getPlacesService();
    if (ready()) {
      resolve(ready());
      return;
    }
    const started = Date.now();
    const timer = setInterval(() => {
      const svc = ready();
      if (svc) {
        clearInterval(timer);
        resolve(svc);
      } else if (Date.now() - started >= timeoutMs) {
        clearInterval(timer);
        resolve(null);
      }
    }, 150);
  });
}

const placesStatusOk = () => window.google?.maps?.places?.PlacesServiceStatus?.OK;

const photoUrlFromPlace = (place) => {
  const photo = place?.photos?.[0];
  if (!photo?.getUrl) return null;
  try {
    return photo.getUrl({ maxWidth: 400, maxHeight: 400 });
  } catch {
    return null;
  }
};

/** Google Places Photo API (via JS SDK): getDetails + photo.getUrl */
export async function getPlacePhotoByPlaceId(placeId) {
  if (!placeId) return Promise.resolve(null);

  if (photoCache.has(placeId)) {
    return Promise.resolve(photoCache.get(placeId));
  }

  if (pendingPhotoRequests.has(placeId)) {
    return pendingPhotoRequests.get(placeId);
  }

  const promise = (async () => {
    await waitForGooglePlaces();
    const service = getPlacesService();
    if (!service) return null;

    return new Promise((resolve) => {
      service.getDetails({ placeId, fields: ['photos'] }, (place, status) => {
        const url = status === placesStatusOk() ? photoUrlFromPlace(place) : null;
        if (url) photoCache.set(placeId, url);
        resolve(url);
      });
    });
  })();

  pendingPhotoRequests.set(placeId, promise);
  try {
    return await promise;
  } finally {
    pendingPhotoRequests.delete(placeId);
  }
}

const getCityPhotoByName = async (city) => {
  if (!city) return null;

  await waitForGooglePlaces();
  const service = getPlacesService();
  if (!service) return null;

  const query = `${formatCityName(city)}, India`;
  return new Promise((resolve) => {
    service.textSearch({ query }, (results, status) => {
      if (status !== placesStatusOk() || !results?.[0]?.place_id) {
        resolve(null);
        return;
      }
      getPlacePhotoByPlaceId(results[0].place_id).then(resolve);
    });
  });
};

/**
 * Load thumbnails for location list rows (search + popular).
 * Calls onThumbnail(key, url) as each Google photo is ready.
 */
export async function prefetchLocationThumbnails(items, onThumbnail) {
  if (!items?.length || typeof onThumbnail !== 'function') return;

  await waitForGooglePlaces();

  const slice = items.slice(0, 10);
  await Promise.all(
    slice.map(async (item) => {
      const cacheKey = item.placeId || item.name;
      if (!cacheKey) return;

      if (item.placeId && photoCache.has(item.placeId)) {
        onThumbnail(cacheKey, photoCache.get(item.placeId));
        return;
      }

      const url = item.placeId
        ? await getPlacePhotoByPlaceId(item.placeId)
        : await getCityPhotoByName(item.name);

      if (url) onThumbnail(cacheKey, url);
    })
  );
}

/**
 * @param {string} city
 * @param {string} [placeId]
 */
export async function getCityImage(city, placeId = null) {
  if (placeId) return getPlacePhotoByPlaceId(placeId);
  return getCityPhotoByName(city);
}

export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export function isGooglePlaceImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('maps.googleapis.com/maps/api/place/photo') ||
    lower.includes('maps.googleapis.com/place/photo') ||
    lower.includes('googleusercontent.com') ||
    lower.includes('ggpht.com')
  );
}

export function resolveCityThumbnailUrl(city, imageCache = {}) {
  const placeId = city?.placeId;
  if (placeId && photoCache.has(placeId)) {
    return photoCache.get(placeId);
  }

  const candidates = [imageCache[placeId], imageCache[city?.name], city?.image].filter(Boolean);

  for (const raw of candidates) {
    const url = typeof raw === 'string' && raw.startsWith('http') ? raw : null;
    if (url && isGooglePlaceImageUrl(url)) return url;
  }
  return null;
}
