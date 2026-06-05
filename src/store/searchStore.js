import { create } from 'zustand';
import { searchProperties, getSearchSuggestions } from '../service/searchService';
import { API_URL } from '../service/api';
import { extractCityNameForApi, hasValidCoordinates } from '../utils/locationDisplay';

const getInitialRecentSearches = () => {
  try {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

const getInitialUserLocation = () => {
  try {
    const saved = localStorage.getItem('userLocation');
    return saved || 'All India';
  } catch (e) {
    return 'All India';
  }
};

const getInitialSearchLocation = () => {
  try {
    const saved = localStorage.getItem('searchLocation');
    return saved || '';
  } catch (e) {
    return '';
  }
};

const getInitialDetectedLocation = () => {
  try {
    const saved = localStorage.getItem('detectedLocation');
    return saved || null;
  } catch (e) {
    return null;
  }
};

const getInitialCoordinates = () => {
  try {
    const saved = localStorage.getItem('userCoordinates');
    return saved ? JSON.parse(saved) : { lat: null, lng: null };
  } catch (e) {
    return { lat: null, lng: null };
  }
};

export const useSearchStore = create((set, get) => ({
  // State
  activeTab: 'Buy',
  query: '',
  suggestions: [],
  defaultSuggestions: [],
  categories: [],
  cities: [],
  popularCities: [],
  initLoaded: false,
  recentSearches: getInitialRecentSearches(),
  locStatus: 'idle',
  searchStatus: 'idle',
  searchResults: [],
  searchError: null,
  location: getInitialSearchLocation(),
  userLocation: getInitialUserLocation(),
  detectedLocation: getInitialDetectedLocation(),
  coordinates: getInitialCoordinates(),
  /** Bumped on navbar location change so Home refetches dynamic-section */
  locationRevision: 0,
  propertyType: 'All Residential',
  propertyCategory: '',
  minBudget: '',
  maxBudget: '',
  bhk: [],
  furnishing: '',
  postedBy: '',
  possessionStatus: '',
  vastuCompliant: false,
  showAdvancedFilters: false,
  dynamicFilters: [],

  // Actions
  setActiveTab: (activeTab) =>
    set({
      activeTab,
      bhk: [],
      minBudget: '',
      maxBudget: '',
      propertyType: 'All Residential',
    }),

  addToRecentSearches: (searchTerm) => {
    if (!searchTerm) return;
    const existing = get().recentSearches || [];
    const updated = [searchTerm, ...existing.filter((s) => s !== searchTerm)].slice(0, 5);
    set({ recentSearches: updated });
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  },

  setLocation: (location) => {
    set({ location });
    try {
      localStorage.setItem('searchLocation', location || '');
    } catch (e) {}
    if (location) {
      const existing = get().recentSearches || [];
      const updated = [location, ...existing.filter((s) => s !== location)].slice(0, 5);
      set({ recentSearches: updated });
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    }
  },

  setUserLocation: (userLocation) => {
    set({ userLocation });
    try {
      localStorage.setItem('userLocation', userLocation);
    } catch (e) {}
  },

  setDetectedLocation: (detectedLocation) => {
    set({ detectedLocation });
    try {
      if (detectedLocation) {
        localStorage.setItem('detectedLocation', detectedLocation);
      }
    } catch (e) {}
  },

  setCoordinates: (coordinates) => {
    set({ coordinates });
    try {
      localStorage.setItem('userCoordinates', JSON.stringify(coordinates));
    } catch (e) {}
  },

  /**
   * Single update when user picks a location in the navbar.
   * Keeps city label, search city, and coordinates in sync for Home dynamic-section API.
   */
  applyNavbarLocationSelection: ({ label, coordinates = undefined }) => {
    const userLocation = label || 'All India';
    const apiCity = extractCityNameForApi(userLocation);
    const revision = (get().locationRevision || 0) + 1;

    const patch = {
      userLocation,
      location: apiCity || '',
      locationRevision: revision,
    };

    if (coordinates !== undefined) {
      patch.coordinates = hasValidCoordinates(coordinates)
        ? { lat: Number(coordinates.lat), lng: Number(coordinates.lng) }
        : { lat: null, lng: null };
    } else if (userLocation === 'All India') {
      patch.coordinates = { lat: null, lng: null };
    }

    set(patch);

    try {
      localStorage.setItem('userLocation', userLocation);
      localStorage.setItem('searchLocation', apiCity || '');
      if (patch.coordinates) {
        localStorage.setItem('userCoordinates', JSON.stringify(patch.coordinates));
      }
    } catch (e) {
      /* ignore */
    }
  },

  setQuery: (query) => {
    set({ query });
    if (!query || query.length < 2) {
      set({ suggestions: [] });
      return;
    }
    set({ locStatus: 'loading' });
  },

  clearSuggestions: () => set({ suggestions: [] }),

  setLocStatus: (locStatus) => set({ locStatus }),

  setPropertyType: (propertyType) =>
    set({
      propertyType,
      propertyCategory: propertyType === 'All Residential' ? '' : get().propertyCategory,
    }),

  setPropertyCategory: (propertyCategory) => set({ propertyCategory }),

  setMinBudget: (minBudget) => set({ minBudget }),

  setMaxBudget: (maxBudget) => set({ maxBudget }),

  toggleBhk: (val) => {
    const { bhk } = get();
    if (bhk.includes(val)) {
      set({ bhk: bhk.filter((b) => b !== val) });
    } else {
      set({ bhk: [...bhk, val] });
    }
  },

  setBhk: (bhk) => set({ bhk }),

  setFurnishing: (furnishing) => set({ furnishing }),

  setPostedBy: (postedBy) => set({ postedBy }),

  setPossessionStatus: (possessionStatus) => set({ possessionStatus }),

  setVastuCompliant: (vastuCompliant) => set({ vastuCompliant }),

  toggleAdvancedFilters: () => set({ showAdvancedFilters: !get().showAdvancedFilters }),

  setShowAdvancedFilters: (showAdvancedFilters) => set({ showAdvancedFilters }),

  /** Clears listing filters only (keeps query/location). */
  resetListingFilters: () =>
    set({
      bhk: [],
      minBudget: '',
      maxBudget: '',
      furnishing: '',
      postedBy: '',
      possessionStatus: '',
      vastuCompliant: false,
      propertyCategory: '',
      propertyType: 'All Residential',
      showAdvancedFilters: false,
    }),

  resetAllFilters: () =>
    set({
      bhk: [],
      minBudget: '',
      maxBudget: '',
      furnishing: '',
      postedBy: '',
      possessionStatus: '',
      vastuCompliant: false,
      propertyCategory: '',
      propertyType: 'All Residential',
      showAdvancedFilters: false,
      searchResults: [],
      dynamicFilters: [],
      searchError: null,
    }),

  setBudget: (minBudget) => set({ minBudget }),

  clearSearchError: () => set({ searchError: null }),

  // Async Actions
  fetchSearchSuggestions: async (query) => {
    try {
      set({ locStatus: 'loading', searchError: null });
      const response = await getSearchSuggestions(query);
      set({ suggestions: response.suggestions, locStatus: 'succeeded' });
      return response.suggestions;
    } catch (error) {
      set({ suggestions: [], locStatus: 'failed', searchError: error.message });
      throw error;
    }
  },

  fetchDefaultSuggestions: async () => {
    try {
      const response = await getSearchSuggestions('');
      set({ defaultSuggestions: response.suggestions });
      return response.suggestions;
    } catch (error) {
      console.error(error);
    }
  },

  performSearch: async (searchParams) => {
    try {
      set({ searchStatus: 'loading', searchError: null });
      const response = await searchProperties(searchParams);
      set({
        searchResults: response.data,
        dynamicFilters: response.data?.filters || [],
        searchStatus: 'succeeded',
      });
      return response;
    } catch (error) {
      set({
        searchResults: { properties: [], filters: [] },
        dynamicFilters: [],
        searchStatus: 'failed',
        searchError: error.message,
      });
      throw error;
    }
  },

  fetchSearchInitData: async () => {
    try {
      const response = await fetch(`${API_URL}/search/init`);
      const json = await response.json();
      if (!json.success) throw new Error(json.message);
      set({
        categories: json.data.categories,
        cities: json.data.cities,
        popularCities: json.data.popularCities,
        initLoaded: true,
      });
      return json.data;
    } catch (error) {
      console.error(error);
    }
  },
}));
