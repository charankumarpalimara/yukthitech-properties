import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { preloadCategoryPage } from '../../../utils/preloadRoutes';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import HomeSectionHeader from '../HomeSectionHeader';
import { useCarouselInView, usePrefersReducedMotion } from '../../../hooks/useCarouselInView';
import { resolveCategoryImage } from '../../../utils/imageSizes';
import 'swiper/css';
import { slugOrId } from '../../../utils/slugOrId';

const CATEGORIES_ELITE = [
  {
    name: 'Apartments',
    img: '/categories/luxury_apartments_portrait_1776492494419.png',
    path: '/category/Apartments',
  },
  {
    name: 'Villas',
    img: '/categories/villas_1776438506118.png',
    path: '/category/Villas',
  },
  {
    name: 'Commercial',
    img: '/categories/commercial_1776438564126.png',
    path: '/category/Commercial',
  },
  {
    name: 'New Projects',
    img: '/categories/projects_1776439106753.png',
    path: '/category/New Projects',
  },
  {
    name: 'Plots & Land',
    img: '/categories/land_1776439133923.png',
    path: '/category/Plots-Land',
  },
];

export default function Categories({ categories: initialCategories }) {
  const swiperRef = useRef(null);
  const { ref: containerRef, inView } = useCarouselInView({ enabled: true });
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldAutoplay = inView && !prefersReducedMotion;

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper?.autoplay) return;
    if (shouldAutoplay) swiper.autoplay.start();
    else swiper.autoplay.stop();
  }, [shouldAutoplay]);

  const displayCategories =
    initialCategories?.length > 0
      ? initialCategories.map((cat) => ({
          name: cat.name,
          path: `/category/${slugOrId(cat)}`,
          img: resolveCategoryImage(
            cat.image || '/categories/luxury_apartments_portrait_1776492494419.png',
            224
          ),
        }))
      : CATEGORIES_ELITE.map((cat) => ({
          ...cat,
          img: resolveCategoryImage(cat.img, 224),
        }));

  return (
    <section className="w-full">
      <HomeSectionHeader
        eyebrow="Browse by type"
        title="Property categories"
        subtitle="Apartments, villas, plots, and commercial spaces — all in one place"
      />

      <div ref={containerRef} className="home-feed__carousel pt-1">
        <Swiper
          modules={[Autoplay]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          breakpoints={{
            0: { slidesPerView: 3.2, spaceBetween: 12 },
            640: { slidesPerView: 5, spaceBetween: 16 },
            1024: { slidesPerView: 6, spaceBetween: 20 },
            1280: { slidesPerView: 9, spaceBetween: 16 },
          }}
          autoplay={
            shouldAutoplay
              ? { delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }
              : false
          }
          className="!overflow-hidden"
        >
          {displayCategories.map((cat) => (
            <SwiperSlide key={cat.name}>
              <Link
                to={cat.path}
                className="group flex flex-col items-center gap-3 no-underline active:scale-95"
                onMouseEnter={preloadCategoryPage}
              >
                <div className="relative h-[76px] w-[76px] rounded-full bg-gradient-to-tr from-amber-500 to-amber-200 p-[3px] shadow-md transition-shadow group-hover:shadow-lg sm:h-[100px] sm:w-[100px] md:h-[112px] md:w-[112px]">
                  <div className="h-full w-full overflow-hidden rounded-full border-[3px] border-white bg-white">
                    <img
                      src={cat.img}
                      alt={cat.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>
                <span className="max-w-[110px] text-center text-[0.9375rem] font-semibold leading-snug text-slate-800 transition-colors group-hover:text-amber-600 sm:text-base">
                  {cat.name}
                </span>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
