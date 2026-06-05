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
        eyebrow="Top destinations"
        title="Explore cities"
        subtitle="Find verified properties in India's fastest-growing urban hubs"
        viewAllLabel="All cities"
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
              <div
                className="group relative hidden h-[200px] cursor-pointer overflow-hidden rounded-2xl bg-slate-900 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:block"
                onMouseEnter={preloadCityPage}
                onClick={() => goToCity(city.name)}
                onKeyDown={(e) => e.key === 'Enter' && goToCity(city.name)}
                role="button"
                tabIndex={0}
              >
                <img
                  src={resolveCityCardImage(city.image, 480)}
                  alt={city.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover opacity-90 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent p-5">
                  <div className="text-lg font-semibold text-white">
                    {formatCityName(city.name)}
                  </div>
                  <div className="text-xs font-medium tracking-wide text-white/75">
                    {city.propertyCount} listings
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="flex w-full flex-col items-center gap-2.5 md:hidden"
                onMouseEnter={preloadCityPage}
                onClick={() => goToCity(city.name)}
              >
                <div className="h-[80px] w-[80px] rounded-full bg-gradient-to-tr from-amber-500 to-amber-200 p-[3px] shadow-md">
                  <div className="h-full w-full overflow-hidden rounded-full border-2 border-white">
                    <img
                      src={resolveCityCardImage(city.image, 160)}
                      alt={city.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-800">
                  {formatCityName(city.name)}
                </span>
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:p-6"
          onClick={() => setIsModalOpen(false)}
          role="presentation"
        >
          <div
            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cities-modal-title"
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 sm:px-8">
              <div>
                <h3
                  id="cities-modal-title"
                  className="text-xl font-semibold text-slate-900 sm:text-2xl"
                >
                  All cities
                </h3>
                <p className="mt-1 text-base text-slate-500">{cities.length} cities available</p>
              </div>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
              >
                <CloseIco className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-slate-100 px-6 py-4 sm:px-8">
              <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/20">
                <SearchIco className="text-amber-600" />
                <input
                  type="text"
                  placeholder="Search city name..."
                  className="flex-1 border-none bg-transparent text-base font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
              {filteredCities.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {filteredCities.map((city) => (
                    <button
                      key={city.name}
                      type="button"
                      className="flex items-center gap-3 rounded-xl border border-slate-100 p-2.5 text-left transition-all hover:border-amber-400 hover:bg-amber-50"
                      onMouseEnter={preloadCityPage}
                      onClick={() => goToCity(city.name)}
                    >
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg">
                        <img
                          src={resolveCityCardImage(city.image, 88)}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">
                          {formatCityName(city.name)}
                        </div>
                        <div className="text-xs font-medium text-slate-500">
                          {city.propertyCount} listings
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="py-12 text-center text-sm text-slate-500">
                  No cities match your search.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
