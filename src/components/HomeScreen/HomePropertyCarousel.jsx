import { useRef, useCallback, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { ChevronL, ChevronR } from '../../data/icons';
import PropertyCard from '../PropertyCard/PropertyCard';
import { PropertyCardCarouselPauseContext } from '../PropertyCard/PropertyCardCarouselPauseContext';
import { useCarouselInView, usePrefersReducedMotion } from '../../hooks/useCarouselInView';
import { useMaxWidth } from '../../hooks/useMediaQuery';
import { bindSwiperNavigation } from '../../utils/bindSwiperNavigation';
import {
  HOME_CAROUSEL_NAV_OVERLAY_PREV,
  HOME_CAROUSEL_NAV_OVERLAY_NEXT,
} from './homeTypographyStyles';
import 'swiper/css';
import 'swiper/css/navigation';

/**
 * Home feed property row — pauses Swiper autoplay while a card is hovered or off-screen.
 */
export default function HomePropertyCarousel({
  properties,
  variant = 'vertical',
  swiperKey,
  navigation,
  overlayNavigation = false,
  prevClass = '',
  nextClass = '',
  autoplayDelay = 4200,
  autoplayEnabled = true,
  loop,
  breakpoints,
  spaceBetween = 16,
  slidesPerView = 1.15,
}) {
  const swiperRef = useRef(null);
  const isPausedRef = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { ref: containerRef, inView } = useCarouselInView({ enabled: autoplayEnabled });
  const shouldAutoplay = autoplayEnabled && inView && !prefersReducedMotion;
  const isBelowLg = useMaxWidth(1023);
  const showOverlayNav = overlayNavigation && isBelowLg && prevClass && nextClass;

  const setCarouselPaused = useCallback(
    (paused) => {
      const swiper = swiperRef.current;
      if (!swiper?.autoplay || isPausedRef.current === paused) return;
      isPausedRef.current = paused;
      if (paused) swiper.autoplay.stop();
      else if (shouldAutoplay) swiper.autoplay.start();
    },
    [shouldAutoplay]
  );

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper?.autoplay) return;
    if (shouldAutoplay && !isPausedRef.current) swiper.autoplay.start();
    else swiper.autoplay.stop();
  }, [shouldAutoplay]);

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper || !navigation?.prevEl || !navigation?.nextEl) return;
    bindSwiperNavigation(swiper, navigation.prevEl, navigation.nextEl);
  }, [isBelowLg, navigation?.prevEl, navigation?.nextEl, showOverlayNav]);

  if (!properties?.length) return null;

  return (
    <PropertyCardCarouselPauseContext.Provider value={setCarouselPaused}>
      <div ref={containerRef} className="home-feed__carousel relative">
        {showOverlayNav && (
          <>
            <button
              type="button"
              className={`${prevClass} ${HOME_CAROUSEL_NAV_OVERLAY_PREV}`}
              aria-label="Previous"
            >
              <ChevronL className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </button>
            <button
              type="button"
              className={`${nextClass} ${HOME_CAROUSEL_NAV_OVERLAY_NEXT}`}
              aria-label="Next"
            >
              <ChevronR className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </button>
          </>
        )}
        <Swiper
          key={`${swiperKey}-${isBelowLg ? 'm' : 'd'}`}
          modules={[Navigation, Autoplay]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            if (navigation?.prevEl && navigation?.nextEl) {
              bindSwiperNavigation(swiper, navigation.prevEl, navigation.nextEl);
            }
          }}
          spaceBetween={spaceBetween}
          slidesPerView={slidesPerView}
          navigation={navigation}
          autoplay={
            shouldAutoplay
              ? {
                  delay: autoplayDelay,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
              : false
          }
          loop={loop}
          breakpoints={breakpoints}
          className="!overflow-hidden [&_.swiper-slide]:!h-auto [&_.swiper-slide]:flex [&_.swiper-wrapper]:!items-stretch"
        >
          {properties.map((prop) => (
            <SwiperSlide key={prop.id}>
              <PropertyCard property={prop} variant={variant} typography="home" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </PropertyCardCarouselPauseContext.Provider>
  );
}
