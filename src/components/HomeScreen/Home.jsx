import { useEffect, memo } from 'react';
import { useSearch } from '../../context/SearchContext';
import Hero from '../Hero/Hero';
import CategoryTabsSection from './Categories/CategoryTabsSection';
import Localities from './Localities/Localities';
import HomeSectionBanner from './HomeSectionBanner/HomeSectionBanner';
import { HomeBlogs } from './Blogs';
import '../../pages/Home.css';
import DynamicSections from './DynamicSections/DynamicSections';
import Cities from '../Cities/Cities';
import HomeTestimonials from './Testimonials/HomeTestimonials';
import LazyMountSection from './LazyMountSection';
import { SectionLoader } from '../Loader/Loader';
import { preloadCommonRoutes } from '../../utils/preloadRoutes';
import { extractCityNameForApi } from '../../utils/locationDisplay';
import { useHomeData, isHomeInitialLoad } from '../../hooks/useHomeData';

function HomeBannerSlot({ slotIndex, className, banners = [], dynamic = false }) {
  return (
    <LazyMountSection
      className={className}
      minHeight="148px"
      rootMargin="320px 0px"
      fallback={
        <div className="home-section-banner">
          <div className="home-feed__inner">
            <SectionLoader text="Loading..." minHeight="148px" size="sm" />
          </div>
        </div>
      }
    >
      <HomeSectionBanner
        slotIndex={slotIndex}
        apiBanners={dynamic ? banners : []}
        variant={dynamic ? 'dynamic' : 'coded'}
      />
    </LazyMountSection>
  );
}

function Home() {
  const {
    location: searchLocation,
    userLocation: navbarCity,
    coordinates,
    locationRevision,
  } = useSearch();

  const cityFilter = navbarCity && navbarCity !== 'All India' ? navbarCity : searchLocation || '';
  const apiCity = extractCityNameForApi(cityFilter);

  const coordsKey =
    coordinates?.lat != null && coordinates?.lng != null
      ? `${Number(coordinates.lat).toFixed(3)},${Number(coordinates.lng).toFixed(3)}`
      : '';

  const homeQuery = useHomeData(apiCity, coordsKey, locationRevision);
  const { data: homeData, isFetching } = homeQuery;
  const showInitialLoader = isHomeInitialLoad(homeQuery);

  const feed = homeData ?? {
    sections: [],
    categories: [],
    banners: [],
    localities: [],
    popularCities: [],
    testimonials: [],
    blogs: [],
  };

  const hasLocalities = feed.localities?.length > 0;
  const hasSections = feed.sections?.length > 0;
  const hasCities = feed.popularCities?.length > 0;
  const hasFeedContent = hasLocalities || hasSections || hasCities;

  useEffect(() => {
    const run = () => preloadCommonRoutes();
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(run, { timeout: 8000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = window.setTimeout(run, 4000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      <Hero />

      <CategoryTabsSection categories={feed.categories} />

      {!showInitialLoader && hasFeedContent && (
        <HomeBannerSlot
          slotIndex={0}
          banners={feed.banners}
          dynamic
          className="home-section-banner--after-categories"
        />
      )}

      <div
        className={`home-feed${isFetching && homeData ? ' home-feed--refreshing' : ''}`}
        aria-busy={showInitialLoader}
      >
        {showInitialLoader ? (
          <SectionLoader text="Loading properties near you..." minHeight="420px" />
        ) : (
          <div className="home-feed__inner">
            <div className="home-feed__stack">
              {hasLocalities && (
                <LazyMountSection
                  className="home-section home-section--light home-section--localities"
                  minHeight="320px"
                  eager
                >
                  <Localities
                    isSidebarOpen={false}
                    localities={feed.localities}
                    coords={coordinates}
                  />
                </LazyMountSection>
              )}

              {hasLocalities && (hasSections || hasCities) && <HomeBannerSlot slotIndex={1} />}

              {hasSections && (
                <div className="home-section home-section--light home-section--top-properties">
                  <DynamicSections sections={feed.sections} lazyMountSections />
                </div>
              )}

              {/* {hasSections && hasCities && <HomeBannerSlot slotIndex={2} />} */}

              {/* {hasCities && (
                <LazyMountSection
                  className="home-section home-section--light home-section--cities"
                  minHeight="240px"
                  rootMargin="320px 0px"
                >
                  <Cities isSidebarOpen={false} popularCities={feed.popularCities} />
                </LazyMountSection>
              )} */}
            </div>
          </div>
        )}
      </div>

      {!showInitialLoader && (hasCities || hasSections) && (
        <HomeBannerSlot slotIndex={3} className="home-section-banner--before-blogs" />
      )}

      <div className="home-section home-section--light home-section--blogs">
        <div className="home-feed__inner">
          {showInitialLoader ? (
            <SectionLoader text="Loading articles..." minHeight="280px" />
          ) : (
            <HomeBlogs posts={feed.blogs} />
          )}

          {!showInitialLoader && feed.testimonials?.length > 0 && (
            <LazyMountSection
              className="home-section--testimonials mt-10 sm:mt-12"
              minHeight="260px"
              rootMargin="400px 0px"
            >
              <HomeTestimonials testimonials={feed.testimonials} />
            </LazyMountSection>
          )}
        </div>
      </div>
    </>
  );
}

export default memo(Home);
