import { useState, useCallback, useEffect, useRef } from 'react';
import { useMaxWidth } from '../../../hooks/useMediaQuery';
import { useCarouselInView, usePrefersReducedMotion } from '../../../hooks/useCarouselInView';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/pagination';
import './PromoBannerSlider.css';
import MobilePromoBannerArt, { isStaticMobileDemo } from './MobilePromoBannerArt';
import { STATIC_DEMO_BANNERS, getDisplayBanners } from './bannerUtils';

export function PromoBannerImage({ banner, fallbackWeb, fallbackMobile }) {
  const isMobileViewport = useMaxWidth(767);
  const [webSrc, setWebSrc] = useState(banner.img);
  const [mobileSrc, setMobileSrc] = useState(banner.imgMobile || banner.img);
  const useMobileHtml = isStaticMobileDemo(mobileSrc);

  useEffect(() => {
    setWebSrc(banner.img);
    setMobileSrc(banner.imgMobile || banner.img);
  }, [banner.img, banner.imgMobile]);

  const onWebError = useCallback(() => {
    if (fallbackWeb && webSrc !== fallbackWeb) setWebSrc(fallbackWeb);
  }, [fallbackWeb, webSrc]);

  const onMobileError = useCallback(() => {
    if (fallbackMobile && mobileSrc !== fallbackMobile) {
      setMobileSrc(fallbackMobile);
      return;
    }
    if (fallbackWeb && mobileSrc !== fallbackWeb) setMobileSrc(fallbackWeb);
  }, [fallbackMobile, fallbackWeb, mobileSrc]);

  if (isMobileViewport) {
    if (useMobileHtml) {
      return (
        <div className="promo-banner-media">
          <div className="promo-banner-img promo-banner-img--mobile promo-banner-img--mobile-html">
            <MobilePromoBannerArt src={mobileSrc} title={banner.title} />
          </div>
        </div>
      );
    }
    return (
      <div className="promo-banner-media">
        <img
          src={mobileSrc}
          alt={banner.title || 'Promo banner'}
          className="promo-banner-img promo-banner-img--mobile"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          onError={onMobileError}
        />
      </div>
    );
  }

  return (
    <div className="promo-banner-media">
      <img
        src={webSrc}
        alt={banner.title || 'Promo banner'}
        className="promo-banner-img promo-banner-img--web"
        loading="eager"
        decoding="async"
        fetchPriority="high"
        onError={onWebError}
      />
    </div>
  );
}

export default function PromoBannerSlider({ isSidebarOpen, banners: initialBanners }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const progressCircle = useRef(null);
  const swiperRef = useRef(null);
  const { ref: containerRef, inView } = useCarouselInView({
    enabled: true,
    rootMargin: '40px 0px',
  });
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldAutoplay = inView && !prefersReducedMotion;
  const displayBanners = getDisplayBanners(initialBanners);

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper?.autoplay) return;
    if (shouldAutoplay) swiper.autoplay.start();
    else swiper.autoplay.stop();
  }, [shouldAutoplay]);

  const onAutoplayTimeLeft = (s, time, progress) => {
    if (progressCircle.current) {
      progressCircle.current.style.setProperty('--progress', 1 - progress);
    }
  };

  if (!displayBanners?.length) return null;

  return (
    <section
      ref={containerRef}
      className={`promo-banner-section p-0 m-0 w-full max-w-full overflow-hidden ${isSidebarOpen ? 'sidebar-open' : ''}`}
      aria-label="Promoted property listings"
    >
      <Swiper
        key={isSidebarOpen ? 'opened' : 'closed'}
        modules={[Pagination, Autoplay]}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        pagination={{ clickable: true }}
        autoplay={
          shouldAutoplay
            ? { delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true }
            : false
        }
        rewind={displayBanners.length > 1}
        watchSlidesProgress
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        onAutoplayTimeLeft={onAutoplayTimeLeft}
        className="promo-slider-wrapper swiper w-full"
      >
        {displayBanners.map((banner, i) => (
          <SwiperSlide key={`${banner.img}-${banner.imgMobile || ''}-${i}`}>
            <Link
              to={banner.destination ? `/property/${banner.destination}` : '#'}
              onClick={(e) => {
                if (!banner.destination) e.preventDefault();
              }}
              className="promo-slide-link relative flex w-full items-stretch justify-center overflow-hidden bg-[#f8fafc]"
            >
              {banner.type === 'image' && (
                <PromoBannerImage
                  banner={banner}
                  fallbackWeb={STATIC_DEMO_BANNERS[i % STATIC_DEMO_BANNERS.length]?.img}
                  fallbackMobile={STATIC_DEMO_BANNERS[i % STATIC_DEMO_BANNERS.length]?.imgMobile}
                />
              )}

              <div className="absolute bottom-2 right-3 z-10 rounded-full border border-white/20 bg-black/40 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-white backdrop-blur-md pointer-events-none md:bottom-4 md:right-6 md:px-3 md:py-1 md:text-sm">
                {activeIndex + 1} / {displayBanners.length}
              </div>

              <div className="absolute bottom-0 left-0 z-20 h-[3px] w-full bg-white/5">
                <div
                  className="h-full bg-white/30 transition-[width] duration-100 linear"
                  ref={i === 0 ? progressCircle : undefined}
                  style={{ width: 'calc(var(--progress, 0) * 100%)' }}
                />
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
