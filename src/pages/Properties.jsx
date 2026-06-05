import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GlobalFilters from '../components/GlobalFilters/GlobalFilters';
import PropertyCard from '../components/PropertyCard/PropertyCard';
import { SearchIco, PinIco } from '../data/icons';
import { X } from 'lucide-react';
import Loader from '../components/Loader/Loader';
import { useSearch } from '../context/SearchContext';
import { usePropertiesStore } from '../store/propertiesStore';
import './Properties.css';
import { getCompletionPercentage } from '../utils/propertyCompletion';
import {
  normalizeBhkForApi,
  parseBhkFromSearchParams,
  appendBhkToSearchParams,
} from '../utils/bhkFilter';

const DEFAULT_LOCAL_FILTERS = {
  minPrice: 0,
  maxPrice: 500000000,
  beds: [],
  status: [],
  facing: '',
  minArea: 0,
  maxArea: 10000,
  vastu: false,
  types: [],
};

const FILTERS_ACTIVE_KEY = 'propertiesLocalFiltersActive';
const PROPERTIES_LIMIT = 30;

const hasActiveLocalFilters = (f) =>
  f.beds?.length > 0 ||
  f.status?.length > 0 ||
  f.types?.length > 0 ||
  f.vastu ||
  !!f.facing ||
  f.minPrice > 0 ||
  f.maxPrice < 500000000 ||
  f.minArea > 0 ||
  f.maxArea < 10000;

const buildSearchApiParams = (localFilters, sortBy, search, city, urlPropertyType) => {
  const f = localFilters;
  const categoryType = urlPropertyType || (f.types.length > 0 ? f.types[0] : undefined);
  return {
    limit: PROPERTIES_LIMIT,
    search: search || undefined,
    city: city || undefined,
    propertyType: categoryType,
    propertyTypes: f.types.length > 0 ? f.types.join(',') : categoryType || undefined,
    bhk: f.beds.length > 0 ? normalizeBhkForApi(f.beds) : undefined,
    propertyStatus: f.status.length > 0 ? f.status : undefined,
    vastuCompliant: f.vastu ? true : undefined,
    minPrice: f.minPrice > 0 ? f.minPrice : undefined,
    maxPrice: f.maxPrice < 500000000 ? f.maxPrice : undefined,
    facing: f.facing || undefined,
    minArea: f.minArea > 0 ? f.minArea : undefined,
    maxArea: f.maxArea < 10000 ? f.maxArea : undefined,
    sortBy: sortBy || 'newest',
  };
};

const markLocalFiltersActive = (localFilters) => {
  if (hasActiveLocalFilters(localFilters)) {
    sessionStorage.setItem(FILTERS_ACTIVE_KEY, '1');
  } else {
    sessionStorage.removeItem(FILTERS_ACTIVE_KEY);
  }
};

// Format price helper
const formatPrice = (p) => {
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
  return `₹${p}`;
};

// Detect mobile viewport
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const fn = () => setWidth(window.innerWidth);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return width;
}

export default function Properties() {
  const navigate = useNavigate();
  const urlLocation = useLocation();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filterRefreshNotice, setFilterRefreshNotice] = useState(false);
  const isMobile = useWindowWidth() <= 1024;
  const {
    activeTab,
    query,
    location,
    propertyType,
    propertyCategory,
    dynamicFilters,
    searchStatus,
    searchError,
    searchResults,
    suggestions,
    handleSearch,
    executeSearch,
    setQuery,
    setVastuCompliant,
    resetAllFilters,
    setLocation,
    setPropertyType,
    setPropertyCategory,
    fetchSearchSuggestions,
    setBhk,
    setMinBudget,
    setMaxBudget,
    setPossessionStatus,
  } = useSearch();
  const searchResultsData = searchResults;
  const mergeShareCountsFromProperties = usePropertiesStore(
    (s) => s.mergeShareCountsFromProperties
  );
  const searchLoading = searchStatus;
  const searchErrorData = searchError;
  const [searchDraft, setSearchDraft] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);
  const lastSearchRef = useRef('');
  const initialUrlHandled = useRef(false);
  const applyLocalSearchRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Suggestions while typing (draft only — does not touch URL/Redux until Enter)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchDraft.length > 2) {
        fetchSearchSuggestions(searchDraft);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchDraft, fetchSearchSuggestions]);

  const urlParams = new URLSearchParams(urlLocation.search);
  const urlCityParam = urlParams.get('city') || '';
  const urlSearchParam = urlParams.get('search') || '';
  /** City shown in header — URL city wins, then search context location */
  const displayCity = urlCityParam || location || '';
  const displaySearch = urlSearchParam || query || '';

  // Use search results from Zustand (shape: { properties, filters })
  const filteredListings = (searchResultsData?.properties ?? []).map((p) => ({
    id: p._id,
    _id: p._id,
    shareCount: p.shareCount,
    title: p.projectName || p.title,
    loc: p.address?.locality || p.address?.city || p.location?.city,
    pricing: {
      expectedPrice: p.financials?.totalPrice || 0,
      pricePerSqft: p.financials?.pricePerSft || 0,
    },
    price: formatPrice(p.financials?.totalPrice || 0),
    img:
      p.media?.poster ||
      p.media?.photos?.[0] ||
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=700&q=80',
    status: p.status,
    beds: p.specifications?.bhkConfig || p.beds,
    size: p.specifications?.builtUpArea || p.size || 'N/A',
    propertyType: p.propertyType?.name || 'Property',
    completionPercentage: getCompletionPercentage(p),
    financials: p.financials,
    media: p.media,
    address: p.address,
  }));

  useEffect(() => {
    const raw = searchResultsData?.properties;
    if (raw?.length) mergeShareCountsFromProperties(raw);
  }, [searchResultsData?.properties, mergeShareCountsFromProperties]);

  const [localFilters, setLocalFilters] = useState(DEFAULT_LOCAL_FILTERS);
  const localFiltersRef = useRef(localFilters);
  const sortByRef = useRef(sortBy);

  useEffect(() => {
    localFiltersRef.current = localFilters;
  }, [localFilters]);

  useEffect(() => {
    sortByRef.current = sortBy;
  }, [sortBy]);

  useEffect(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    if (nav?.type === 'reload' && sessionStorage.getItem(FILTERS_ACTIVE_KEY) === '1') {
      setFilterRefreshNotice(true);
      sessionStorage.removeItem(FILTERS_ACTIVE_KEY);
    }
  }, []);

  const buildPropertiesUrl = useCallback((f, sort, search, city, categoryType) => {
    const params = new URLSearchParams();
    const term = (search ?? '').trim();
    if (term) params.set('search', term);
    if (city) params.set('city', city);
    if (categoryType) params.set('propertyType', categoryType);
    if (f.beds?.length > 0) appendBhkToSearchParams(params, f.beds);
    if (f.minPrice > 0) params.set('minPrice', f.minPrice);
    if (f.maxPrice < 500000000) params.set('maxPrice', f.maxPrice);
    f.status?.forEach((s) => params.append('propertyStatus', s));
    if (f.vastu) params.set('vastuCompliant', 'true');
    if (f.facing) params.set('facing', f.facing);
    if (f.minArea > 0) params.set('minArea', f.minArea);
    if (f.maxArea < 10000) params.set('maxArea', f.maxArea);
    if (sort && sort !== 'newest') params.set('sortBy', sort);
    return params.toString() ? `?${params.toString()}` : '';
  }, []);

  const applyLocalSearch = useCallback(
    (
      filters,
      sort = sortByRef.current,
      search = query,
      city = location,
      urlPropertyType = propertyCategory
    ) => {
      markLocalFiltersActive(filters);
      const apiParams = buildSearchApiParams(filters, sort, search, city, urlPropertyType);
      executeSearch(apiParams);

      const nextUrl = buildPropertiesUrl(filters, sort, search, city, urlPropertyType);
      if (lastSearchRef.current !== nextUrl) {
        lastSearchRef.current = nextUrl;
        navigate(`/properties${nextUrl}`, { replace: true });
      }
      setBhk(normalizeBhkForApi(filters.beds || []));
    },
    [executeSearch, query, location, propertyCategory, buildPropertiesUrl, navigate, setBhk]
  );

  useEffect(() => {
    applyLocalSearchRef.current = applyLocalSearch;
  }, [applyLocalSearch]);

  const commitSearch = useCallback(
    (searchText, cityText = location) => {
      const term = (searchText ?? '').trim();
      const city = cityText ?? '';
      setQuery(term);
      setLocation(city);
      setSearchDraft(term);

      const categoryType =
        propertyCategory ||
        (localFiltersRef.current.types.length > 0 ? localFiltersRef.current.types[0] : undefined);
      const f = localFiltersRef.current;
      const next = buildPropertiesUrl(f, sortByRef.current, term, city, categoryType);
      lastSearchRef.current = next;
      navigate(`/properties${next}`, { replace: true });
      applyLocalSearchRef.current?.(f, sortByRef.current, term, city, categoryType);
    },
    [navigate, location, propertyCategory, buildPropertiesUrl, setQuery, setLocation]
  );

  const clearSearchInput = useCallback(() => {
    const cleared = { ...DEFAULT_LOCAL_FILTERS };
    setSearchDraft('');
    setQuery('');
    setLocation('');
    setLocalFilters(cleared);
    lastSearchRef.current = '';
    navigate('/properties', { replace: true });
    applyLocalSearchRef.current?.(localFiltersRef.current, sortByRef.current, '', '');
  }, [navigate, setQuery, setLocation]);

  const handleFilterUpdate = (updater) => {
    setLocalFilters((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;

      if (window.filterTimeout) clearTimeout(window.filterTimeout);
      window.filterTimeout = setTimeout(() => {
        setVastuCompliant(!!next.vastu);
        setPossessionStatus(next.status?.[0] || '');
        setBhk(normalizeBhkForApi(next.beds || []));
        applyLocalSearch(next);
      }, 400);

      return next;
    });
  };

  const clearFilters = () => {
    const cleared = { ...DEFAULT_LOCAL_FILTERS };
    setLocalFilters(cleared);
    resetAllFilters();
    setVastuCompliant(false);
    setIsFilterOpen(false);
    setSortBy('newest');
    sessionStorage.removeItem(FILTERS_ACTIVE_KEY);
    applyLocalSearch(cleared, 'newest');
  };

  const filterContent = (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-between border-b border-slate-100 pb-3 mb-1">
        <div className="text-base font-bold text-slate-900">Filters</div>
        <button
          className="text-xs font-semibold transition-colors cursor-pointer"
          style={{ color: '#023526' }}
          onClick={clearFilters}
        >
          Reset All
        </button>
      </div>
      <GlobalFilters
        dynamicFilters={dynamicFilters}
        filters={localFilters}
        setFilters={handleFilterUpdate}
      />
    </div>
  );

  // Sync from URL only when the address bar changes (back/forward, landing) — not while typing
  useEffect(() => {
    if (urlLocation.pathname !== '/properties') return;

    const params = new URLSearchParams(urlLocation.search);
    const urlQuery = params.get('search') || '';
    const urlCity = params.get('city') || '';
    const urlPropertyType = params.get('propertyType') || '';
    const parsedBhkFromUrl = parseBhkFromSearchParams(params);
    const urlMinPrice = params.get('minPrice') || '';
    const urlMaxPrice = params.get('maxPrice') || '';
    const urlStatusList = [
      ...params.getAll('propertyStatus'),
      ...(params.get('possessionStatus') ? [params.get('possessionStatus')] : []),
    ].filter(Boolean);
    const urlVastu = params.get('vastuCompliant') === 'true';
    const urlFacing = params.get('facing') || '';
    const urlMinArea = params.get('minArea') || '';
    const urlMaxArea = params.get('maxArea') || '';
    const urlSort = params.get('sortBy') || 'newest';

    const cleanParams = new URLSearchParams();
    if (urlQuery) cleanParams.set('search', urlQuery);
    if (urlCity) cleanParams.set('city', urlCity);
    if (urlPropertyType) cleanParams.set('propertyType', urlPropertyType);
    appendBhkToSearchParams(cleanParams, parsedBhkFromUrl);
    if (urlMinPrice) cleanParams.set('minPrice', urlMinPrice);
    if (urlMaxPrice) cleanParams.set('maxPrice', urlMaxPrice);
    urlStatusList.forEach((s) => cleanParams.append('propertyStatus', s));
    if (urlVastu) cleanParams.set('vastuCompliant', 'true');
    if (urlFacing) cleanParams.set('facing', urlFacing);
    if (urlMinArea) cleanParams.set('minArea', urlMinArea);
    if (urlMaxArea) cleanParams.set('maxArea', urlMaxArea);
    if (urlSort && urlSort !== 'newest') cleanParams.set('sortBy', urlSort);
    const cleanSearch = cleanParams.toString() ? `?${cleanParams.toString()}` : '';

    if (urlLocation.search !== cleanSearch) {
      window.history.replaceState(null, '', `/properties${cleanSearch}`);
    }

    if (lastSearchRef.current === cleanSearch && initialUrlHandled.current) return;

    setSearchDraft(urlQuery);
    setQuery(urlQuery);
    setLocation(urlCity);
    if (urlPropertyType) {
      setPropertyCategory(urlPropertyType);
    }

    setBhk(parsedBhkFromUrl);
    setVastuCompliant(urlVastu);
    setPossessionStatus(urlStatusList[0] || '');

    const convertNumberToBudget = (num) => {
      if (!num) return '';
      const n = parseInt(num, 10);
      if (isNaN(n)) return '';
      if (n >= 10000000) return `${n / 10000000}Cr`;
      if (n >= 100000) return `${n / 100000}L`;
      if (n >= 1000) return `${n / 1000}K`;
      return String(n);
    };

    setMinBudget(convertNumberToBudget(urlMinPrice));
    setMaxBudget(convertNumberToBudget(urlMaxPrice));

    const nextLocalFilters = {
      minPrice: urlMinPrice ? parseInt(urlMinPrice, 10) : 0,
      maxPrice: urlMaxPrice ? parseInt(urlMaxPrice, 10) : 500000000,
      beds: parsedBhkFromUrl,
      status: urlStatusList,
      facing: urlFacing,
      minArea: urlMinArea ? parseInt(urlMinArea, 10) : 0,
      maxArea: urlMaxArea ? parseInt(urlMaxArea, 10) : 10000,
      vastu: urlVastu,
      types: urlPropertyType ? [urlPropertyType] : [],
    };

    setLocalFilters(nextLocalFilters);
    localFiltersRef.current = nextLocalFilters;
    setSortBy(urlSort);
    sortByRef.current = urlSort;

    lastSearchRef.current = cleanSearch;
    if (!initialUrlHandled.current) {
      initialUrlHandled.current = true;
    }

    applyLocalSearchRef.current?.(nextLocalFilters, urlSort, urlQuery, urlCity, urlPropertyType);
  }, [
    urlLocation.search,
    urlLocation.pathname,
    setQuery,
    setLocation,
    setPropertyCategory,
    setBhk,
    setVastuCompliant,
    setPossessionStatus,
    setMinBudget,
    setMaxBudget,
  ]);

  if (searchErrorData) {
    return (
      <div className="min-h-screen bg-[#f8fafc] pb-[80px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[4rem] mb-6">⚠️</div>
          <h3 className="text-[1.75rem] font-semibold text-[#0f172a] mb-2">Search Error</h3>
          <p className="text-[#64748b] text-[1.1rem] mb-8 max-w-[400px] mx-auto leading-relaxed">
            {searchErrorData}
          </p>
          <button
            className="h-[52px] px-8 rounded-full bg-[#023526] text-white text-[1rem] font-bold cursor-pointer transition-all hover:bg-[#034432] hover:shadow-[0_8px_20px_rgba(2,53,38,0.2)] active:scale-95"
            onClick={handleSearch}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="properties-page min-h-screen bg-[#f8fafc] pb-[80px] font-sans antialiased text-base font-medium leading-normal">
      {filterRefreshNotice && (
        <div className="mx-6 lg:mx-10 mt-4 flex items-start justify-between gap-3 rounded-xl border border-[#023526]/20 bg-[#023526]/5 px-4 py-3 text-sm text-[#023526]">
          <p>
            <span className="font-semibold">Filters were cleared.</span> Only your search term is
            kept after refresh. Sidebar filters are session-only and are not saved in the link.
          </p>
          <button
            type="button"
            className="shrink-0 text-[#023526] hover:text-[#034432] font-semibold"
            onClick={() => setFilterRefreshNotice(false)}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mobile filter drawer — mount only when open (avoids duplicate radio groups with desktop sidebar) */}
      {isMobile && isFilterOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] transition-opacity duration-300 animate-in fade-in"
            onClick={() => setIsFilterOpen(false)}
            aria-hidden
          />
          <aside className="fixed bottom-0 left-0 right-0 w-full h-[80dvh] bg-white z-[1001] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] rounded-t-[28px] p-6 overflow-y-auto animate-in slide-in-from-bottom duration-300 ease-out">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#f1f5f9]">
              <h3 className="text-[1.1rem] font-bold text-slate-800">Filters</h3>
              <button
                type="button"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#f1f5f9] border-none text-[1.1rem] cursor-pointer hover:bg-rose-50 hover:text-red-500 transition-colors"
                onClick={() => setIsFilterOpen(false)}
                aria-label="Close filters"
              >
                ✕
              </button>
            </div>
            {filterContent}
          </aside>
        </>
      )}

      <div className="max-w-[1536px] mx-auto px-6 lg:px-10 pt-4 md:pt-10">
        <div className="flex gap-8 relative items-start">
          {/* SIDEBAR FILTERS (Desktop only — not mounted on mobile) */}
          {!isMobile && (
            <aside className="w-[280px] shrink-0 sticky top-[100px] self-start h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide pb-10">
              <div className="bg-white p-6 rounded-[24px] border border-[#e2e8f0] shadow-sm">
                {filterContent}
              </div>
            </aside>
          )}

          {/* RESULTS GRID */}
          <div className="flex-1 min-w-0">
            {/* Search Input & Actions Bar */}
            <div className="flex items-center justify-between gap-3 mb-4 bg-white px-4 py-3 rounded-md border border-slate-100 shadow-sm max-md:flex-col max-md:items-stretch">
              {isSearchFocused && (
                <div
                  className="fixed inset-0 bg-transparent z-[90]"
                  onMouseDown={() => setIsSearchFocused(false)}
                  onTouchStart={() => setIsSearchFocused(false)}
                />
              )}
              <div className="relative w-full max-w-md flex-1 z-[100]" ref={searchRef}>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#023526] transition-colors">
                    <SearchIco className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder={`Discover ${activeTab} estates...`}
                    className="w-full h-11 pl-10 pr-9 rounded-xl bg-white border border-slate-200 text-[0.85rem] font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#023526] focus:ring-4 focus:ring-[#023526]/8 transition-all"
                    value={searchDraft}
                    onChange={(e) => setSearchDraft(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        commitSearch(searchDraft, location);
                        setIsSearchFocused(false);
                      }
                    }}
                  />
                  {(searchDraft || query || location) && (
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 border-none cursor-pointer hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90"
                      onClick={clearSearchInput}
                      aria-label="Clear search"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Suggestions Dropdown */}
                {isSearchFocused && suggestions && suggestions?.length > 0 && (
                  <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-[20px] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.12)] z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="py-1">
                      {suggestions?.map((s, idx) => {
                        const selectHandler = (e) => {
                          e.preventDefault(); // Prevent input blur / default touch behaviors
                          e.stopPropagation();
                          const overrides = {};
                          if (s.type === 'city') {
                            overrides.search = s.text;
                            overrides.city = s.text;
                          } else {
                            overrides.search = s.text;
                            if (s.subtext) overrides.city = s.subtext;
                          }
                          setSearchDraft(overrides.search || '');
                          commitSearch(overrides.search || '', overrides.city || '');
                          setTimeout(() => {
                            setIsSearchFocused(false);
                          }, 150);
                        };
                        return (
                          <button
                            key={idx}
                            className="w-full flex items-center gap-3.5 py-2.5 px-4 border-none bg-transparent hover:bg-slate-50 transition-colors cursor-pointer text-left group"
                            onMouseDown={selectHandler}
                            onTouchStart={selectHandler}
                          >
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#023526]/8 group-hover:text-[#023526] transition-all">
                              {s.type === 'city' ? (
                                <PinIco className="w-4 h-4" />
                              ) : (
                                <SearchIco className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.85rem] font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                                {s.text}
                              </span>
                              <span className="text-[0.7rem] font-normal text-slate-400 capitalize tracking-normal">
                                {s.type} {s.subtext ? `• ${s.subtext}` : ''}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2.5 shrink-0 max-md:w-full">
                <button
                  className="hidden max-lg:flex items-center gap-1.5 h-11 px-5 rounded-xl bg-white border border-slate-200 text-slate-600 font-semibold text-[0.78rem] cursor-pointer transition-all hover:border-[#023526] hover:text-[#023526] flex-1 justify-center whitespace-nowrap active:scale-95 group"
                  onClick={() => setIsFilterOpen(true)}
                >
                  <svg
                    className="text-slate-400 group-hover:text-[#023526] transition-colors"
                    viewBox="0 0 24 24"
                    width="13"
                    height="13"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                  <span>Filters</span>
                </button>
                <div className="relative group shrink-0 max-md:flex-1">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-[#023526] transition-colors">
                    <svg
                      viewBox="0 0 24 24"
                      width="13"
                      height="13"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18M7 12h10M10 18h4" />
                    </svg>
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSortBy(val);
                      applyLocalSearch(localFiltersRef.current, val);
                    }}
                    className="appearance-none h-11 pl-9 pr-8 w-full rounded-xl bg-white border border-slate-200 text-slate-600 text-[0.78rem] font-semibold cursor-pointer transition-all hover:border-[#023526] focus:outline-none focus:border-[#023526]"
                  >
                    <option value="newest">Sort: Newest</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-600 transition-colors">
                    <svg
                      viewBox="0 0 24 24"
                      width="10"
                      height="10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Showing Text Below Card */}
            <div className="mb-6 pl-1">
              <h2 className="properties-results-heading tracking-tight leading-tight">
                Showing <span className="font-bold" style={{ color: '#023526' }}>{filteredListings.length}</span>{' '}
                {activeTab}{' '}
                {propertyType && propertyType !== 'All Residential' ? `${propertyType} ` : ''}
                Properties
                {displayCity && (
                  <span className="text-slate-500 font-medium"> in {displayCity}</span>
                )}
                {displaySearch && (
                  <span className="text-slate-400 font-normal italic text-[0.85rem]">
                    {' '}
                    for &quot;{displaySearch}&quot;
                  </span>
                )}
              </h2>
            </div>

            <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(220px,1fr))] max-md:grid-cols-2 max-sm:gap-3">
              {searchLoading === 'loading' ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-60">
                  <div className="w-10 h-10 border-4 border-[#023526]/20 border-t-[#023526] rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-500 font-semibold text-sm animate-pulse">
                    Updating properties...
                  </p>
                </div>
              ) : (
                filteredListings.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    variant={isMobile ? 'listv2' : 'vertical'}
                    typography="home"
                  />
                ))
              )}
            </div>

            {searchLoading !== 'loading' && filteredListings.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-[#e2e8f0] mt-10">
                <div className="text-[4rem] mb-6 grayscale opacity-20">🔍</div>
                <h3 className="text-[1.75rem] font-semibold text-[#0f172a] mb-2">
                  No properties found
                </h3>
                <p className="text-[#64748b] text-[1.1rem] mb-8 max-w-[400px] mx-auto leading-relaxed">
                  Try adjusting your search keywords, exploring a different category or clearing all
                  filters.
                </p>
                <button
                  className="h-[52px] px-8 rounded-full bg-[#023526] text-white text-[1rem] font-bold cursor-pointer transition-all hover:bg-[#034432] hover:shadow-[0_8px_20px_rgba(2,53,38,0.2)] active:scale-95"
                  onClick={clearSearchInput}
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
