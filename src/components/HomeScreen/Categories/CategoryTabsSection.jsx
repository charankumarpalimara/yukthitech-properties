import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyCard from '../../PropertyCard/PropertyCard';
import { API_URL } from '../../../service/api';
import { resolveCategoryImage } from '../../../utils/imageSizes';
import { slugOrId } from '../../../utils/slugOrId';
import { getCompletionPercentage } from '../../../utils/propertyCompletion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import './CategoryTabsSection.css';

// ── Fallback static categories (used before API data loads) ─────────────────
const FALLBACK_CATEGORIES = [
  {
    name: 'Apartments',
    img: '/categories/luxury_apartments_portrait_1776492494419.png',
    id: 'Apartments',
  },
  {
    name: 'Villas',
    img: '/categories/villas_1776438506118.png',
    id: 'Villas',
  },
  {
    name: 'Commercial',
    img: '/categories/commercial_1776438564126.png',
    id: 'Commercial',
  },
  {
    name: 'New Projects',
    img: '/categories/projects_1776439106753.png',
    id: 'New Projects',
  },
  {
    name: 'Plots & Land',
    img: '/categories/land_1776439133923.png',
    id: 'Plots-Land',
  },
];

const formatPrice = (p) => {
  if (!p || p === 0) return 'Price on Request';
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
  return `₹${p.toLocaleString('en-IN')}`;
};

function PropertySkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse shadow-sm">
      <div className="aspect-[4/3] bg-slate-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
        <div className="h-3 bg-slate-50 rounded-lg w-1/2" />
        <div className="h-5 bg-slate-100 rounded-lg w-1/3 mt-2" />
      </div>
    </div>
  );
}

export default function CategoryTabsSection({ categories: apiCategories }) {
  const navigate = useNavigate();
  const tabsRef = useRef(null);
  const fetchRef = useRef(0);
  const contentRef = useRef(null);

  // ── Build display list ─────────────────────────────────────────────────────
  const displayCats =
    apiCategories?.length > 0
      ? apiCategories.map((c) => ({
        name: c.name,
        img: resolveCategoryImage(
          c.image || '/categories/luxury_apartments_portrait_1776492494419.png',
          120
        ),
        id: slugOrId(c) || c.name,
        rawId: slugOrId(c) || c.name,
      }))
      : FALLBACK_CATEGORIES.map((c) => ({
        ...c,
        img: resolveCategoryImage(c.img, 120),
        rawId: c.id,
      }));

  const [activeId, setActiveId] = useState('');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // ── Fetch properties for active category ──────────────────────────────────
  const fetchProperties = useCallback(async (catId) => {
    if (!catId) {
      setProperties([]);
      setLoading(false);
      return;
    }
    const reqId = ++fetchRef.current;
    setLoading(true);
    setProperties([]);
    try {
      const res = await fetch(`${API_URL}/categories/properties/${catId}?limit=8`);
      const json = await res.json();
      if (reqId !== fetchRef.current) return;
      if (json.success) {
        const raw = json.data?.properties || json.data || [];
        const normalized = raw.slice(0, 8).map((p) => ({
          id: p._id,
          slug: slugOrId(p),
          title: p.projectName,
          loc: p.address?.city || p.address?.locality || 'India',
          pricing: {
            expectedPrice: p.financials?.totalPrice || 0,
            pricePerSqft: p.financials?.pricePerSft || 0,
          },
          price: formatPrice(p.financials?.totalPrice),
          img:
            p.media?.poster ||
            p.media?.posterThumb ||
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=700&q=80',
          status: p.status,
          propertyType: p.propertyType?.name || 'Property',
          completionPercentage: getCompletionPercentage(p),
          financials: p.financials,
          media: p.media,
          address: p.address,
        }));
        setProperties(normalized);
      }
    } catch {
      if (reqId === fetchRef.current) setProperties([]);
    } finally {
      if (reqId === fetchRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties(activeId);
  }, [activeId, fetchProperties]);

  // ── Tab scroll arrows ─────────────────────────────────────────────────────
  const checkScroll = useCallback(() => {
    const el = tabsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  const scrollTabs = (dir) => {
    tabsRef.current?.scrollBy({ left: dir * 240, behavior: 'smooth' });
  };

  const handleTabClick = (cat) => {
    if (cat.rawId === activeId) {
      // Second click on the same tab → deselect / collapse panel
      setActiveId('');
      setProperties([]);
      return;
    }
    setActiveId(cat.rawId);
    // Smooth scroll content into view (not the tab bar)
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 60);
  };

  const activeCat = displayCats.find((c) => c.rawId === activeId);

  return (
    <section className="relative bg-white border-y border-slate-100" aria-label="Browse by category">
      {/* ── TAB BAR ─────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1350px] px-[22px] sm:px-8 lg:px-12">
        <div className="relative">
          {/* Left scroll arrow */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollTabs(-1)}
              aria-label="Scroll categories left"
              className="cat-scroll-arrow cat-scroll-arrow--left"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          {/* Tabs row */}
          <div
            ref={tabsRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide py-4"
            role="tablist"
            aria-label="Property categories"
          >
            {displayCats.map((cat) => {
              const isActive = cat.rawId === activeId;
              return (
                <button
                  key={cat.rawId}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="category-panel"
                  onClick={() => handleTabClick(cat)}
                  className={`cat-tab flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#023526] ${isActive
                    ? 'cat-tab--active border-[#023526] bg-[#023526]'
                    : 'border-slate-200 bg-white hover:border-[#023526]/30 hover:bg-[#023526]/3'
                    }`}
                >
                  {/* Thumbnail */}
                  <span className="relative flex-shrink-0 w-8 h-8 rounded-xl overflow-hidden border border-white/20 shadow-sm">
                    <img
                      src={cat.img}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      className={`w-full h-full object-cover transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}
                    />
                    {isActive && (
                      <span className="absolute inset-0 bg-[#023526]/20" />
                    )}
                  </span>

                  {/* Label */}
                  <span
                    className={`text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-600'
                      }`}
                  >
                    {cat.name}
                  </span>

                  {/* Active underline indicator */}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880] flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right scroll arrow */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollTabs(1)}
              aria-label="Scroll categories right"
              className="cat-scroll-arrow cat-scroll-arrow--right"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Bottom border accent — only visible when panel is open */}
      {activeId && (
        <div className="h-px bg-gradient-to-r from-transparent via-[#023526]/15 to-transparent" />
      )}

      {/* ── PROPERTIES PANEL — hidden when nothing is selected ──────────────── */}
      <div
        id="category-panel"
        role="tabpanel"
        aria-label={`${activeCat?.name || 'Category'} properties`}
        ref={contentRef}
        className={`mx-auto max-w-[1350px] px-[22px] sm:px-8 lg:px-12 overflow-hidden transition-all duration-300 ${activeId ? 'py-8 opacity-100 max-h-[9999px]' : 'py-0 opacity-0 max-h-0 pointer-events-none'
          }`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight m-0">
              {activeCat?.name || 'Properties'}
              {!loading && properties.length > 0 && (
                <span className="ml-2 text-sm font-medium text-slate-400">
                  ({properties.length} listings)
                </span>
              )}
            </h2>
            <p className="text-sm text-slate-400 font-light mt-0.5 m-0">
              Verified {activeCat?.name?.toLowerCase() || 'properties'} across top Indian cities
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/category/${activeId}`)}
            className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-sm font-semibold text-[#023526] border border-[#023526]/20 bg-[#023526]/4 hover:bg-[#023526] hover:text-white hover:border-[#023526] transition-all duration-200 group"
          >
            View All
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <PropertySkeleton key={n} />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="cat-panel-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {properties.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                variant={
                  activeCat?.name?.toLowerCase().includes('land') ||
                    activeCat?.name?.toLowerCase().includes('plot')
                    ? 'land'
                    : 'vertical'
                }
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 mx-auto mb-4 flex items-center justify-center">
              {activeCat?.img ? (
                <img src={activeCat.img} alt="" className="w-10 h-10 object-cover rounded-xl" />
              ) : (
                <span className="text-2xl">🏠</span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-slate-700 m-0">No listings found</h3>
            <p className="text-sm text-slate-400 mt-1 mb-5">
              We&apos;re adding new {activeCat?.name?.toLowerCase()} daily. Check back soon!
            </p>
            <button
              type="button"
              onClick={() => navigate(`/category/${activeId}`)}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-2xl bg-[#023526] text-white text-sm font-semibold hover:bg-[#034432] transition-colors"
            >
              Explore {activeCat?.name}
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Mobile "View All" */}
        {!loading && properties.length > 0 && (
          <div className="flex justify-center mt-8 sm:hidden">
            <button
              type="button"
              onClick={() => navigate(`/category/${activeId}`)}
              className="inline-flex items-center gap-1.5 px-6 py-3 rounded-2xl text-sm font-semibold text-[#023526] border border-[#023526]/20 bg-[#023526]/4 hover:bg-[#023526] hover:text-white transition-all duration-200 group"
            >
              View All {activeCat?.name}
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
