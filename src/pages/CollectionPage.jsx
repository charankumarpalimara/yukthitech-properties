import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard/PropertyCard';
import { SearchIco, ChevronL, FilterIco, CloseIco, ArrowR } from '../data/icons';
import { API_URL, apiClient } from '../service/api';
import GlobalFilters from '../components/GlobalFilters/GlobalFilters';
import { slugOrId } from '../utils/slugOrId';
import { getCompletionPercentage } from '../utils/propertyCompletion';

const formatPrice = (p) => {
  if (!p) return 'Price on Request';
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
  return `₹${p.toLocaleString()}`;
};

const formatProperty = (backendProp) => {
  return {
    id: backendProp._id || backendProp.id,
    title: backendProp.projectName || backendProp.title || 'Premium Property',
    slug: slugOrId(backendProp),
    propertyType: backendProp.propertyType,
    img:
      backendProp.media?.poster ||
      backendProp.img ||
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=700&q=80',
    loc:
      [
        backendProp.address?.addressLine1,
        backendProp.address?.addressLine2,
        backendProp.address?.city,
      ]
        .filter(Boolean)
        .join(', ') ||
      backendProp.loc ||
      'Hyderabad',
    price: formatPrice(backendProp.financials?.totalPrice) || backendProp.price,
    size: backendProp.financials?.priceUnit
      ? `1 ${backendProp.financials.priceUnit}`
      : backendProp.size || 'Contact for Info',
    badge: backendProp.status === 'verified' ? 'Verified' : '',
    rating: '4.5',
    beds: backendProp.beds || 0,
    baths: backendProp.baths || 0,
    direction: backendProp.direction || 'East',
    completionPercentage: getCompletionPercentage(backendProp),
    financials: backendProp.financials,
    media: backendProp.media,
    address: backendProp.address,
  };
};

const resolveCollectionSectionId = (paramId, pathname) => {
  if (paramId) return paramId;
  const path = (pathname || '').replace(/^\/+/, '');
  if (
    path === 'featured-properties' ||
    path === 'premium-properties' ||
    path === 'top-budget-properties'
  ) {
    return path;
  }
  if (path.startsWith('collection/')) return path.slice('collection/'.length);
  return path || null;
};

const CollectionPage = () => {
  const { id: paramId } = useParams();
  const { pathname } = useLocation();
  const id = resolveCollectionSectionId(paramId, pathname);
  const isTopBudgetCollection = id === 'top-budget-properties';
  const [sectionData, setSectionData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [sortBy, setSortBy] = useState(isTopBudgetCollection ? 'Price: High to Low' : 'Featured');
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
  const isFilteringActive = useMemo(() => {
    return (
      filters.minPrice > 0 ||
      filters.maxPrice < 500000000 ||
      filters.beds.length > 0 ||
      filters.status.length > 0 ||
      filters.facing !== '' ||
      filters.minArea > 0 ||
      filters.maxArea < 10000 ||
      filters.vastu ||
      filters.types.length > 0 ||
      searchQuery !== ''
    );
  }, [filters, searchQuery]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const islandRef = useRef(null);
  const searchInputRef = useRef(null);
  const isFirstMount = useRef(true);
  const hasLoadedOnce = useRef(false);
  const fetchRequestId = useRef(0);

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  const hasActiveFilters =
    filters.beds.length > 0 ||
    filters.status.length > 0 ||
    filters.facing ||
    filters.minPrice > 0 ||
    filters.maxPrice < 500000000 ||
    filters.minArea > 0 ||
    filters.maxArea < 10000 ||
    filters.vastu ||
    filters.types.length > 0;

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onBreakpoint = () => {
      if (mq.matches) setIsDrawerOpen(false);
    };
    mq.addEventListener('change', onBreakpoint);
    return () => mq.removeEventListener('change', onBreakpoint);
  }, []);

  useEffect(() => {
    hasLoadedOnce.current = false;
    setSectionData(null);
    setIsInitialLoading(true);
    setIsRefetching(false);
    setSortBy(id === 'top-budget-properties' ? 'Price: High to Low' : 'Featured');
  }, [id]);

  useEffect(() => {
    const fetchSection = async () => {
      if (!id) {
        setIsInitialLoading(false);
        setIsRefetching(false);
        return;
      }

      const requestId = ++fetchRequestId.current;
      const isFirstLoad = !hasLoadedOnce.current;

      if (isFirstLoad) {
        setIsInitialLoading(true);
      } else {
        setIsRefetching(true);
      }

      try {
        const searchParams = new URLSearchParams();
        if (debouncedSearchQuery) searchParams.append('search', debouncedSearchQuery);
        if (filters.minPrice > 0) searchParams.append('minPrice', filters.minPrice);
        if (filters.maxPrice < 500000000) searchParams.append('maxPrice', filters.maxPrice);
        if (filters.facing) searchParams.append('facing', filters.facing);
        if (filters.minArea > 0) searchParams.append('minArea', filters.minArea);
        if (filters.maxArea < 10000) searchParams.append('maxArea', filters.maxArea);
        if (filters.beds.length > 0) {
          filters.beds.forEach((b) => searchParams.append('bhk', b));
        }
        if (filters.status.length > 0) {
          filters.status.forEach((s) => searchParams.append('propertyStatus', s));
        }
        if (filters.vastu) searchParams.append('vastu', 'true');
        if (filters.types && filters.types.length > 0) {
          filters.types.forEach((t) => searchParams.append('propertyTypes', t));
        }

        const sortApiValue =
          sortBy === 'Price: Low to High'
            ? 'price_low'
            : sortBy === 'Price: High to Low'
              ? 'price_high'
              : sortBy === 'Newest First'
                ? 'newest'
                : '';

        if (sortApiValue) searchParams.append('sortBy', sortApiValue);
        if (isTopBudgetCollection) {
          searchParams.set('limit', '30');
          if (!sortApiValue) searchParams.set('sortBy', 'price_high');
        }

        const response = await apiClient(
          `${API_URL}/dynamic-section/${id}?${searchParams.toString()}`
        );
        const data = await response.json();
        if (data.success) {
          if (requestId !== fetchRequestId.current) return;

          setSectionData(data.data);
          if (!isFilteringActive || dynamicFilters.length === 0) {
            setDynamicFilters(data.data.filters || []);
          }
          hasLoadedOnce.current = true;
        }
      } catch (error) {
        if (requestId === fetchRequestId.current) {
          console.error('Error fetching section:', error);
        }
      } finally {
        if (requestId !== fetchRequestId.current) return;
        setIsInitialLoading(false);
        setIsRefetching(false);
      }
    };
    fetchSection();
  }, [id, debouncedSearchQuery, filters, sortBy, isTopBudgetCollection]);

  // Handle smooth scroll when filters/sorting/search triggers
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (document.activeElement !== searchInputRef.current) {
      const element = islandRef.current;
      if (element) {
        const offset = 120; // height of sticky navbar
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }
  }, [debouncedSearchQuery, filters, sortBy]);

  // Scroll to top when collection id changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const properties = useMemo(() => {
    if (!sectionData || !sectionData.properties) return [];
    return sectionData.properties.map((p) => formatProperty(p));
  }, [sectionData]);

  const filteredProperties = useMemo(() => {
    if (!properties) return [];
    if (isTopBudgetCollection) return properties;

    let results = [...properties];

    if (sortBy === 'Price: Low to High') {
      results.sort(
        (a, b) =>
          (parseInt(a.price?.replace(/[^0-9]/g, '')) || 0) -
          (parseInt(b.price?.replace(/[^0-9]/g, '')) || 0)
      );
    } else if (sortBy === 'Price: High to Low') {
      results.sort(
        (a, b) =>
          (parseInt(b.price?.replace(/[^0-9]/g, '')) || 0) -
          (parseInt(a.price?.replace(/[^0-9]/g, '')) || 0)
      );
    } else if (sortBy === 'Newest First') {
      results.reverse();
    }

    return results;
  }, [properties, sortBy, isTopBudgetCollection]);

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

  const handleBHKToggle = (bhk) => {
    setFilters((prev) => ({
      ...prev,
      beds: prev.beds.includes(bhk) ? prev.beds.filter((b) => b !== bhk) : [...prev.beds, bhk],
    }));
  };

  const CollectionSkeleton = () => (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden animate-pulse">
      <div className="h-[160px] bg-slate-100" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-2/3" />
        <div className="h-3 bg-slate-100 rounded w-full" />
      </div>
    </div>
  );

  if (isInitialLoading && !hasLoadedOnce.current) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f8fafc]">
        <div
          className="w-10 h-10 border-[3px] border-slate-200 border-t-amber-500 rounded-full animate-spin"
          aria-hidden="true"
        />
        <p className="m-0 text-sm font-medium text-slate-500">Loading collection…</p>
      </div>
    );
  }

  if (!sectionData) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Collection Not Found</h2>
          <Link to="/" className="text-gold font-semibold hover:underline no-underline">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-12">
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] lg:hidden"
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
            <CloseIco size={20} />
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
              Curated Collections
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white m-0 tracking-tight">
              Collection · <span className="text-gold">{sectionData.name}</span>
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-xl leading-relaxed">
              Explore handpicked, premium verified residential and commercial opportunities curated in this exclusive collection.
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full max-w-sm shrink-0">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Search Collection</label>
            <div className="flex items-center gap-3 h-[48px] bg-white/10 backdrop-blur-md border border-white/15 rounded-xl px-4 focus-within:border-gold focus-within:bg-white/15 transition-all duration-300">
              <SearchIco className="w-4 h-4 text-gold shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search in collection..."
                className="w-full bg-transparent border-none outline-none text-sm font-medium text-white placeholder:text-slate-400 h-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
            </div>
            <span className={`text-[11px] font-semibold ${isRefetching ? 'text-gold' : 'text-slate-400'}`}>
              {isRefetching ? 'Updating listings…' : `${filteredProperties.length} verified listings available`}
            </span>
          </div>
        </div>
      </header>

      <section className="w-full py-8 px-[22px]" ref={islandRef}>
        <div className="w-full flex flex-col lg:flex-row lg:items-stretch gap-6 lg:gap-8">
          <aside className="hidden lg:flex w-[300px] shrink-0 sticky top-[calc(var(--navbar-height)+1rem)] self-start flex-col h-[calc(100dvh-var(--navbar-height)-2rem)]">
            <div className="flex flex-col flex-1 min-h-0 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="shrink-0 flex items-center justify-between gap-3 px-5 pt-5 pb-4 border-b border-slate-100">
                <h3 className="text-base font-semibold text-slate-900 m-0">Refine Search</h3>
                {hasActiveFilters && (
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-gold bg-gold/10 px-2 py-1 rounded-full shrink-0">
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
                Showing {filteredProperties.length} verified results
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

              {isInitialLoading && filteredProperties.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8 w-full">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <CollectionSkeleton key={n} />
                  ))}
                </div>
              ) : filteredProperties.length > 0 ? (
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 gap-2 lg:gap-4 w-full transition-opacity duration-300 ease-out ${isRefetching ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}
                >
                  {filteredProperties.map((p) => (
                    <PropertyCard key={p.id} property={p} variant="vertical" />
                  ))}
                </div>
              ) : (
                <div
                  className={`w-full text-center py-20 border border-dashed border-slate-200 rounded-2xl bg-white transition-opacity ${isRefetching ? 'opacity-40' : 'opacity-100'}`}
                >
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No Properties Found</h3>
                  <p className="text-sm text-slate-500 mb-6">
                    Try adjusting your filters or search terms.
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="h-11 px-8 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CollectionPage;
