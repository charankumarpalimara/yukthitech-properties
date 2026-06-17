import { useState, useMemo, useEffect, useRef, startTransition, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cityPagePath, preloadCityPage } from '../../utils/preloadRoutes';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { CloseIco, SearchIco, ChevronL, ChevronR } from '../../data/icons';
import { useMaxWidth } from '../../hooks/useMediaQuery';
import { bindSwiperNavigation } from '../../utils/bindSwiperNavigation';
import { resolveCityCardImage } from '../../utils/imageSizes';
import HomeSectionHeader from '../HomeScreen/HomeSectionHeader';
import {
  HOME_CAROUSEL_NAV_OVERLAY_PREV,
  HOME_CAROUSEL_NAV_OVERLAY_NEXT,
} from '../HomeScreen/homeTypographyStyles';
import { formatCityName } from '../../utils/formatCityName';
import { CITIES } from '../../data/constants';
import 'swiper/css';
import 'swiper/css/navigation';

const PREV_CLASS = 'city-prev-btn';
const NEXT_CLASS = 'city-next-btn';

export default function Cities({ isSidebarOpen, popularCities }) {
  const cities = popularCities || CITIES || [];
  const navigate = useNavigate();
  const swiperRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isBelowLg = useMaxWidth(1023);

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

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    bindSwiperNavigation(swiper, `.${PREV_CLASS}`, `.${NEXT_CLASS}`);
  }, [isBelowLg]);

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
        navLayout="split"
        prevClass={PREV_CLASS}
        nextClass={NEXT_CLASS}
        onViewAllClick={() => setIsModalOpen(true)}
      />

      <div className="home-feed__carousel relative">
        {isBelowLg && (
          <>
            <button
              type="button"
              className={`${PREV_CLASS} ${HOME_CAROUSEL_NAV_OVERLAY_PREV}`}
              aria-label="Previous"
            >
              <ChevronL className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </button>
            <button
              type="button"
              className={`${NEXT_CLASS} ${HOME_CAROUSEL_NAV_OVERLAY_NEXT}`}
              aria-label="Next"
            >
              <ChevronR className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </button>
          </>
        )}
        <Swiper
          key={`${isSidebarOpen ? 'open' : 'close'}-${isBelowLg ? 'm' : 'd'}`}
          modules={[Navigation]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            bindSwiperNavigation(swiper, `.${PREV_CLASS}`, `.${NEXT_CLASS}`);
          }}
          spaceBetween={3}
          slidesPerView={3.4}
          navigation={{
            prevEl: `.${PREV_CLASS}`,
            nextEl: `.${NEXT_CLASS}`,
          }}
          breakpoints={{
            480: { slidesPerView: 4.2, spaceBetween: 14 },
            768: { slidesPerView: 5.5, spaceBetween: 16 },
            1024: { slidesPerView: 6.5, spaceBetween: 18 },
            1280: { slidesPerView: 7.5, spaceBetween: 20 },
          }}
          className="!overflow-hidden"
        >
          {cities.map((city) => (
            <SwiperSlide key={city.name} className="!h-auto">
              <div
                className="group flex cursor-pointer flex-col items-center px-1 pb-2 pt-1 transition-transform duration-300 hover:-translate-y-1"
                onMouseEnter={preloadCityPage}
                onClick={() => goToCity(city.name)}
                onKeyDown={(e) => e.key === 'Enter' && goToCity(city.name)}
                role="button"
                tabIndex={0}
                aria-label={`Explore properties in ${formatCityName(city.name)}`}
              >
                <div className="relative mx-auto aspect-square w-full max-w-[5.5rem] sm:max-w-[6.25rem] md:max-w-[7rem] lg:max-w-[7.75rem]">
                  <div className="h-full w-full overflow-hidden rounded-full border-[3px] border-white bg-slate-100 shadow-[0_8px_24px_rgba(15,23,42,0.1)] ring-2 ring-slate-100 transition-all duration-300 group-hover:border-primary/20 group-hover:ring-primary/25 group-hover:shadow-[0_12px_28px_rgba(2,53,38,0.18)]">
                    <img
                      src={resolveCityCardImage(city.image, 320)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
                  </div>
                  <span className="absolute bottom-1 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-bold text-primary shadow-sm backdrop-blur-sm sm:text-[10px]">
                    {city.propertyCount ?? '—'} listings
                  </span>
                </div>

                <div className="mt-3 w-full text-center">
                  <p className="m-0 truncate text-[13px] font-bold leading-tight text-slate-900 transition-colors group-hover:text-primary sm:text-sm">
                    {formatCityName(city.name)}
                  </p>
                  <p className="m-0 mt-1 truncate text-[10px] font-medium text-slate-400 sm:text-[11px]">
                    {city.propertyCount ? `${city.propertyCount} properties` : 'Explore properties'}
                  </p>
                </div>
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
                <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
                  {filteredCities.map((city) => (
                    <button
                      key={city.name}
                      type="button"
                      className="group flex flex-col items-center rounded-2xl border border-transparent p-2 text-center transition-all hover:border-primary/15 hover:bg-primary/5"
                      onMouseEnter={preloadCityPage}
                      onClick={() => goToCity(city.name)}
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-white bg-slate-100 shadow-md ring-2 ring-slate-100 transition-all group-hover:ring-primary/25 sm:h-[4.5rem] sm:w-[4.5rem]">
                        <img
                          src={resolveCityCardImage(city.image, 120)}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <p className="m-0 mt-2 w-full truncate text-xs font-semibold text-slate-900 transition-colors group-hover:text-primary sm:text-sm">
                        {formatCityName(city.name)}
                      </p>
                      <p className="m-0 mt-0.5 text-[10px] font-medium text-slate-400">
                        {city.propertyCount ?? '—'} listings
                      </p>
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
