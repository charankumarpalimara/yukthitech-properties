import { formatCityName } from './formatCityName';

/** Street-level / plot-level fragments we should not show as the user's location */
export const isJunkLocationPart = (name) => {
  const n = String(name || '').trim();
  if (!n || n.length < 2) return true;
  if (/^[\d\s,\-+/#.]+$/i.test(n)) return true;
  if (/survey\s*(no\.?|number)?/i.test(n)) return true;
  if (/plot\s*(no\.?|number)?/i.test(n)) return true;
  if (/block\s*(no\.?|number)?/i.test(n)) return true;
  if (/\bsector\s*\d/i.test(n)) return true;
  if (/\bdoor\s*no/i.test(n)) return true;
  if (/\bh\.?\s*no\.?/i.test(n)) return true;
  if (/^opp\.?\b/i.test(n)) return true;
  if (/^near\b/i.test(n)) return true;
  if (/unnamed\s*road/i.test(n)) return true;
  if (/^unnamed\b/i.test(n)) return true;
  if (/^[A-Z0-9]{4,}\+[A-Z0-9]{2,}$/i.test(n)) return true;
  if (/^\d+[A-Za-z]?$/.test(n)) return true;
  return false;
};

const LOCATION_TOKEN_STOPWORDS = new Set([
  'india',
  'road',
  'colony',
  'nagar',
  'metro',
  'station',
  'phase',
  'block',
  'sector',
]);

const KNOWN_STATE_NAMES = new Set([
  'telangana',
  'andhra pradesh',
  'bihar',
  'karnataka',
  'maharashtra',
  'tamil nadu',
  'kerala',
  'gujarat',
  'rajasthan',
  'west bengal',
  'uttar pradesh',
  'madhya pradesh',
  'odisha',
  'punjab',
  'haryana',
  'delhi',
]);

const KNOWN_CITY_NAMES = new Set([
  'hyderabad',
  'secunderabad',
  'bengaluru',
  'bangalore',
  'chennai',
  'mumbai',
  'pune',
  'delhi',
  'kolkata',
  'visakhapatnam',
  'vijayawada',
]);

const isLikelyStatePart = (part) => {
  const lower = part.toLowerCase();
  return KNOWN_STATE_NAMES.has(lower) || lower.endsWith(' pradesh') || lower.endsWith(' nadu');
};

const isLikelyCityPart = (part) => {
  const lower = part.toLowerCase();
  return KNOWN_CITY_NAMES.has(lower);
};

/** City name only — for API params (no state / country). */
export const extractCityNameForApi = (locationLabel) => {
  if (!locationLabel || locationLabel === 'All India') return '';

  const parts = String(locationLabel)
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p && !isJunkLocationPart(p));

  if (!parts.length) return '';

  const withoutState = parts.filter((p) => {
    const lower = p.toLowerCase();
    if (lower === 'india') return false;
    if (isLikelyStatePart(p)) return false;
    return true;
  });

  if (!withoutState.length) return formatCityName(parts[0]);

  const knownCity = withoutState.find((p) => isLikelyCityPart(p));
  if (knownCity) return formatCityName(knownCity);

  if (withoutState.length > 1) {
    return formatCityName(withoutState[withoutState.length - 1]);
  }

  return formatCityName(withoutState[0]);
};

/** Tokens from selected navbar location for ranking search suggestions */
export const extractLocationContextTokens = (userLocation) => {
  if (!userLocation || userLocation === 'All India') {
    return { tokens: [], states: [], cities: [], parts: [] };
  }

  const parts = userLocation
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p && !isJunkLocationPart(p));

  const states = [];
  const cities = [];

  if (parts.length > 0) {
    const lastLower = parts[parts.length - 1].toLowerCase();
    if (isLikelyStatePart(parts[parts.length - 1])) {
      states.push(lastLower);
      if (parts.length > 1) {
        const cityCandidate = parts[parts.length - 2];
        if (isLikelyCityPart(cityCandidate)) cities.push(cityCandidate.toLowerCase());
      }
    } else if (isLikelyCityPart(parts[parts.length - 1])) {
      cities.push(lastLower);
    }
  }

  const tokens = new Set();
  parts.forEach((part) => {
    tokens.add(part.toLowerCase());
    part
      .split(/\s+/)
      .map((w) => w.toLowerCase())
      .filter((w) => w.length > 2 && !LOCATION_TOKEN_STOPWORDS.has(w))
      .forEach((w) => tokens.add(w));
  });

  return {
    tokens: [...tokens],
    states: states.filter((s) => s && s !== 'india'),
    cities: cities.filter(Boolean),
    parts: parts.map((p) => p.toLowerCase()),
  };
};

const DISTANT_STATE_PENALTIES = [
  'bihar',
  'patna',
  'gaya',
  'muzaffarpur',
  'west bengal',
  'kolkata',
  'odisha',
  'rajasthan',
  'gujarat',
  'punjab',
  'haryana',
  'uttar pradesh',
  'delhi',
  'maharashtra',
  'mumbai',
  'kerala',
  'tamil nadu',
  'chennai',
];

const getGeocodeComponent = (components, type) => {
  const match = (components || []).find((c) => c.types?.includes(type));
  return match?.long_name?.trim() || '';
};

const AREA_COMPONENT_PRIORITY = [
  'sublocality_level_1',
  'sublocality',
  'sublocality_level_2',
  'neighborhood',
  'administrative_area_level_3',
  'postal_town',
];

/** Build "Area, City, State" from a Google Geocoder result (no street / survey text). */
export const extractReadableLocationFromGeocode = (result) => {
  const components = result?.address_components || [];

  let area = '';
  for (const type of AREA_COMPONENT_PRIORITY) {
    const name = getGeocodeComponent(components, type);
    if (name && !isJunkLocationPart(name)) {
      area = name;
      break;
    }
  }

  const city =
    getGeocodeComponent(components, 'locality') ||
    getGeocodeComponent(components, 'administrative_area_level_2');
  const state = getGeocodeComponent(components, 'administrative_area_level_1');

  const parts = [];
  if (area && area.toLowerCase() !== city.toLowerCase()) {
    parts.push(formatCityName(area));
  }
  if (city) parts.push(formatCityName(city));

  if (parts.length > 0) {
    return toAreaCityDisplay(parts.join(', '));
  }

  const segments = (result?.formatted_address || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s && !isJunkLocationPart(s));

  return toAreaCityDisplay(segments.join(', '));
};

/** Prefer a geocode hit that has a proper locality / sublocality name. */
export const resolveAreaLocationFromGeocodeResults = (results) => {
  if (!results?.length) return '';

  for (const result of results) {
    const label = extractReadableLocationFromGeocode(result);
    const first = label.split(',')[0]?.trim();
    if (first && !isJunkLocationPart(first)) return label;
  }

  return extractReadableLocationFromGeocode(results[0]);
};

/** Label when user picks from search / popular list (area + city, not full street address). */
export const buildSelectedLocationLabel = (city) => {
  const area = formatCityName(city?.name);
  const secondary = city?.state || '';
  const full = city?.fullName || '';

  if (!area) {
    return toAreaCityDisplay(full);
  }

  const combined = [area, secondary, full].filter(Boolean).join(', ');
  return toAreaCityDisplay(combined);
};

/**
 * Navbar / UI display: locality + city only (e.g. "Kukatpally, Hyderabad").
 * Strips state, country, and street-level junk from stored or geocoded labels.
 */
export const toAreaCityDisplay = (loc) => {
  if (!loc || loc === 'All India') return loc || 'All India';

  const parts = String(loc)
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p && !isJunkLocationPart(p) && p.toLowerCase() !== 'india')
    .map((p) => formatCityName(p))
    .filter((p) => p && !isLikelyStatePart(p));

  if (!parts.length) {
    const fallback = formatCityName(String(loc).split(',')[0]);
    return fallback || 'All India';
  }
  if (parts.length === 1) return parts[0];

  const cityIndex = parts.findIndex((p) => isLikelyCityPart(p));
  if (cityIndex >= 0) {
    const city = parts[cityIndex];
    const areaCandidates = parts
      .slice(0, cityIndex)
      .filter((p) => p.toLowerCase() !== city.toLowerCase());
    const area = areaCandidates[areaCandidates.length - 1] || '';
    if (area) return `${area}, ${city}`;
    return city;
  }

  const city = parts[parts.length - 1];
  const area = parts.length > 1 ? parts[0] : '';
  if (area && area.toLowerCase() !== city.toLowerCase()) {
    return `${area}, ${city}`;
  }
  return city;
};

export const formatUserLocationDisplay = toAreaCityDisplay;

const normalizeLocKey = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

/** Tighter radius so partial searches prefer localities near the user (e.g. KPHB / Bhagya Nagar) */
export const LOCATION_AUTOCOMPLETE_BIAS_RADIUS_M = 25000;

export const hasValidCoordinates = (coords) => {
  const lat = Number(coords?.lat);
  const lng = Number(coords?.lng);
  return Number.isFinite(lat) && Number.isFinite(lng);
};

/** Resolve lat/lng for a navbar location pick (popular city, autocomplete, etc.). */
export const fetchCoordsForCitySelection = (city) =>
  new Promise((resolve) => {
    if (!city) {
      resolve(null);
      return;
    }

    if (hasValidCoordinates(city)) {
      resolve({ lat: Number(city.lat), lng: Number(city.lng) });
      return;
    }

    if (typeof window === 'undefined' || !window.google?.maps) {
      resolve(null);
      return;
    }

    if (city.placeId && window.google.maps.places) {
      const map = new window.google.maps.Map(document.createElement('div'));
      const placesService = new window.google.maps.places.PlacesService(map);
      placesService.getDetails({ placeId: city.placeId, fields: ['geometry'] }, (place, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          place?.geometry?.location
        ) {
          resolve({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });
        } else {
          resolve(null);
        }
      });
      return;
    }

    if (window.google.maps.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: city.fullName || city.name, region: 'IN' }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK && results?.[0]?.geometry?.location) {
          resolve({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          });
        } else {
          resolve(null);
        }
      });
      return;
    }

    resolve(null);
  });

/** Bias Google Places autocomplete toward user's area (search only; not a hard filter). */
export const buildPlacesAutocompleteBias = ({ coordinates, biasPoint, userLocation } = {}) => {
  if (!userLocation || userLocation === 'All India') return null;

  const point = hasValidCoordinates(coordinates)
    ? { lat: Number(coordinates.lat), lng: Number(coordinates.lng) }
    : hasValidCoordinates(biasPoint)
      ? { lat: Number(biasPoint.lat), lng: Number(biasPoint.lng) }
      : null;

  if (!point) return null;

  return { location: point, radius: LOCATION_AUTOCOMPLETE_BIAS_RADIUS_M };
};

/** SDK AutocompleteService expects google.maps.LatLng for location bias. */
export const buildAutocompleteSdkRequest = (input, bias, googleMaps) => {
  const trimmed = String(input || '').trim();
  if (trimmed.length < 2) return null;

  const request = {
    input: trimmed,
    componentRestrictions: { country: 'in' },
  };

  if (bias?.location && googleMaps?.LatLng) {
    const { lat, lng } = bias.location;
    const point = new googleMaps.LatLng(lat, lng);
    request.location = point;
    request.origin = point;
    request.radius = bias.radius ?? LOCATION_AUTOCOMPLETE_BIAS_RADIUS_M;
  }

  return request;
};

export const buildAutocompleteFetchParams = (input, apiKey, bias) => {
  const trimmed = String(input || '').trim();
  if (trimmed.length < 2 || !apiKey) return null;

  const params = new URLSearchParams({
    input: trimmed,
    components: 'country:in',
    key: apiKey,
  });

  if (bias?.location) {
    const { lat, lng } = bias.location;
    const origin = `${lat},${lng}`;
    params.set('location', origin);
    params.set('origin', origin);
    params.set('radius', String(bias.radius ?? LOCATION_AUTOCOMPLETE_BIAS_RADIUS_M));
  }

  return params;
};

export const parsePlacePredictions = (predictions) => {
  const distinctPlaces = new Map();

  (predictions || []).forEach((p) => {
    const mainText = p.structured_formatting?.main_text || p.terms?.[0]?.value || p.description;
    const secondaryText = p.structured_formatting?.secondary_text || '';
    const key = p.place_id || p.description;

    if (mainText && !distinctPlaces.has(key)) {
      distinctPlaces.set(key, {
        name: mainText,
        state: secondaryText,
        fullName: p.description,
        placeId: p.place_id,
        importance: 1,
        distanceMeters: typeof p.distance_meters === 'number' ? p.distance_meters : null,
      });
    }
  });

  return Array.from(distinctPlaces.values());
};

/**
 * After Google returns matches, prefer same city/state/area as selected location
 * (e.g. Bhagya Nagar near KPHB, not Bhagya Nagar in Bihar).
 */
export const rankLocationSuggestions = (items, searchQuery, context = {}) => {
  if (!items?.length) return [];

  const query = String(searchQuery || '')
    .trim()
    .toLowerCase();
  const queryTokens = query.split(/\s+/).filter((t) => t.length > 1);
  const locContext = extractLocationContextTokens(context.userLocation);
  const bias = buildPlacesAutocompleteBias(context);
  const hasLocalBias = Boolean(bias?.location);

  const scored = items.map((item, index) => {
    let score = 1000 - index;
    const name = (item.name || '').toLowerCase();
    const haystack = `${item.name} ${item.state} ${item.fullName}`.toLowerCase();

    if (query) {
      if (name.startsWith(query)) score += 120;
      else if (name.includes(query)) score += 80;
      else if (haystack.includes(query)) score += 50;

      queryTokens.forEach((token) => {
        if (name.includes(token)) score += 35;
        else if (haystack.includes(token)) score += 20;
      });
    }

    locContext.cities.forEach((city) => {
      if (city && haystack.includes(city)) score += 150;
    });

    locContext.states.forEach((state) => {
      if (state && haystack.includes(state)) score += 100;
    });

    locContext.parts.forEach((part) => {
      if (part.length >= 4 && haystack.includes(part)) score += 90;
    });

    locContext.tokens.forEach((token) => {
      if (token.length >= 3 && haystack.includes(token)) score += 45;
    });

    if (typeof item.distanceMeters === 'number') {
      score += Math.max(0, 200 - item.distanceMeters / 250);
    }

    if (hasLocalBias && locContext.states.length === 0) {
      const { lat, lng } = bias.location;
      const inTelanganaRegion = lat >= 15.5 && lat <= 20.5 && lng >= 77 && lng <= 81.5;
      if (inTelanganaRegion) {
        DISTANT_STATE_PENALTIES.forEach((region) => {
          if (haystack.includes(region)) score -= 220;
        });
        if (haystack.includes('telangana') || haystack.includes('hyderabad')) score += 100;
      }
    }

    if (locContext.states.length > 0) {
      const userState = locContext.states[0];
      DISTANT_STATE_PENALTIES.forEach((region) => {
        if (region !== userState && haystack.includes(region)) score -= 200;
      });
      if (haystack.includes(userState)) score += 80;
    }

    return { item, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item)
    .slice(0, 10);
};

export const locationsMatch = (a, b) => {
  const ka = normalizeLocKey(a);
  const kb = normalizeLocKey(b);
  if (!ka || !kb) return false;
  if (ka === kb) return true;

  const pa = ka.split(',')[0];
  const pb = kb.split(',')[0];
  if (pa && pb && pa === pb) return true;

  return ka.includes(kb) || kb.includes(ka);
};
