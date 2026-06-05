import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { getNearbyProperties } from '../service/searchService';
import PropertyCard from '../components/PropertyCard/PropertyCard';
import GlobalFilters from '../components/GlobalFilters/GlobalFilters';
import { ChevronL, SearchIco, PinIco, FilterIco, CloseIco } from '../data/icons';
import { resolvePropertyImage } from '../utils/share';
import { getCompletionPercentage } from '../utils/propertyCompletion';
import { formatCityName } from '../utils/formatCityName';
import { useSearch } from '../context/SearchContext';
import './CityPropertiesPage.css';

const NearbyPropertiesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Featured');
  const [dynamicFilters, setDynamicFilters] = useState([]);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 500000000,
    beds: [],
    status: [],
    facing: '',
    minArea: 0,
    maxArea: 10000,
    vastu: false,
    types: [],
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { coordinates: globalCoords, location: globalCity } = useSearch();
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });
  const [locationChecked, setLocationChecked] = useState(false);

  const lastGlobalCoords = useRef(globalCoords);
  const lastGlobalCity = useRef(globalCity);

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const searchInputRef = useRef(null);
  const listingSectionRef = useRef(null);
  const isFirstMount = useRef(true);
  const hasLoadedOnce = useRef(false);
  const fetchRequestId = useRef(0);

  const urlCity = useMemo(
    () => new URLSearchParams(location.search).get('city'),
    [location.search]
  );

  useEffect(() => {
    const coordsChanged =
      globalCoords?.lat !== lastGlobalCoords.current?.lat ||
      globalCoords?.lng !== lastGlobalCoords.current?.lng;
    const cityChanged = globalCity !== lastGlobalCity.current;

    if (coordsChanged || cityChanged) {
      lastGlobalCoords.current = globalCoords;
      lastGlobalCity.current = globalCity;

      const params = new URLSearchParams(location.search);
      if (globalCoords?.lat && globalCoords?.lng) {
        params.set('lat', globalCoords.lat);
        params.set('lng', globalCoords.lng);
      } else {
        params.delete('lat');
        params.delete('lng');
      }

      if (globalCity) {
        params.set('city', globalCity);
      } else {
        params.delete('city');
      }

      navigate(`/nearby?${params.toString()}`, { replace: true });
    }
  }, [globalCoords, globalCity, location.search, navigate]);

  const isFilteringActive = useMemo(
    () =>
      filters.minPrice > 0 ||
      filters.maxPrice < 500000000 ||
      filters.beds.length > 0 ||
      filters.status.length > 0 ||
      filters.facing !== '' ||
      filters.minArea > 0 ||
      filters.maxArea < 10000 ||
      filters.vastu ||
      filters.types.length > 0 ||
      debouncedSearchQuery !== '',
    [filters, debouncedSearchQuery]
  );

  const hasActiveFilters = useMemo(
    () =>
      filters.beds.length > 0 ||
      filters.status.length > 0 ||
      filters.facing ||
      filters.minPrice > 0 ||
      filters.maxPrice < 500000000 ||
      filters.minArea > 0 ||
      filters.vastu,
    [filters]
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') e.target.blur();
  };

  const formatPrice = (p) => {
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
    return `₹${p}`;
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlLat = params.get('lat');
    const urlLng = params.get('lng');

    if (urlLat && urlLng) {
      setUserLocation({ lat: parseFloat(urlLat), lng: parseFloat(urlLng) });
      setLocationChecked(true);
    } else if (globalCoords?.lat && globalCoords?.lng) {
      setUserLocation({ lat: globalCoords.lat, lng: globalCoords.lng });
      setLocationChecked(true);
    } else {
      setUserLocation({ lat: null, lng: null });
      setLocationChecked(true);
    }
  }, [location.search, globalCoords]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onBreakpoint = () => {
      if (mq.matches) setIsDrawerOpen(false);
    };
    mq.addEventListener('change', onBreakpoint);
    return () => mq.removeEventListener('change', onBreakpoint);
  }, []);

  useEffect(() => {
    if (!locationChecked) return;

    const fetchNearby = async () => {
      const requestId = ++fetchRequestId.current;
      const isFirstLoad = !hasLoadedOnce.current;

      if (isFirstLoad) {
        setIsInitialLoading(true);
      } else {
        setIsRefetching(true);
      }

      try {
        const searchParams = {
          lat: userLocation.lat ?? undefined,
          lng: userLocation.lng ?? undefined,
          city: urlCity || undefined,
          propertyStatus: filters.status.length > 0 ? filters.status : undefined,
          search: debouncedSearchQuery,
          minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
          maxPrice: filters.maxPrice < 500000000 ? filters.maxPrice : undefined,
          bhk: filters.beds.length > 0 ? filters.beds : undefined,
          facing: filters.facing || undefined,
          minArea: filters.minArea > 0 ? filters.minArea : undefined,
          maxArea: filters.maxArea < 10000 ? filters.maxArea : undefined,
          vastuCompliant: filters.vastu ? true : undefined,
          propertyTypes: filters.types.length > 0 ? filters.types : undefined,
          sortBy:
            sortBy === 'Price: Low to High'
              ? 'price_low'
              : sortBy === 'Price: High to Low'
                ? 'price_high'
                : sortBy === 'Newest First'
                  ? 'newest'
                  : 'newest',
        };

        const result = await getNearbyProperties(searchParams);

        if (result.success) {
          const rawData = result.data.properties || result.data || [];
          if (!isFilteringActive || dynamicFilters.length === 0) {
            setDynamicFilters(result.data.filters || []);
          }

          const normalized = rawData.map((p) => ({
            id: p._id || p.id,
            title: p.projectName || p.title,
            loc:
              p.address?.locality ||
              p.address?.addressLine1 ||
              (typeof p.address === 'string' ? p.address : null) ||
              p.address?.city ||
              'Nearby',
            pricing: {
              expectedPrice: p.financials?.totalPrice || 0,
              pricePerSqft: p.financials?.pricePerSft || 0,
            },
            price: formatPrice(p.financials?.totalPrice || 0),
            img: resolvePropertyImage(p),
            status: p.status,
            beds: p.specifications?.bhkConfig || p.beds,
            size: p.specifications?.builtUpArea || p.size || 'N/A',
            propertyType: p.propertyType?.name || 'Property',
            distance: p.distance,
            completionPercentage: getCompletionPercentage(p),
            financials: p.financials,
            media: p.media,
            address: p.address,
          }));

          if (requestId !== fetchRequestId.current) return;
          setProperties(normalized);
          hasLoadedOnce.current = true;
        }
      } catch (error) {
        if (requestId === fetchRequestId.current) {
          console.error('Failed to fetch nearby properties:', error);
        }
      } finally {
        if (requestId !== fetchRequestId.current) return;
        setIsInitialLoading(false);
        setIsRefetching(false);
      }
    };

    fetchNearby();
  }, [userLocation, locationChecked, debouncedSearchQuery, filters, sortBy, urlCity]);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (document.activeElement !== searchInputRef.current) {
      const element = listingSectionRef.current;
      if (element) {
        const offset = 120;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
      }
    }
  }, [debouncedSearchQuery, filters, sortBy]);

  const clearFilters = () => {
    setFilters({
      minPrice: 0,
      maxPrice: 500000000,
      beds: [],
      status: [],
      facing: '',
      minArea: 0,
      maxArea: 10000,
      vastu: false,
      types: [],
    });
    setSearchQuery('');
    setSortBy('Featured');
  };

  const locationLabel = urlCity ? formatCityName(urlCity) : 'your location';

  const PropertySkeleton = () => (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden animate-pulse">
      <div className="h-[180px] bg-slate-100" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-slate-200 rounded-md w-1/2" />
        <div className="h-4 bg-slate-100 rounded-md w-full" />
        <div className="h-3 bg-slate-100 rounded-md w-3/4" />
      </div>
    </div>
  );

  if (isInitialLoading && !hasLoadedOnce.current) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f8fafc] font-sans">
        <div
          className="w-10 h-10 border-[3px] border-slate-200 border-t-gold rounded-full animate-spin"
          aria-hidden="true"
        />
        <p className="m-0 text-sm font-medium text-slate-500">Discovering properties near you…</p>
      </div>
    );
  }

    return (
      <div className="city-page min-h-screen bg-[#f8fafc] font-sans antialiased">
        {/* TOP NAVIGATION */}
        <div className="w-full bg-white border-b border-slate-200 sticky top-[var(--navbar-height)] z-[100] px-[22px] py-4">
          <div className="max-w-[1350px] mx-auto">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-gold text-sm font-semibold no-underline"
            >
              <ChevronL size={14} /> Back to Home
            </Link>
          </div>
        </div>
  
        {/* NEW LUXURY HERO BANNER */}
        <header className="relative overflow-hidden bg-gradient-to-br from-[#011f16] via-[#023526] to-[#0a1122] py-10 px-[22px] border-b border-[#023526]/30">
          {/* Glow Effects */}
          <div className="absolute top-[-30%] right-[-10%] w-[400px] h-[400px] rounded-full bg-gold/10 filter blur-[80px] pointer-events-none" aria-hidden />
          <div className="absolute bottom-[-20%] left-[-5%] w-[350px] h-[350px] rounded-full bg-primary-400/5 filter blur-[80px] pointer-events-none" aria-hidden />
          <div className="absolute inset-0 opacity-[0.03] bg-size-[24px_24px] bg-image-[linear-gradient(to_right,rgba(197,168,128,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(197,168,128,0.5)_1px,transparent_1px)] pointer-events-none" aria-hidden />
  
          <div className="max-w-[1350px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-gold block mb-1">
                Verified Properties
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white m-0 tracking-tight">
                Properties <span className="text-gold">Near You</span>
              </h1>
              <p className="mt-2 text-sm text-slate-300 max-w-xl leading-relaxed">
                Explore handpicked, premium verified residential and commercial opportunities located close to {locationLabel}.
              </p>
            </div>
  
            <div className="flex flex-col gap-2 w-full max-w-sm shrink-0">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Search Nearby</label>
              <div className="flex items-center gap-3 h-[48px] bg-white/10 backdrop-blur-md border border-white/15 rounded-xl px-4 focus-within:border-gold focus-within:bg-white/15 transition-all duration-300">
                <SearchIco className="w-4 h-4 text-gold shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search project name..."
                  className="w-full bg-transparent border-none outline-none text-sm font-medium text-white placeholder:text-slate-400 h-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
              </div>
              <span className={`text-[11px] font-semibold ${isRefetching ? 'text-gold' : 'text-slate-400'}`}>
                {isRefetching ? 'Updating listings…' : `${properties.length} verified listings available`}
              </span>
            </div>
          </div>
        </header>
  
        {/* FILTER DRAWER — mobile / tablet only */}
        {isDrawerOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] animate-in fade-in duration-300 lg:hidden"
            onClick={() => setIsDrawerOpen(false)}
            role="presentation"
          />
        )}
        <aside
          className={`fixed bottom-0 left-0 right-0 w-full h-[80dvh] bg-white z-[1001] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] rounded-t-[28px] transition-transform duration-300 ease-out flex flex-col p-6 overflow-hidden lg:hidden ${isDrawerOpen ? 'translate-y-0' : 'translate-y-full'}`}
        >
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 shrink-0" />
          <div className="flex items-center justify-between gap-3 mb-6 shrink-0 border-b border-[#f1f5f9] pb-4">
            <h3 className="text-base font-semibold text-slate-900 m-0">Refine Search</h3>
            <button
              type="button"
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
              onClick={() => setIsDrawerOpen(false)}
              aria-label="Close filters"
            >
              <CloseIco className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-1 px-1">
            <GlobalFilters
              dynamicFilters={dynamicFilters}
              filters={filters}
              setFilters={setFilters}
            />
          </div>
          <div className="mt-4 flex gap-3 shrink-0">
            <button
              type="button"
              className="flex-1 h-11 rounded-xl bg-slate-900 text-white text-sm font-semibold cursor-pointer"
              onClick={() => setIsDrawerOpen(false)}
            >
              Apply Filters
            </button>
            <button
              type="button"
              className="flex-1 h-11 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold cursor-pointer"
              onClick={clearFilters}
            >
              Reset All
            </button>
          </div>
        </aside>
  
        {/* MAIN LISTING SECTION */}
        <section ref={listingSectionRef} className="w-full py-8 lg:py-10 px-[22px]">
          <div className="max-w-[1350px] mx-auto w-full flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-10">
            {/* Desktop filters sidebar */}
            <aside className="hidden lg:flex w-[300px] shrink-0 sticky top-[calc(var(--navbar-height)+1rem)] self-start flex-col h-[calc(100dvh-var(--navbar-height)-2rem)]">
              <div className="flex flex-col flex-1 min-h-0 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="shrink-0 flex items-center justify-between gap-3 px-5 pt-5 pb-4 border-b border-slate-100">
                  <h3 className="text-base font-semibold text-slate-900 m-0">Refine Search</h3>
                  {hasActiveFilters && (
                    <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-gold bg-gold/10 px-2 py-1 rounded-full shrink-0">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <GlobalFilters
                    dynamicFilters={dynamicFilters}
                    filters={filters}
                    setFilters={setFilters}
                  />
                </div>
              </div>
            </aside>
  
            <div className="flex-1 min-w-0 w-full">
              <div className="mb-6 pb-4 border-b border-slate-200 flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-slate-500">
                  Showing {properties.length} verified results
                </div>
  
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <div className="flex items-center h-[42px] bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(true)}
                      className="lg:hidden flex items-center gap-2 px-4 h-full hover:bg-slate-50 border-r border-slate-100 group transition-all"
                    >
                      <FilterIco className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-900" />
                      <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 uppercase tracking-widest">
                        Refine
                      </span>
                      {hasActiveFilters && <span className="w-1.5 h-1.5 bg-gold rounded-full" />}
                    </button>
                    <div className="flex items-center gap-2 px-4 h-full">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                        Sort:
                      </span>
                      <select
                        className="bg-transparent border-none text-sm font-semibold text-slate-950 focus:outline-none cursor-pointer appearance-none"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option>Featured</option>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                        <option>Newest First</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="h-[42px] px-4 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 hover:border-slate-300 hover:text-slate-950 transition-colors whitespace-nowrap shadow-sm uppercase tracking-wider"
                    onClick={clearFilters}
                  >
                    Reset All
                  </button>
                </div>
              </div>
  
              <div className="relative min-h-[280px] w-full">
                {isRefetching && (
                  <div
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-white/75 backdrop-blur-[2px] animate-fade-in"
                    aria-live="polite"
                    aria-busy="true"
                  >
                    <div
                      className="w-10 h-10 border-[3px] border-slate-200 border-t-gold rounded-full animate-spin"
                      aria-hidden="true"
                    />
                    <p className="m-0 text-sm font-medium text-slate-600">Updating listings…</p>
                  </div>
                )}
  
                {isInitialLoading && properties.length === 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 w-full">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <PropertySkeleton key={n} />
                    ))}
                  </div>
                ) : properties.length > 0 ? (
                  <div
                    className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 w-full transition-opacity duration-300 ease-out will-change-[opacity] ${isRefetching ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}
                  >
                    {properties.map((p) => (
                      <PropertyCard key={p.id} property={p} variant="variation2" />
                    ))}
                  </div>
                ) : (
                  <div
                    className={`w-full text-center py-20 border border-dashed border-slate-200 rounded-2xl bg-white transition-opacity duration-300 ${isRefetching ? 'opacity-40' : 'opacity-100'}`}
                  >
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      No Properties Nearby
                    </h3>
                    <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                      We couldn&apos;t find any properties matching your criteria near {locationLabel}
                      . Try adjusting filters or exploring other cities.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        className="h-11 px-8 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark active:scale-95 transition-all"
                        onClick={clearFilters}
                      >
                        Clear All Filters
                      </button>
                      <Link
                        to="/"
                        className="h-11 px-8 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold no-underline inline-flex items-center hover:bg-slate-50"
                      >
                        Explore Cities
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
  );
};

export default NearbyPropertiesPage;
