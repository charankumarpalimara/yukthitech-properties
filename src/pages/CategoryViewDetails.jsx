import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard/PropertyCard';
import GlobalFilters from '../components/GlobalFilters/GlobalFilters';
import { API_URL } from '../service/api';
import { ChevronL, SearchIco, FilterIco, CloseIco } from '../data/icons';
import './CityPropertiesPage.css';
import { slugOrId } from '../utils/slugOrId';
import { getCompletionPercentage } from '../utils/propertyCompletion';

const CATEGORY_DESCRIPTIONS = {
  Apartments: 'Premium urban dwellings with modern amenities and connected lifestyles.',
  Villas: 'Exquisite independent homes offering privacy, luxury, and curated spaces.',
  Commercial: 'Prime business locations and office spaces designed for corporate excellence.',
  'New Projects': 'Be the first to own. Explore upcoming and under-construction developments.',
  'Plots-Land': 'Premium residential and agricultural lands in high-growth investment zones.',
};

const CategoryViewDetails = () => {
  const { id } = useParams();
  const [properties, setProperties] = useState([]);
  const [category, setCategory] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Featured');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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
      searchQuery !== ''
    );
  }, [filters, searchQuery]);
  const toolbarRef = useRef(null);
  const searchInputRef = useRef(null);
  const hasLoadedOnce = useRef(false);
  const fetchRequestId = useRef(0);

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  const formatPrice = (p) => {
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
    return `₹${p}`;
  };

  useEffect(() => {
    const fetchCategoryMetadata = async () => {
      try {
        const response = await fetch(`${API_URL}/categories/${id}`);
        const result = await response.json();
        if (result.success) setCategory(result.data);
      } catch (error) {
        console.error('Failed to fetch category metadata:', error);
      }
    };
    if (id) fetchCategoryMetadata();
  }, [id]);

  useEffect(() => {
    hasLoadedOnce.current = false;
    setProperties([]);
    setIsInitialLoading(true);
    setIsRefetching(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  useEffect(() => {
    const fetchCategoryData = async () => {
      const requestId = ++fetchRequestId.current;
      const isFirstLoad = !hasLoadedOnce.current;

      if (isFirstLoad) {
        setIsInitialLoading(true);
      } else {
        setIsRefetching(true);
      }

      try {
        const queryParams = new URLSearchParams({
          search: debouncedSearchQuery,
          minPrice: filters.minPrice > 0 ? filters.minPrice : '',
          maxPrice: filters.maxPrice < 500000000 ? filters.maxPrice : '',
          facing: filters.facing || '',
          minArea: filters.minArea > 0 ? filters.minArea : '',
          maxArea: filters.maxArea < 10000 ? filters.maxArea : '',
          ...(filters.vastu ? { vastuCompliant: 'true' } : {}),
          sortBy:
            sortBy === 'Price: Low to High'
              ? 'price_low'
              : sortBy === 'Price: High to Low'
                ? 'price_high'
                : sortBy === 'Newest First'
                  ? 'newest'
                  : '',
        });
        filters.beds.forEach((bed) => queryParams.append('bhk', bed));
        filters.status.forEach((stat) => queryParams.append('propertyStatus', stat));

        const response = await fetch(
          `${API_URL}/categories/properties/${id}?${queryParams.toString()}`
        );
        const result = await response.json();
        if (result.success) {
          const rawData = result.data.properties || result.data || [];
          if (!isFilteringActive || dynamicFilters.length === 0) {
            setDynamicFilters(result.data.filters || []);
          }

          const normalized = rawData.map((p) => ({
            id: p._id,
            slug: slugOrId(p),
            title: p.projectName,
            loc: p.address?.city || 'Unknown Location',
            pricing: {
              expectedPrice: p.financials?.totalPrice || 0,
              pricePerSqft: p.financials?.pricePerSft || 0,
            },
            price: formatPrice(p.financials?.totalPrice || 0),
            img:
              p.media?.poster ||
              'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=700&q=80',
            status: p.status,
            propertyType: p.propertyType?.name || 'Property',
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
          console.error('Failed to fetch category properties:', error);
        }
      } finally {
        if (requestId !== fetchRequestId.current) return;
        setIsInitialLoading(false);
        setIsRefetching(false);
      }
    };
    fetchCategoryData();
  }, [id, debouncedSearchQuery, filters, sortBy]);

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

  const categoryName = category?.name || 'Properties';

  const PropertySkeleton = () => (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 animate-pulse">
      <div className="aspect-[4/3] bg-slate-100" />
      <div className="p-5 space-y-4">
        <div className="h-5 bg-slate-200 rounded-md w-3/4" />
        <div className="h-3 bg-slate-100 rounded-md w-1/2" />
      </div>
    </div>
  );

  if (isInitialLoading && !hasLoadedOnce.current && !category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f8fafc]">
        <div
          className="w-10 h-10 border-[3px] border-slate-200 border-t-gold rounded-full animate-spin"
          aria-hidden="true"
        />
        <p className="m-0 text-sm font-medium text-slate-500">Loading category…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] lg:hidden"
          onClick={() => setIsDrawerOpen(false)}
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
            className="p-2 rounded-lg bg-slate-100 text-slate-500"
            onClick={() => setIsDrawerOpen(false)}
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
            className="flex-1 h-11 rounded-xl bg-slate-900 text-white font-semibold"
            onClick={() => setIsDrawerOpen(false)}
          >
            Apply Filters
          </button>
          <button
            type="button"
            className="flex-1 h-11 rounded-xl bg-slate-100 text-slate-600 font-semibold"
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
              Verified Properties
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white m-0 tracking-tight">
              Category · <span className="text-gold">{categoryName}</span>
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-xl leading-relaxed">
              {CATEGORY_DESCRIPTIONS[categoryName] || `Explore our premium selection of verified ${categoryName} properties.`}
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full max-w-sm shrink-0">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Search Category</label>
            <div className="flex items-center gap-3 h-[48px] bg-white/10 backdrop-blur-md border border-white/15 rounded-xl px-4 focus-within:border-gold focus-within:bg-white/15 transition-all duration-300">
              <SearchIco className="w-4 h-4 text-gold shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={`Search in ${categoryName}...`}
                className="w-full bg-transparent border-none outline-none text-sm font-medium text-white placeholder:text-slate-400 h-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <span className={`text-[11px] font-semibold ${isRefetching ? 'text-gold' : 'text-slate-400'}`}>
              {isRefetching ? 'Updating listings…' : `${properties.length} verified listings available`}
            </span>
          </div>
        </div>
      </header>

      <section className="w-full py-8 px-[22px]" ref={toolbarRef}>
        <div className="w-full flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-10">
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

          <main className="flex-1 min-w-0 w-full">
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
                  className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 w-full transition-opacity duration-300 ease-out ${isRefetching ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}
                >
                  {properties.map((p) => (
                    <PropertyCard
                      key={p.id}
                      property={p}
                      variant={categoryName.toLowerCase().includes('land') ? 'land' : 'vertical'}
                    />
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
          </main>

          {/* <aside className="w-[360px] sticky top-[100px] max-xl:w-full max-xl:static">
            <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 rounded-full bg-gold/10 text-gold text-[0.65rem] font-bold uppercase tracking-widest mb-3">Market Intel</span>
                <h3 className="text-2xl font-bold text-slate-900 leading-tight">Market Pulse: <span className="text-gold">{categoryName}</span></h3>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6">
                <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-4">Price Trends (2022-2024)</p>
                <div className="flex items-end gap-3 h-[80px] mb-4">
                  <div className="flex-1 bg-slate-200 rounded-t-md" style={{ height: '40%' }} />
                  <div className="flex-1 bg-slate-300 rounded-t-md" style={{ height: '65%' }} />
                  <div className="flex-1 bg-gold rounded-t-md" style={{ height: '90%' }} />
                </div>
                <p className="text-emerald-600 text-xs font-bold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> +12.4% appreciation
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 border-y border-slate-100 py-6 mb-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-900">{properties.length}</div>
                  <div className="text-[0.6rem] font-bold text-slate-400 uppercase">Live</div>
                </div>
                <div className="text-center border-x border-slate-100">
                  <div className="text-lg font-bold text-slate-900">0%</div>
                  <div className="text-[0.6rem] font-bold text-slate-400 uppercase">Fees</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-900">Full</div>
                  <div className="text-[0.6rem] font-bold text-slate-400 uppercase">Direct</div>
                </div>
              </div>
              <p className="text-slate-500 text-sm italic mb-6">"Connect with our experts for premium guidance on {categoryName}."</p>
              <Link to="/contact-us" className="h-12 w-full rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center gap-2 hover:bg-gold/80 transition-all no-underline">
                Connect Now <ArrowR size={16} />
              </Link>
            </div>
          </aside> */}
        </div>
      </section>
    </div>
  );
};

export default CategoryViewDetails;
