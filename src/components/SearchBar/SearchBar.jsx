import { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import './SearchBar.css';
import { SearchIco, PinIco, LocIco, IconFlats, CloseIco, GpsIco } from '../../data/icons';
import { useSearch } from '../../context/SearchContext';
import { formatCityName } from '../../utils/formatCityName';

// ── Configuration ─────────────────────────────────────
const SEARCH_TABS = ['Buy', 'Commercial'];

const PROPERTY_TYPES = {
  Buy: ['All Residential', 'Apartment', 'Villa / House', 'Independent Floor', 'Plot / Land'],
  Rent: ['All Residential', 'Apartment', 'Villa / House', 'Independent Floor', 'PG / Co-living'],
  Commercial: ['Office Space', 'Retail Shop', 'Co-Working', 'Warehouse', 'Industrial'],
};

const BUY_BUDGETS = {
  min: ['No Min', '10L', '20L', '30L', '50L', '75L', '1Cr', '1.5Cr', '2Cr', '3Cr', '5Cr'],
  max: ['No Max', '20L', '30L', '50L', '75L', '1Cr', '1.5Cr', '2Cr', '3Cr', '5Cr', '10Cr+'],
};

const RENT_BUDGETS = {
  min: ['No Min', '5K', '8K', '10K', '15K', '20K', '25K', '30K', '40K', '50K'],
  max: ['No Max', '10K', '15K', '20K', '25K', '30K', '40K', '50K', '75K', '1L+'],
};

const BHK_OPTIONS = ['1 RK', '1', '2', '3', '4', '4+'];
const FURNISHING_OPTIONS = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
const POSTED_BY_OPTIONS = ['Owner', 'Builder / Developer', 'Agent'];
const POSSESSION_OPTIONS = ['Ready to Move', 'Under Construction', 'New Launch'];

function SuggestionIcon({ type }) {
  if (type === 'city') return <PinIco />;
  if (type === 'locality') return <LocIco />;
  if (type === 'property') return <SearchIco />;
  return <IconFlats />;
}

export default function SearchBar({ isNavbar = false, variant = 'default' }) {
  const isHeroVariant = variant === 'hero' && !isNavbar;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const locationRef = useRef(null);
  const rootRef = useRef(null);
  const dropdownAnchorRef = useRef(null);
  const prevPathnameRef = useRef(pathname);
  const [isLocationFocused, setIsLocationFocused] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [dropdownRect, setDropdownRect] = useState(null);
  const {
    activeTab,
    location,
    query,
    suggestions,
    defaultSuggestions,
    categories,
    cities,
    popularCities,
    recentSearches,
    propertyType,
    propertyCategory,
    minBudget,
    maxBudget,
    bhk,
    furnishing,
    postedBy,
    possessionStatus,
    showAdvancedFilters,
    locStatus,
    searchStatus,
    searchResults,
    searchError,
    updateQuery,
    updateLocation,
    convertBudgetToNumber,
    handleSearch: contextHandleSearch,
    setActiveTab,
    setLocation,
    setQuery,
    clearSuggestions,
    setPropertyType,
    setPropertyCategory,
    setMinBudget,
    setMaxBudget,
    toggleBhk,
    setFurnishing,
    setPostedBy,
    setPossessionStatus,
    toggleAdvancedFilters,
    setShowAdvancedFilters,
    resetAllFilters,
    resetListingFilters,
    fetchSearchSuggestions,
    performSearch,
    clearSearchError,
    fetchDefaultSuggestions,
    fetchSearchInitData,
    setCoordinates,
  } = useSearch();

  const budgets = activeTab === 'Rent' ? RENT_BUDGETS : BUY_BUDGETS;

  const resolveCategoryParam = (typeName) => {
    if (!typeName || typeName === 'All Residential') return undefined;
    const match = categories?.find((c) => c.name?.toLowerCase() === String(typeName).toLowerCase());
    return match?._id || typeName;
  };

  /** Merge partial overrides with current filter state (city, type, BHK, budget). */
  const buildSearchPayload = (partial = {}) => {
    // Only use search-bar city (set when user picks a city/locality), not navbar GPS city
    const effectiveCity =
      partial.city !== undefined ? partial.city || undefined : location?.trim() || undefined;

    const effectiveType = partial.propertyType !== undefined ? partial.propertyType : propertyType;

    const categoryId =
      partial.propertyType !== undefined
        ? resolveCategoryParam(partial.propertyType) || undefined
        : effectiveType === 'All Residential'
          ? undefined
          : propertyCategory || resolveCategoryParam(effectiveType) || undefined;

    const payload = {
      search: partial.search !== undefined ? partial.search : query?.trim() || undefined,
      city: effectiveCity,
      propertyType: categoryId,
      bhk: partial.bhk !== undefined ? partial.bhk : bhk?.length > 0 ? bhk : undefined,
      minPrice: partial.minPrice !== undefined ? partial.minPrice : minBudget,
      maxPrice: partial.maxPrice !== undefined ? partial.maxPrice : maxBudget,
      possessionStatus:
        partial.possessionStatus !== undefined ? partial.possessionStatus : possessionStatus,
    };

    if (partial.history !== undefined) payload.history = partial.history;
    return payload;
  };

  // Build dynamic types from categories if available
  const types =
    categories?.length > 0
      ? ['All Residential', ...categories.map((c) => c.name)]
      : PROPERTY_TYPES[activeTab] || PROPERTY_TYPES.Buy;

  // Lock body scroll when mobile search is open
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  // Home hero search: drop filters from a prior /properties visit so they are not re-sent
  useEffect(() => {
    if (isNavbar) return;
    const prev = prevPathnameRef.current;
    if (pathname === '/' && prev && prev !== '/') {
      resetListingFilters();
    }
    prevPathnameRef.current = pathname;
  }, [pathname, isNavbar, resetListingFilters]);

  // Debounced suggestions — avoids API + Redux update on every keystroke
  useEffect(() => {
    if (!query || query.length < 2) {
      clearSuggestions();
      return undefined;
    }
    const timer = setTimeout(() => {
      fetchSearchSuggestions(query);
    }, 350);
    return () => clearTimeout(timer);
  }, [query, fetchSearchSuggestions, clearSuggestions]);

  const updateDropdownRect = useCallback(() => {
    const el = dropdownAnchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setDropdownRect({
      top: rect.bottom + 8,
      left: rect.left,
      width: Math.max(rect.width, 320),
    });
  }, []);

  useEffect(() => {
    if (!isLocationFocused || isNavbar) {
      setDropdownRect(null);
      return undefined;
    }
    updateDropdownRect();
    window.addEventListener('resize', updateDropdownRect);
    window.addEventListener('scroll', updateDropdownRect, true);
    return () => {
      window.removeEventListener('resize', updateDropdownRect);
      window.removeEventListener('scroll', updateDropdownRect, true);
    };
  }, [isLocationFocused, isNavbar, updateDropdownRect, query, suggestions.length]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleOut = (e) => {
      const isInsideRoot = rootRef.current && rootRef.current.contains(e.target);
      const mobileModal = document.getElementById('mobile-search-modal');
      const isInsideMobileModal = mobileModal && mobileModal.contains(e.target);
      const suggestionsDropdown = document.getElementById('search-suggestions-dropdown');
      const isInsideSuggestionsDropdown =
        suggestionsDropdown && suggestionsDropdown.contains(e.target);

      if (
        !isInsideRoot &&
        !isInsideMobileModal &&
        !isInsideSuggestionsDropdown
      ) {
        setIsLocationFocused(false);
        clearSuggestions();
        if (showAdvancedFilters) setShowAdvancedFilters(false);
      }
    };
    document.addEventListener('mousedown', handleOut);
    document.addEventListener('touchstart', handleOut);
    return () => {
      document.removeEventListener('mousedown', handleOut);
      document.removeEventListener('touchstart', handleOut);
    };
  }, [clearSuggestions, showAdvancedFilters, setShowAdvancedFilters]);

  const handleSearch = (e, paramsOverride = {}) => {
    e?.preventDefault();
    setIsMobileOpen(false);
    document.body.style.overflow = '';

    contextHandleSearch(e, buildSearchPayload(paramsOverride));
  };

  const fetchCityCoordinates = (locationName) => {
    if (window.google && window.google.maps && window.google.maps.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: locationName }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
          const lat = results[0].geometry.location.lat();
          const lng = results[0].geometry.location.lng();
          setCoordinates({ lat, lng });
        } else {
          console.error('Geocode failed for selected location:', status);
        }
      });
    }
  };

  const handleSelect = (s) => {
    setIsLocationFocused(false);
    clearSuggestions();

    const overrides = {};
    if (s.type === 'city') {
      setQuery('');
      setLocation(s.text);
      fetchCityCoordinates(s.text);
      overrides.search = '';
      overrides.city = s.text;
    } else if (s.type === 'locality') {
      setQuery(s.text);
      fetchCityCoordinates(s.text);
      overrides.search = s.text;
      if (s.subtext) {
        setLocation(s.subtext);
        overrides.city = s.subtext;
      }
    } else if (s.type === 'project' || s.type === 'property') {
      setQuery(s.text);
      fetchCityCoordinates(s.text);
      overrides.search = s.text;
      if (s.id) {
        navigate(`/property/${s.id}`);
        return;
      }
    } else if (s.type === 'category') {
      setPropertyType(s.text);
      const catId = resolveCategoryParam(s.text);
      if (catId) setPropertyCategory(catId);
      return;
    } else {
      setQuery(s.text);
      fetchCityCoordinates(s.text);
      handleSearch(null, buildSearchPayload({ search: s.text }));
      return;
    }

    handleSearch(null, buildSearchPayload(overrides));
  };

  const handleInputFocus = () => {
    setIsLocationFocused(true);
    if (!query) {
      fetchDefaultSuggestions();
    }
  };

  const handleRecentSelect = (text) => {
    const trimmed = String(text || '').trim();
    if (!trimmed) return;

    setIsLocationFocused(false);
    clearSuggestions();
    setIsMobileOpen(false);
    document.body.style.overflow = '';

    const isKnownCity =
      cities?.some((c) => (c.name || '').toLowerCase() === trimmed.toLowerCase()) ||
      popularCities?.some(
        (c) => (c.name || c.text || '').toString().toLowerCase() === trimmed.toLowerCase()
      );

    if (isKnownCity) {
      setQuery('');
      setLocation(trimmed);
      fetchCityCoordinates(trimmed);
      handleSearch(null, buildSearchPayload({ search: '', city: trimmed }));
      return;
    }

    setQuery(trimmed);
    setLocation('');
    handleSearch(null, buildSearchPayload({ search: trimmed, city: undefined }));
  };

  const handleDetectLocation = (e) => {
    e?.stopPropagation();
    if (!navigator.geolocation) return;
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (window.google && window.google.maps && window.google.maps.Geocoder) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
            if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
              const components = results[0].address_components;
              const localityComponent = components.find((c) => c.types.includes('locality'));
              const sublocalityComponent = components.find((c) =>
                c.types.includes('sublocality_level_1')
              );
              const districtComponent = components.find((c) =>
                c.types.includes('administrative_area_level_2')
              );

              const cityName =
                localityComponent?.long_name ||
                sublocalityComponent?.long_name ||
                districtComponent?.long_name;
              if (cityName) {
                const cleanCity = cityName.replace(/ District/g, '');
                setQuery(cleanCity);
              }
            } else {
              console.error('Reverse geocode failed:', status);
            }
            setIsGpsLoading(false);
          });
        } else {
          setIsGpsLoading(false);
        }
      },
      () => setIsGpsLoading(false),
      { timeout: 10000 }
    );
  };

  const showDropdown = isLocationFocused;
  // Show city/location in box when no text query — so users see what they navigated with
  const displayValue = query || location;

  // ── Mobile Full-Screen Modal ──────────────────────────
  const mobileModal =
    isMobileOpen &&
    ReactDOM.createPortal(
      <div
        id="mobile-search-modal"
        className="fixed inset-0 h-dvh bg-slate-50 z-[9999] flex flex-col overscroll-contain overflow-hidden font-sans text-slate-600"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 bg-white shrink-0 z-[10] shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 active:scale-95 transition"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Back"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="text-base font-bold text-slate-900 tracking-tight">
              Find Your Residence
            </span>
          </div>
          <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#c5a880] bg-[#c5a880]/10 px-2.5 py-1.5 rounded-full">
            Yukthi Elite
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 px-4 pt-4 shrink-0 bg-white pb-3">
          {SEARCH_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border-none ${activeTab === tab
                  ? 'bg-[#023526] text-white shadow-md'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-5">
          {/* Location field */}
          <div className="flex flex-col gap-2.5" ref={locationRef}>
            <label className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#c5a880]">
              Search Location
            </label>
            <div className="flex items-center gap-3 px-4 py-3 border border-slate-200/80 rounded-2xl bg-white shadow-sm transition-all focus-within:border-[#023526] focus-within:ring-4 focus-within:ring-[#023526]/5">
              <SearchIco className="w-5 h-5 text-slate-400 shrink-0" />
              <div className="flex-1 flex items-center gap-1.5 flex-wrap min-w-0">
                {/* Mobile Badges */}
                {propertyType !== 'All Residential' && (
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-[#023526]/5 border border-[#023526]/10 text-[#023526] rounded-xl text-[11px] font-bold whitespace-nowrap">
                    {propertyType}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPropertyType('All Residential');
                      }}
                      className="opacity-60 hover:opacity-100 ml-1"
                    >
                      <CloseIco style={{ width: 10, height: 10 }} />
                    </button>
                  </div>
                )}
                {bhk.length > 0 &&
                  bhk.map((b) => (
                    <div
                      key={b}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#c5a880]/10 border border-[#c5a880]/20 text-[#c5a880] rounded-lg text-[11px] font-bold whitespace-nowrap"
                    >
                      {b} BHK
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBhk(b);
                        }}
                        className="opacity-60 hover:opacity-100 ml-1"
                      >
                        <CloseIco style={{ width: 10, height: 10 }} />
                      </button>
                    </div>
                  ))}
                <input
                  type="text"
                  autoFocus
                  placeholder={
                    propertyType === 'All Residential' && bhk.length === 0
                      ? 'City, locality, project…'
                      : ''
                  }
                  value={displayValue}
                  onChange={(e) => updateQuery(e.target.value)}
                  onFocus={(e) => {
                    // Pre-fill with location so user can edit it directly
                    if (!query && location) setQuery(location);
                    handleInputFocus(e);
                  }}
                  className="flex-1 border-none outline-none bg-transparent text-[14.5px] font-semibold text-slate-800 placeholder:text-slate-400 min-w-[100px]"
                />
              </div>
              {displayValue && (
                <button
                  type="button"
                  className="text-slate-400 p-1 flex items-center justify-center rounded-full hover:bg-slate-50 hover:text-red-500 transition-colors"
                  onClick={() => {
                    clearSuggestions();
                    setQuery('');
                    setLocation('');
                    resetListingFilters();
                  }}
                >
                  <CloseIco style={{ width: 13, height: 13 }} />
                </button>
              )}
              <button
                type="button"
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all hover:bg-slate-50 hover:text-[#023526] text-slate-400 ${isGpsLoading ? 'animate-[spin_1s_linear_infinite]' : ''}`}
                onClick={handleDetectLocation}
                aria-label="Detect my location"
              >
                {isGpsLoading ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                ) : (
                  <GpsIco />
                )}
              </button>
            </div>
            {showDropdown && (
              <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-[0_8px_30px_rgba(2,53,38,0.03)] mt-2">
                <SuggestionDropdown
                  suggestions={suggestions}
                  defaultSuggestions={defaultSuggestions}
                  recentSearches={recentSearches}
                  cities={cities}
                  popularCities={popularCities}
                  query={query}
                  onSelect={handleSelect}
                  onRecent={handleRecentSelect}
                  activeTab={activeTab}
                  propertyType={propertyType}
                  bhk={bhk}
                  minBudget={minBudget}
                  maxBudget={maxBudget}
                  budgets={budgets}
                  types={types}
                  locStatus={locStatus}
                  inline
                  resolveCategoryParam={resolveCategoryParam}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3.5 px-4 py-4 border-t border-slate-100 bg-white pb-[calc(18px+env(safe-area-inset-bottom,0px))] shadow-[0_-8px_30px_rgba(0,0,0,0.03)]">
          <button
            type="button"
            className="px-6 h-12 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition active:scale-95"
            onClick={() => resetAllFilters()}
          >
            Reset
          </button>
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-r from-[#023526] to-[#011f16] hover:from-[#034432] hover:to-[#023526] text-white text-sm font-bold tracking-wider uppercase shadow-lg hover:shadow-[#023526]/12 transition active:scale-[0.98]"
            onClick={handleSearch}
          >
            <SearchIco className="w-[18px] h-[18px]" />
            <span>Search</span>
          </button>
        </div>
      </div>,
      document.body
    );

  // ── Desktop / Hero View ─────────────────────────────
  return (
    <>
      {mobileModal}

      <div
        className={`relative z-[200] ${isNavbar
            ? 'w-full min-w-0 max-w-full'
            : isHeroVariant
              ? 'w-full min-w-0 max-w-full'
              : 'w-full max-w-[620px] ml-auto mr-0 max-lg:mx-auto max-lg:max-w-full'
          }`}
        ref={rootRef}
      >
        {/* Tabs (Buy / Commercial) — desktop only */}
        {/* {!isNavbar && (
          <div className="flex gap-1 mb-2 px-1">
            {SEARCH_TABS.map(tab => (
              <button
                key={tab}
                className={`px-5 py-2 text-[0.82rem] font-semibold cursor-pointer transition-all rounded-lg border-none relative uppercase tracking-[0.05em] ${activeTab === tab
                    ? 'text-white bg-white/20 after:content-[""] after:absolute after:bottom-[-4px] after:left-[20%] after:right-[20%] after:h-[3px] after:bg-[#023526] after:rounded-[10px] after:shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                    : 'text-white/70 bg-transparent hover:text-white hover:bg-white/10'
                  }`}
                onClick={() => setActiveTab(tab)}
              >{tab}</button>
            ))}
          </div>
        )} */}

        {/* Card */}
        <div
          className={`relative overflow-visible ${!isNavbar
              ? isHeroVariant
                ? 'bg-transparent border-none shadow-none p-0'
                : 'bg-white rounded-[20px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_20px_25px_-5px_rgba(0,0,0,0.1)] border border-black/5 p-3'
              : 'bg-transparent p-0 border-none shadow-none'
            }`}
        >
          {/* Mobile Trigger */}
          <button
            className={`md:hidden w-full flex items-center gap-3 cursor-pointer min-w-0 ${isNavbar
                ? 'h-[40px] px-3 gap-2.5 rounded-[10px] bg-[#f1f5f9] border border-[#e2e8f0]'
                : isHeroVariant
                  ? 'h-12 px-3.5 rounded-md border border-slate-200 bg-slate-50/90'
                  : 'py-[14px] px-4 bg-white rounded-2xl border border-[#e2e8f0]'
              }`}
            onClick={() => {
              if (window.innerWidth <= 768) setIsMobileOpen(true);
            }}
            aria-label="Open search"
          >
            <div
              className={`flex items-center justify-center rounded-xl shrink-0 ${isNavbar
                  ? 'w-7 h-7 bg-transparent text-[#94a3b8]'
                  : 'w-10 h-10 bg-[#023526] text-white'
                }`}
            >
              <SearchIco className={isNavbar ? 'w-[18px] h-[18px]' : 'w-5 h-5'} />
            </div>
            <div className="flex-1 text-left min-w-0 flex flex-col">
              <span
                className={`block font-semibold text-[#1e293b] whitespace-nowrap overflow-hidden text-ellipsis leading-[1.2] ${isNavbar ? 'text-[0.85rem] text-[#64748b]' : 'text-base'}`}
              >
                {displayValue ||
                  (location ? `Search in ${location}...` : 'Search city, locality, project…')}
              </span>
              {!isNavbar && (
                <span className="text-xs text-[#94a3b8] font-medium">
                  {activeTab} · {propertyType} {bhk.length > 0 ? `· ${bhk.length} BHK` : ''}
                </span>
              )}
            </div>
          </button>

          {/* Desktop Form */}
          {!isNavbar && (
            <div className={`hidden md:flex flex-col ${isHeroVariant ? 'gap-2.5' : 'gap-3'}`}>
              <form
                ref={dropdownAnchorRef}
                className={
                  isHeroVariant
                    ? 'flex w-full items-center gap-2 rounded-md border border-slate-200 bg-slate-50/80 p-1.5 transition-all focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10'
                    : 'flex items-center bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] h-16 transition-all focus-within:border-[#023526] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(245,158,11,0.05)]'
                }
                onSubmit={handleSearch}
              >
                {/* Location input */}
                <div
                  className={
                    isHeroVariant
                      ? 'flex flex-1 items-center gap-2.5 min-w-0 px-3 py-2 cursor-pointer rounded-sm transition-colors hover:bg-slate-50/80'
                      : 'flex-[1.5] h-full flex flex-col justify-center px-6 cursor-pointer transition-colors hover:bg-black/[0.02] rounded-tl-2xl rounded-bl-2xl min-w-0'
                  }
                  onClick={handleInputFocus}
                >
                  <div className="flex items-center gap-3 w-full min-w-0">
                    <SearchIco
                      className={`shrink-0 ${isHeroVariant ? 'w-4 h-4 text-slate-400' : 'w-5 h-5 text-[#94a3b8]'}`}
                    />
                    <div className="flex-1 flex items-center gap-2 flex-wrap min-w-0">
                      {/* Desktop Badges */}
                      {propertyType !== 'All Residential' && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#023526]/5 border border-[#023526]/10 text-[#023526] rounded-xl text-[0.8rem] font-semibold whitespace-nowrap animate-[heroFadeUp_0.2s_ease-out]">
                          {propertyType}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPropertyType('All Residential');
                            }}
                            className="opacity-60 hover:opacity-100 ml-0.5"
                          >
                            <CloseIco style={{ width: 12, height: 12 }} />
                          </button>
                        </div>
                      )}
                      {bhk.length > 0 &&
                        bhk.map((b) => (
                          <div
                            key={b}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[#c5a880]/10 border border-[#c5a880]/20 text-[#c5a880] rounded-xl text-[0.8rem] font-semibold whitespace-nowrap animate-[heroFadeUp_0.2s_ease-out]"
                          >
                            {b} BHK
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleBhk(b);
                              }}
                              className="opacity-60 hover:opacity-100 ml-0.5"
                            >
                              <CloseIco style={{ width: 12, height: 12 }} />
                            </button>
                          </div>
                        ))}
                      {(minBudget || maxBudget) && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-[0.8rem] font-semibold whitespace-nowrap animate-[heroFadeUp_0.2s_ease-out]">
                          {minBudget || '0'} - {maxBudget || 'Max'}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMinBudget('');
                              setMaxBudget('');
                            }}
                            className="opacity-60 hover:opacity-100 ml-0.5"
                          >
                            <CloseIco style={{ width: 12, height: 12 }} />
                          </button>
                        </div>
                      )}

                      <input
                        type="text"
                        placeholder={
                          location
                            ? `Search in ${location}...`
                            : propertyType === 'All Residential' && bhk.length === 0
                              ? 'Search for locality, project, or landmark'
                              : ''
                        }
                        value={displayValue}
                        onChange={(e) => updateQuery(e.target.value)}
                        onFocus={() => {
                          if (!query && location) setQuery(location);
                          handleInputFocus();
                        }}
                        autoComplete="off"
                        className={`flex-1 border-none outline-none bg-transparent font-semibold text-[#1e293b] placeholder:text-[#cbd5e1] placeholder:font-normal min-w-0 ${isHeroVariant ? 'text-sm md:text-base' : 'text-[1.0625rem] min-w-[150px]'}`}
                      />
                    </div>
                    {displayValue && (
                      <button
                        type="button"
                        className="text-[#94a3b8] p-1 flex items-center justify-center rounded-full hover:bg-[#f1f5f9] hover:text-red-500 transition-colors"
                        onClick={() => {
                          clearSuggestions();
                          setQuery('');
                          setLocation('');
                          resetListingFilters();
                        }}
                      >
                        <CloseIco />
                      </button>
                    )}
                  </div>
                </div>

                {/* Search button */}
                <div className={isHeroVariant ? 'shrink-0' : 'px-2'}>
                  <button
                    type="submit"
                    className={
                      isHeroVariant
                        ? 'flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 lg:px-7 h-11 rounded-md border-none text-sm font-bold transition-all duration-200 active:scale-[0.98]'
                        : 'flex items-center justify-center gap-2 bg-gradient-to-r from-[#023526] to-[#011f16] hover:from-[#034432] hover:to-[#023526] text-white px-8 h-12 rounded-xl border-none text-base font-bold shadow-md hover:shadow-[#023526]/12 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98]'
                    }
                  >
                    <span>Search</span>
                  </button>
                </div>
              </form>

              {/* Trending tags */}
              {defaultSuggestions?.filter((s) => s.type === 'city').length > 0 && (
                <div
                  className={`flex items-center gap-2.5 flex-wrap ${isHeroVariant ? 'px-0.5' : 'px-3 py-1'}`}
                >
                  <span
                    className={`font-medium text-[#94a3b8] shrink-0 ${isHeroVariant ? 'text-xs' : 'text-sm'}`}
                  >
                    Trending
                  </span>
                  <div className="flex gap-1.5 flex-wrap min-w-0">
                    {defaultSuggestions
                      .filter((s) => s.type === 'city')
                      .slice(0, 4)
                      .map((tag) => (
                        <button
                          key={tag.text}
                          className={`font-semibold text-slate-500 bg-slate-100 border border-transparent transition-all hover:bg-white hover:border-primary hover:text-primary ${isHeroVariant ? 'text-xs px-3 py-1 rounded-md' : 'text-[0.8rem] px-3.5 py-1 rounded-full hover:border-[#023526] hover:text-[#023526]'}`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleSelect(tag);
                          }}
                        >
                          {tag.text}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {isLocationFocused &&
          !isNavbar &&
          dropdownRect &&
          ReactDOM.createPortal(
            <div
              id="search-suggestions-dropdown"
              className="pointer-events-auto"
              style={{
                position: 'fixed',
                top: dropdownRect.top,
                left: dropdownRect.left,
                width: dropdownRect.width,
                zIndex: 2500,
              }}
            >
              <SuggestionDropdown
                suggestions={suggestions}
                defaultSuggestions={defaultSuggestions}
                recentSearches={recentSearches}
                cities={cities}
                popularCities={popularCities}
                query={query}
                onSelect={handleSelect}
                onRecent={handleRecentSelect}
                handleSearch={handleSearch}
                activeTab={activeTab}
                propertyType={propertyType}
                bhk={bhk}
                minBudget={minBudget}
                maxBudget={maxBudget}
                budgets={budgets}
                types={types}
                locStatus={locStatus}
                resolveCategoryParam={resolveCategoryParam}
                portaled
              />
            </div>,
            document.body
          )}

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && !isNavbar && (
          <div className={`${isHeroVariant ? 'mt-2.5' : 'mt-3'} animate-[heroFadeUp_0.3s_cubic-bezier(0.16,1,0.3,1)]`}>
            <div
              className={`bg-white px-5 py-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-black/5 flex flex-wrap gap-5 items-center ${isHeroVariant ? 'rounded-md' : 'rounded-[20px]'}`}
            >
              {[
                {
                  label: 'Furnishing',
                  options: FURNISHING_OPTIONS,
                  value: furnishing,
                  setter: setFurnishing,
                },
                {
                  label: 'Posted By',
                  options: POSTED_BY_OPTIONS,
                  value: postedBy,
                  setter: setPostedBy,
                },
                {
                  label: 'Possession',
                  options: POSSESSION_OPTIONS,
                  value: possessionStatus,
                  setter: setPossessionStatus,
                },
              ].map(({ label, options, value, setter }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-[0.72rem] font-medium uppercase tracking-[0.08em] text-[#94a3b8] whitespace-nowrap">
                    {label}
                  </span>
                  <div className="flex gap-1.5 flex-wrap">
                    {options.map((f) => (
                      <button
                        key={f}
                        type="button"
                        className={`px-[14px] py-1.5 rounded-full border-[1.5px] text-[0.78rem] font-semibold transition-all ${value === f
                            ? 'bg-[#023526] border-[#023526] text-white shadow-[0_4px_10px_rgba(245,158,11,0.2)]'
                            : 'bg-[#f8fafc] border-[#e2e8f0] text-[#475569] hover:border-[#023526] hover:text-[#023526]'
                          }`}
                        onClick={() => setter(value === f ? '' : f)}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3 ml-auto">
                <button
                  className="text-[0.85rem] font-semibold text-[#94a3b8] underline underline-offset-2 transition-colors hover:text-[#023526]"
                  onClick={() => resetAllFilters()}
                >
                  Reset All
                </button>
                <button
                  className="flex items-center gap-2 h-10 px-4 bg-[#0f172a] text-white rounded-[10px] text-[0.85rem] font-semibold transition-all hover:bg-[#023526]"
                  onClick={handleSearch}
                >
                  <SearchIco className="w-[18px] h-[18px]" /> Search
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Budget Range Slider ──────────────────────────────────
function BudgetRangeSlider({ budgets, minBudget, maxBudget, setMinBudget, setMaxBudget }) {
  const trackRef = useRef(null);
  const dragging = useRef(null); // 'min' | 'max' | null

  const minSteps = budgets.min;
  const maxSteps = budgets.max;
  const minMax = minSteps.length - 1;
  const maxMax = maxSteps.length - 1;

  const minIdx =
    minBudget && minBudget !== minSteps[0] ? Math.max(0, minSteps.indexOf(minBudget)) : 0;
  const maxIdx =
    maxBudget && maxBudget !== maxSteps[0] ? Math.max(0, maxSteps.indexOf(maxBudget)) : maxMax;

  const leftPct = (minIdx / minMax) * 100;
  const rightPct = (maxIdx / maxMax) * 100;

  const minLabel = minIdx === 0 ? minSteps[0] : minBudget || minSteps[0];
  const maxLabel = maxIdx === maxMax ? maxSteps[maxMax] : maxBudget || maxSteps[maxMax];

  // Compute index from pointer X position on the track
  const idxFromX = (clientX, steps) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(pct * (steps.length - 1));
  };

  const onPointerDown = (e) => {
    e.stopPropagation();
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = (e.clientX - rect.left) / rect.width;
    // Pick the closer handle
    const distToMin = Math.abs(pct - leftPct / 100);
    const distToMax = Math.abs(pct - rightPct / 100);
    dragging.current = distToMin <= distToMax ? 'min' : 'max';
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragging.current) return;
    e.stopPropagation();
    if (dragging.current === 'min') {
      const idx = idxFromX(e.clientX, minSteps);
      setMinBudget(minSteps[idx]);
    } else {
      const idx = idxFromX(e.clientX, maxSteps);
      setMaxBudget(maxSteps[idx]);
    }
  };

  const onPointerUp = (e) => {
    dragging.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="flex flex-col min-w-0 w-full" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-start justify-between gap-2 px-1 pb-2.5">
        <span className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[#94a3b8] shrink-0 pt-0.5">
          Budget
        </span>
        <span className="text-[0.72rem] font-semibold text-[#1e293b] text-right leading-snug min-w-0">
          {minLabel === 'No Min' ? 'Any' : minLabel}
          {' – '}
          {maxLabel === 'No Max' ? 'Any' : maxLabel}
        </span>
      </div>

      <div
        ref={trackRef}
        className="relative h-[6px] rounded-full bg-[#e2e8f0] mx-0.5 my-2.5 cursor-pointer select-none touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Amber fill between thumbs */}
        <div
          className="absolute top-0 h-full rounded-full bg-[#023526] pointer-events-none"
          style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
        />
        {/* Min thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full bg-white border-[2.5px] border-[#023526] shadow-[0_2px_8px_rgba(2,53,38,0.2)] pointer-events-none"
          style={{ left: `calc(${leftPct}% - 9px)` }}
        />
        {/* Max thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full bg-white border-[2.5px] border-[#023526] shadow-[0_2px_8px_rgba(2,53,38,0.2)] pointer-events-none"
          style={{ left: `calc(${rightPct}% - 9px)` }}
        />
      </div>

      <div className="flex items-center justify-between gap-2 mt-2 px-0.5">
        <span className="text-[0.625rem] text-[#94a3b8] font-medium truncate">{minSteps[0]}</span>
        <span className="text-[0.625rem] text-[#94a3b8] font-medium truncate text-right">
          {maxSteps[maxMax]}
        </span>
      </div>
    </div>
  );
}

// ── Suggestion Dropdown ─────────────────────────────────
function SuggestionDropdown({
  suggestions,
  defaultSuggestions,
  recentSearches,
  cities,
  popularCities,
  query,
  onSelect,
  onRecent,
  activeTab,
  propertyType,
  bhk,
  minBudget,
  maxBudget,
  budgets,
  types,
  inline = false,
  portaled = false,
  locStatus = 'idle',
  handleSearch,
  resolveCategoryParam,
}) {
  const { setPropertyType, setPropertyCategory, toggleBhk, setMinBudget, setMaxBudget } =
    useSearch();

  const isInitial = !query;

  // Map dynamic popular cities for display
  const popularCitiesDisplay =
    popularCities?.length > 0
      ? popularCities.slice(0, 5).map((c) => ({ text: c.name, type: 'city' }))
      : cities?.length > 0
        ? cities.slice(0, 5).map((c) => ({ text: c.name, type: 'city' }))
        : [];

  return (
    <div
      className={`bg-white rounded-[10px] border border-slate-200/80 z-[500] overflow-hidden shadow-[0_25px_60px_rgba(2,53,38,0.08)] ${inline
          ? 'static shadow-none border-none mt-0'
          : portaled
            ? 'relative w-full max-h-[min(400px,68vh)] overflow-y-auto animate-[heroFadeUp_0.3s_cubic-bezier(0.16,1,0.3,1)]'
            : `absolute top-[calc(100%+12px)] left-0 right-0 w-full shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_25px_50px_-12px_rgba(0,0,0,0.15)] animate-[heroFadeUp_0.3s_cubic-bezier(0.16,1,0.3,1)] max-h-[min(400px,68vh)] overflow-y-auto ${isInitial ? 'max-w-[95vw]' : ''}`
        }`}
    >
      {isInitial ? (
        <div
          className={`${inline ? 'flex flex-col' : 'grid grid-cols-[1.2fr_1.35fr_1.05fr] items-start'}`}
        >
          {/* Default Suggestions & Recent Searches */}
          <div
            className={`px-[14px] py-3 border-r border-[#f1f5f9] ${inline ? 'border-r-0 border-b py-3 px-0' : ''}`}
          >
            {recentSearches?.length > 0 ? (
              <div className="mb-3">
                <div className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[#94a3b8] px-3 pt-2.5 pb-2 flex items-center justify-between">
                  <span>Recent Searches</span>
                  <button
                    className="text-[0.6rem] text-[#c5a880] hover:underline normal-case tracking-normal"
                    onClick={(e) => {
                      e.stopPropagation();
                      localStorage.removeItem('recentSearches');
                      window.location.reload();
                    }}
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-col gap-0.5">
                  {recentSearches.slice(0, 5).map((text, i) => (
                    <button
                      key={i}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg border-none text-[0.86rem] font-semibold text-[#1e293b] bg-transparent hover:bg-[#f8fafc] transition-all text-left group"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRecent(text);
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#c5a880] transition-colors"
                      >
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                      {text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-3">
                <div className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[#94a3b8] px-3 pt-2.5 pb-2">
                  Popular Cities
                </div>
                <div className="flex flex-col gap-0.5">
                  {popularCitiesDisplay.map((s, i) => (
                    <button
                      key={i}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg border-none text-[0.86rem] font-semibold text-[#1e293b] bg-transparent hover:bg-[#f8fafc] transition-all text-left"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(s);
                      }}
                    >
                      <PinIco className="w-3.5 h-3.5 text-[#023526]" />
                      {formatCityName(s.text)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Default Suggestions if any (filtered) */}
            {!recentSearches?.length && defaultSuggestions?.length > 0 && (
              <div>
                <div className="text-[0.625rem] font-medium uppercase tracking-[0.12em] text-[#94a3b8] px-3 pt-2 pb-1.5">
                  Popular Destinations
                </div>
                <div className="flex flex-col gap-0.5">
                  {defaultSuggestions
                    .filter((ds) => !popularCitiesDisplay.some((pc) => pc.text === ds.text))
                    .slice(0, 3)
                    .map((s, i) => (
                      <button
                        key={i}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-none text-[0.8rem] font-medium text-[#64748b] bg-transparent hover:bg-[#f8fafc] transition-all text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(s);
                        }}
                      >
                        <PinIco className="w-3 h-3 opacity-50" />
                        {s.type === 'city' ? formatCityName(s.text) : s.text}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Property type column */}
          <div
            className={`px-[14px] py-3 border-r border-[#f1f5f9] ${inline ? 'border-r-0 border-b py-3 px-0' : ''}`}
          >
            <div className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[#94a3b8] px-3 pt-2.5 pb-2">
              Property Type
            </div>
            <div className="flex flex-col gap-0.5 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent px-0.5">
              {types.map((t) => (
                <button
                  key={t}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border-none text-[0.86rem] font-semibold transition-all ${propertyType === t
                      ? 'text-[#023526] font-semibold bg-[#023526]/5 border border-[#023526]/10'
                      : 'text-[#475569] bg-transparent hover:bg-[#f8fafc] hover:text-[#1e293b]'
                    }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPropertyType(t);
                    const catId = resolveCategoryParam(t);
                    if (catId) setPropertyCategory(catId);
                  }}
                >
                  {t}
                  {propertyType === t && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="w-3 h-3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Budget column */}
          <div
            className={`px-[14px] py-3 min-w-0 ${inline ? 'py-3 px-0 border-t border-[#f1f5f9]' : 'pt-2.5'}`}
          >
            <BudgetRangeSlider
              budgets={budgets}
              minBudget={minBudget}
              maxBudget={maxBudget}
              setMinBudget={setMinBudget}
              setMaxBudget={setMaxBudget}
            />
          </div>
        </div>
      ) : (
        <>
          {locStatus === 'loading' ? (
            <div className="py-10 px-6 text-center text-sm font-medium text-slate-400">
              Finding matches…
            </div>
          ) : suggestions && suggestions.length > 0 ? (
            <div className="py-2.5 max-h-[min(340px,62vh)] overflow-y-auto scrollbar-thin scrollbar-color-[#e2e8f0]">
              <div className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-[#94a3b8] px-4 pt-2.5 pb-1.5 border-b border-[#f0f4f8]">
                Suggestions
              </div>
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2.5 px-5 cursor-pointer transition-all border-b border-[#f1f5f9] last:border-b-0 hover:bg-[#f8fafc] group"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelect(s);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    onSelect(s);
                  }}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#f8fafc] border border-[#f1f5f9] flex items-center justify-center text-[#64748b] shrink-0 transition-all group-hover:bg-[#023526] group-hover:text-white group-hover:border-[#023526] group-hover:scale-105 group-hover:shadow-[0_6px_14px_rgba(15,23,42,0.12)]">
                    <SuggestionIcon type={s.type} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[0.9rem] font-semibold text-[#1e293b] block whitespace-nowrap overflow-hidden text-ellipsis">
                      {s.type === 'city' ? formatCityName(s.text) : s.text}
                    </span>
                    <span className="text-[0.7rem] text-[#94a3b8] font-medium uppercase tracking-[0.05em] mt-0.5">
                      {s.type === 'property'
                        ? 'Property'
                        : s.type.charAt(0).toUpperCase() + s.type.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 px-6 text-center flex flex-col items-center gap-2.5 text-[#94a3b8] text-[0.9rem]">
              <span>No results found for &ldquo;{query}&rdquo;</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
