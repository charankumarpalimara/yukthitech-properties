import { useState, useMemo, useEffect, startTransition, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cityPagePath, preloadCityPage } from '../../utils/preloadRoutes';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { CloseIco, SearchIco } from '../../data/icons';
import { resolveCityCardImage } from '../../utils/imageSizes';
import HomeSectionHeader from '../HomeScreen/HomeSectionHeader';
import { formatCityName } from '../../utils/formatCityName';
import { CITIES } from '../../data/constants';
import 'swiper/css';
import 'swiper/css/navigation';

export default function Cities({ isSidebarOpen, popularCities }) {
  const cities = popularCities || CITIES || [];
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const goToCity = useCallback(
    (name) => {
      setIsModalOpen(false);
      preloadCityPage();
      startTransition(() => {
        navigate(cityPagePath(name));
      });
    },
    [navigate]
  );

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const filteredCities = useMemo(
    () => cities.filter((city) => city.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [cities, searchQuery]
  );

  if (!cities.length) return null;

  return (
    <section className="w-full">
      <HomeSectionHeader
        eyebrow="Browse by location"
        title="Search by City"
        subtitle="Discover homes, plots & commercial spaces across India's top cities"
        viewAllLabel="View all cities"
        showNav
        prevClass="city-prev-btn"
        nextClass="city-next-btn"
        onViewAllClick={() => setIsModalOpen(true)}
      />

      <div className="home-feed__carousel">
        <Swiper
          key={isSidebarOpen ? 'open' : 'close'}
          modules={[Navigation]}
          spaceBetween={14}
          slidesPerView={2.2}
          navigation={{
            prevEl: '.city-prev-btn',
            nextEl: '.city-next-btn',
          }}
          breakpoints={{
            480: { slidesPerView: 2.8, spaceBetween: 14 },
            768: { slidesPerView: 3.5, spaceBetween: 16 },
            1024: { slidesPerView: 4.2, spaceBetween: 18 },
            1280: { slidesPerView: 5, spaceBetween: 20 },
          }}
          className="!overflow-hidden"
        >
          {cities.map((city) => (
            <SwiperSlide key={city.name}>
              {/* ── Unified card ── */}
              <div
                className="group cursor-pointer rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(2,53,38,0.12)] hover:border-[#023526]/20"
                onMouseEnter={preloadCityPage}
                onClick={() => goToCity(city.name)}
                onKeyDown={(e) => e.key === 'Enter' && goToCity(city.name)}
                role="button"
                tabIndex={0}
                aria-label={`Explore properties in ${formatCityName(city.name)}`}
              >
                {/* image */}
                <div className="relative h-[150px] overflow-hidden bg-slate-100">
                  <img
                    src={resolveCityCardImage(city.image, 480)}
                    alt={city.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent" />
                  <span className="absolute top-2.5 right-2.5 inline-flex items-center rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-white">
                    {city.propertyCount ?? '—'} listings
                  </span>
                </div>

                {/* body */}
                <div className="flex items-center justify-between px-3.5 py-3">
                  <div>
                    <p className="m-0 text-[14.5px] font-bold text-slate-900 leading-tight">
                      {formatCityName(city.name)}
                    </p>
                    <p className="m-0 text-[11px] text-slate-400 font-medium mt-0.5">
                      {city.propertyCount ? `${city.propertyCount} properties available` : 'Properties available'}
                    </p>
                  </div>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-100 text-slate-400 transition-all duration-200 group-hover:bg-[#023526] group-hover:border-[#023526] group-hover:text-white">
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* animated bottom accent */}
                <div className="h-[3px] w-0 bg-gradient-to-r from-[#c5a880] to-[#023526] transition-all duration-300 group-hover:w-full" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ── All Cities Modal ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:p-6"
          onClick={() => setIsModalOpen(false)}
          role="presentation"
        >
          <div
            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cities-modal-title"
          >
            {/* header */}
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4 sm:px-8">
              <div>
                <h3 id="cities-modal-title" className="text-lg font-bold text-slate-900">
                  All Cities
                </h3>
                <p className="mt-0.5 text-sm text-slate-500">{cities.length} cities available</p>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
              >
                <CloseIco className="h-4 w-4" />
              </button>
            </div>

            {/* search */}
            <div className="border-b border-slate-100 px-6 py-3 sm:px-8">
              <div className="flex h-11 items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 focus-within:border-[#023526] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#023526]/10 transition-all">
                <SearchIco className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search city…"
                  className="flex-1 border-none bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Clear search"
                  >
                    <CloseIco className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* grid */}
            <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-8">
              {filteredCities.length > 0 ? (
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {filteredCities.map((city) => (
                    <button
                      key={city.name}
                      type="button"
                      className="flex items-center gap-3 rounded-xl border border-slate-100 p-2.5 text-left transition-all hover:border-[#023526]/30 hover:bg-[#023526]/4 group"
                      onMouseEnter={preloadCityPage}
                      onClick={() => goToCity(city.name)}
                    >
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        <img
                          src={resolveCityCardImage(city.image, 88)}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="m-0 truncate text-sm font-semibold text-slate-900 group-hover:text-[#023526] transition-colors">
                          {formatCityName(city.name)}
                        </p>
                        <p className="m-0 text-[11px] font-medium text-slate-400">
                          {city.propertyCount ?? '—'} listings
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="py-12 text-center text-sm text-slate-500">
                  No cities match &quot;{searchQuery}&quot;.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
