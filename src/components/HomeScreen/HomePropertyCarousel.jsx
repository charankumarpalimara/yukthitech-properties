import { useRef, useCallback, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import PropertyCard from '../PropertyCard/PropertyCard';
import { PropertyCardCarouselPauseContext } from '../PropertyCard/PropertyCardCarouselPauseContext';
import { useCarouselInView, usePrefersReducedMotion } from '../../hooks/useCarouselInView';
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

  if (!properties?.length) return null;

  return (
    <PropertyCardCarouselPauseContext.Provider value={setCarouselPaused}>
      <div ref={containerRef} className="home-feed__carousel">
        <Swiper
          key={swiperKey}
          modules={[Navigation, Autoplay]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
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
