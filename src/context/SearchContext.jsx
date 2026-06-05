import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import { preloadPropertiesPage } from '../utils/preloadRoutes';
import { useNavigate } from 'react-router-dom';
import { useSearchStore } from '../store/searchStore';
import { resolveAreaLocationFromGeocodeResults } from '../utils/locationDisplay';
import { appendBhkToSearchParams, normalizeBhkForApi } from '../utils/bhkFilter';

const SearchContext = createContext(null);

/** Last provider value — covers brief HMR gaps when context is temporarily null */
const searchContextApiRef = { current: null };

export const SearchProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isDetecting, setIsDetecting] = useState(false);

  // Grab all search state from Zustand store
  const store = useSearchStore();

  const {
    query,
    location,
    userLocation,
    detectedLocation,
    coordinates,
    locationRevision,
    propertyType,
    propertyCategory,
    minBudget,
    maxBudget,
    bhk,
    furnishing,
    postedBy,
    possessionStatus,
    vastuCompliant,
    searchStatus,
    searchError,
    searchResults,
    dynamicFilters,
    suggestions,
    categories,
    cities,
    popularCities,
    initLoaded,
    activeTab,
    showAdvancedFilters,
    recentSearches,
    defaultSuggestions,
    locStatus,
    setQuery,
    setLocation,
    setUserLocation,
    setDetectedLocation,
    setCoordinates,
    setPropertyType,
    setPropertyCategory,
    setMinBudget,
    setMaxBudget,
    setBhk,
    toggleBhk,
    setPossessionStatus,
    setVastuCompliant,
    setActiveTab,
    setFurnishing,
    setPostedBy,
    toggleAdvancedFilters,
    setShowAdvancedFilters,
    resetAllFilters,
    resetListingFilters,
    clearSuggestions,
    clearSearchError,
    fetchSearchSuggestions,
    fetchDefaultSuggestions,
    performSearch,
    fetchSearchInitData,
  } = store;

  useEffect(() => {
    if (!initLoaded) {
      fetchSearchInitData();
    }
  }, [fetchSearchInitData, initLoaded]);

  const detectUserLocation = useCallback(() => {
    if (!navigator.geolocation || !window.isSecureContext) return;

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (window.google?.maps?.Geocoder) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode(
            { location: { lat: latitude, lng: longitude }, language: 'en', region: 'IN' },
            (results, status) => {
              if (status === window.google.maps.GeocoderStatus.OK && results?.length) {
                const areaLabel = resolveAreaLocationFromGeocodeResults(results);
                if (areaLabel) {
                  setDetectedLocation(areaLabel);
                  setUserLocation(areaLabel);
                  setCoordinates({ lat: latitude, lng: longitude });
                }
              }
              setIsDetecting(false);
            }
          );
        } else {
          setIsDetecting(false);
        }
      },
      () => setIsDetecting(false)
    );
  }, [setDetectedLocation, setUserLocation, setCoordinates]);

  const convertBudgetToNumber = useCallback((budget, isMax = false) => {
    if (!budget || budget === 'No Min' || budget === 'No Max') return undefined;
    const str = budget.toString().toUpperCase();
    if (isMax && str.endsWith('+')) return undefined;
    const numericPart = parseFloat(str.replace(/[^\d.]/g, ''));
    if (isNaN(numericPart)) return undefined;
    if (str.includes('CR')) return numericPart * 10000000;
    if (str.includes('L')) return numericPart * 100000;
    if (str.includes('K')) return numericPart * 1000;
    return numericPart;
  }, []);

  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (!savedLocation || savedLocation === 'All India') {
      detectUserLocation();
    }
  }, [detectUserLocation]);

  const executeSearch = useCallback(
    (paramsOverride) => {
      const searchParams = paramsOverride || {
        search: query,
        city: location,
        propertyType: propertyType !== 'All Residential' ? propertyType : undefined,
        minPrice: minBudget ? convertBudgetToNumber(minBudget) : undefined,
        maxPrice: maxBudget ? convertBudgetToNumber(maxBudget, true) : undefined,
        bhk: bhk.length > 0 ? bhk : undefined,
      };
      return performSearch(searchParams);
    },
    [performSearch, query, location, propertyType, minBudget, maxBudget, bhk, convertBudgetToNumber]
  );

  const handleSearch = useCallback(
    (e, paramsOverride = {}) => {
      if (e?.preventDefault) e.preventDefault();

      const params = new URLSearchParams();
      const searchVal = paramsOverride.search !== undefined ? paramsOverride.search : query;
      // Only carry the stored location when the user has actively typed a query (city + keyword search),
      // or when the caller explicitly passes a city. Prevents stale "visakhapatnam" leaking into
      // category-only searches where the user typed nothing.
      const cityVal =
        paramsOverride.city !== undefined ? paramsOverride.city : searchVal ? location : '';
      const typeVal =
        paramsOverride.propertyType !== undefined
          ? paramsOverride.propertyType || undefined
          : propertyType !== 'All Residential'
            ? propertyCategory || propertyType
            : undefined;
      const typesVal =
        paramsOverride.propertyTypes !== undefined ? paramsOverride.propertyTypes : undefined;
      const bhkVal = paramsOverride.bhk !== undefined ? paramsOverride.bhk : bhk;
      const minVal = paramsOverride.minPrice !== undefined ? paramsOverride.minPrice : minBudget;
      const maxVal = paramsOverride.maxPrice !== undefined ? paramsOverride.maxPrice : maxBudget;
      const posVal =
        paramsOverride.possessionStatus !== undefined
          ? paramsOverride.possessionStatus
          : possessionStatus;
      const vastuVal =
        'vastuCompliant' in paramsOverride ? paramsOverride.vastuCompliant : vastuCompliant;
      const vastuActive = vastuVal === true || vastuVal === 'true';
      const facingVal = paramsOverride.facing !== undefined ? paramsOverride.facing : undefined;
      const minAreaVal = paramsOverride.minArea !== undefined ? paramsOverride.minArea : undefined;
      const maxAreaVal = paramsOverride.maxArea !== undefined ? paramsOverride.maxArea : undefined;
      const sortVal = paramsOverride.sortBy !== undefined ? paramsOverride.sortBy : 'newest';

      // URL keeps all filters so /properties does not drop them
      if (searchVal) params.set('search', searchVal);
      if (cityVal) params.set('city', cityVal);
      if (typeVal && typeVal !== 'All Residential') {
        params.set('propertyType', typeVal);
      }
      if (typesVal) {
        params.set('propertyTypes', Array.isArray(typesVal) ? typesVal.join(',') : typesVal);
      }
      if (bhkVal?.length > 0) {
        appendBhkToSearchParams(params, bhkVal);
      }
      const minValNum = minVal ? convertBudgetToNumber(minVal) : undefined;
      const maxValNum = maxVal ? convertBudgetToNumber(maxVal, true) : undefined;
      if (minValNum) params.set('minPrice', minValNum);
      if (maxValNum) params.set('maxPrice', maxValNum);
      if (posVal) params.set('possessionStatus', posVal);
      if (vastuActive) params.set('vastuCompliant', 'true');
      if (facingVal) params.set('facing', facingVal);
      if (minAreaVal) params.set('minArea', minAreaVal);
      if (maxAreaVal) params.set('maxArea', maxAreaVal);
      if (sortVal && sortVal !== 'newest') params.set('sortBy', sortVal);

      const currentPath = window.location.pathname;
      const currentSearch = window.location.search;
      const newSearch = `?${params.toString()}`;
      const propertiesUrl = `/properties${params.toString() ? `?${params.toString()}` : ''}`;

      const searchPayload = {
        search: searchVal || undefined,
        city: cityVal || undefined,
        propertyType: typeVal && typeVal !== 'All Residential' ? typeVal : undefined,
        propertyTypes: typesVal || paramsOverride.propertyTypes || undefined,
        bhk: bhkVal?.length > 0 ? normalizeBhkForApi(bhkVal) : undefined,
        minPrice: minVal ? convertBudgetToNumber(minVal) : undefined,
        maxPrice: maxVal ? convertBudgetToNumber(maxVal, true) : undefined,
        possessionStatus: posVal || undefined,
        vastuCompliant: vastuActive ? true : undefined,
        facing: facingVal || undefined,
        minArea: minAreaVal || undefined,
        maxArea: maxAreaVal || undefined,
        sortBy: sortVal,
      };

      if (currentPath === '/properties') {
        performSearch(searchPayload);
        if (currentSearch !== newSearch) {
          navigate(propertiesUrl, { replace: paramsOverride.history !== 'push' });
        }
      } else {
        preloadPropertiesPage();
        performSearch(searchPayload);
        navigate(propertiesUrl);
      }
    },
    [
      navigate,
      query,
      location,
      propertyType,
      propertyCategory,
      bhk,
      minBudget,
      maxBudget,
      possessionStatus,
      vastuCompliant,
      performSearch,
      convertBudgetToNumber,
    ]
  );

  const clearSearch = useCallback(() => {
    resetAllFilters();
  }, [resetAllFilters]);

  const updateQuery = useCallback((q) => setQuery(q), [setQuery]);
  const updateLocation = useCallback((l) => setLocation(l), [setLocation]);
  const updateUserLocation = useCallback((l) => setUserLocation(l), [setUserLocation]);

  const value = useMemo(
    () => ({
      query,
      location,
      userLocation,
      detectedLocation,
      coordinates,
      locationRevision,
      propertyType,
      propertyCategory,
      minBudget,
      maxBudget,
      bhk,
      furnishing,
      postedBy,
      possessionStatus,
      vastuCompliant,
      searchStatus,
      searchError,
      searchResults,
      dynamicFilters,
      suggestions,
      categories,
      cities,
      popularCities,
      activeTab,
      showAdvancedFilters,
      recentSearches,
      defaultSuggestions,
      locStatus,

      // Actions
      handleSearch,
      executeSearch,
      clearSearch,
      updateQuery,
      updateLocation,
      updateUserLocation,
      detectUserLocation,
      isDetecting,
      convertBudgetToNumber,

      // Zustand Actions exposed directly for ease of use
      setQuery,
      setLocation,
      setUserLocation,
      setDetectedLocation,
      setCoordinates,
      setPropertyType,
      setPropertyCategory,
      setMinBudget,
      setMaxBudget,
      setBhk,
      toggleBhk,
      setActiveTab,
      setFurnishing,
      setPostedBy,
      setPossessionStatus,
      setVastuCompliant,
      toggleAdvancedFilters,
      setShowAdvancedFilters,
      resetAllFilters,
      resetListingFilters,
      clearSuggestions,
      clearSearchError,
      fetchSearchSuggestions,
      fetchDefaultSuggestions,
      performSearch,
      fetchSearchInitData,
    }),
    [
      query,
      location,
      userLocation,
      detectedLocation,
      coordinates,
      locationRevision,
      propertyType,
      propertyCategory,
      minBudget,
      maxBudget,
      bhk,
      furnishing,
      postedBy,
      possessionStatus,
      vastuCompliant,
      searchStatus,
      searchError,
      searchResults,
      dynamicFilters,
      suggestions,
      categories,
      cities,
      popularCities,
      activeTab,
      showAdvancedFilters,
      recentSearches,
      defaultSuggestions,
      locStatus,
      handleSearch,
      executeSearch,
      clearSearch,
      updateQuery,
      updateLocation,
      updateUserLocation,
      detectUserLocation,
      isDetecting,
      convertBudgetToNumber,
      setQuery,
      setLocation,
      setUserLocation,
      setDetectedLocation,
      setCoordinates,
      setPropertyType,
      setPropertyCategory,
      setMinBudget,
      setMaxBudget,
      setBhk,
      toggleBhk,
      setActiveTab,
      setFurnishing,
      setPostedBy,
      setPossessionStatus,
      setVastuCompliant,
      toggleAdvancedFilters,
      setShowAdvancedFilters,
      resetAllFilters,
      resetListingFilters,
      clearSuggestions,
      clearSearchError,
      fetchSearchSuggestions,
      fetchDefaultSuggestions,
      performSearch,
      fetchSearchInitData,
    ]
  );

  searchContextApiRef.current = value;

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};

const fallbackSearchContext = {
  query: '',
  location: '',
  userLocation: 'All India',
  detectedLocation: '',
  coordinates: { lat: null, lng: null },
  locationRevision: 0,
  propertyType: 'All Residential',
  propertyCategory: '',
  minBudget: '',
  maxBudget: '',
  bhk: [],
  furnishing: [],
  postedBy: [],
  possessionStatus: '',
  vastuCompliant: false,
  searchStatus: 'idle',
  searchError: null,
  searchResults: [],
  dynamicFilters: {},
  suggestions: [],
  categories: [],
  cities: [],
  popularCities: [],
  activeTab: 'Buy',
  showAdvancedFilters: false,
  recentSearches: [],
  defaultSuggestions: [],
  locStatus: 'idle',
  isDetecting: false,
  handleSearch: () => {},
  executeSearch: () => {},
  clearSearch: () => {},
  updateQuery: () => {},
  updateLocation: () => {},
  updateUserLocation: () => {},
  detectUserLocation: () => {},
  convertBudgetToNumber: () => undefined,
  setQuery: () => {},
  setLocation: () => {},
  setUserLocation: () => {},
  setDetectedLocation: () => {},
  setCoordinates: () => {},
  setPropertyType: () => {},
  setPropertyCategory: () => {},
  setMinBudget: () => {},
  setMaxBudget: () => {},
  setBhk: () => {},
  toggleBhk: () => {},
  setActiveTab: () => {},
  setFurnishing: () => {},
  setPostedBy: () => {},
  setPossessionStatus: () => {},
  setVastuCompliant: () => {},
  toggleAdvancedFilters: () => {},
  setShowAdvancedFilters: () => {},
  resetAllFilters: () => {},
  resetListingFilters: () => {},
  clearSuggestions: () => {},
  clearSearchError: () => {},
  fetchSearchSuggestions: () => {},
  fetchDefaultSuggestions: () => {},
  performSearch: () => {},
  fetchSearchInitData: () => {},
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  const api = context ?? searchContextApiRef.current ?? fallbackSearchContext;
  return api;
};
