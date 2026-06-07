import { useState, useEffect, lazy, Suspense } from 'react';
import { useSearch } from '../../context/SearchContext';
import Hero from '../Hero/Hero';
import CategoryTabsSection from './Categories/CategoryTabsSection';
import Localities from './Localities/Localities';
import HomeSectionBanner from './HomeSectionBanner/HomeSectionBanner';
import '../../pages/Home.css';
import DynamicSections from './DynamicSections/DynamicSections';
import Cities from '../Cities/Cities';
import HomeTestimonials from './Testimonials/HomeTestimonials';
import LazyMountSection from './LazyMountSection';
import { HomeBlogsSkeleton } from '../../pages/Blogs';
import { preloadCommonRoutes } from '../../utils/preloadRoutes';
import { extractCityNameForApi } from '../../utils/locationDisplay';
import { useHomeData } from '../../hooks/useHomeData';

const HomeBlogs = lazy(() => import('./Blogs').then((m) => ({ default: m.HomeBlogs })));

function HomeFeedSkeleton() {
  return (
    <div className="home-feed__inner animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-slate-200 mb-6" />
      <div className="flex gap-4 overflow-hidden mb-12">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-[100px] w-[100px] shrink-0 rounded-full bg-slate-200" />
        ))}
      </div>
      <div className="h-8 w-56 rounded-lg bg-slate-200 mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-[4/5] rounded-2xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}

function SectionPlaceholder({ tall = false }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-slate-100/90 ${tall ? 'min-h-[420px]' : 'min-h-[280px]'}`}
      aria-hidden
    />
  );
}

function HomeBannerSlot({ slotIndex, className, banners = [], dynamic = false }) {
  return (
    <LazyMountSection
      className={className}
      minHeight={dynamic ? '148px' : '148px'}
      rootMargin="320px 0px"
      fallback={
        <div className="home-section-banner">
          <div className="home-feed__inner">
            <div className="home-section-banner__skeleton" aria-hidden />
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

export default function Home() {
  const [isSidebarOpen] = useState(false);
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

  const {
    data: homeData,
    isLoading,
    isFetching,
    isPending,
  } = useHomeData(apiCity, coordsKey, locationRevision);

  const loading = isPending || (isLoading && !homeData);
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
      const id = window.requestIdleCallback(run, { timeout: 5000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = window.setTimeout(run, 3000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <Hero />

      {/* ── Category Tabs (between hero and main feed) ───────────── */}
      <CategoryTabsSection categories={feed.categories} />

      {/* Banner: after categories, before main feed */}
      {!loading && hasFeedContent && (
        <HomeBannerSlot
          slotIndex={0}
          banners={feed.banners}
          dynamic
          className="home-section-banner--after-categories"
        />
      )}

      {/* ── Main feed ────────────────────────────────────────────── */}
      <div
        className={`home-feed${isFetching && homeData ? ' home-feed--refreshing' : ''}`}
        aria-busy={isFetching}
      >
        {loading ? (
          <HomeFeedSkeleton />
        ) : (
          <div className="home-feed__inner">
            <div className="home-feed__stack">
              {hasLocalities && (
                <LazyMountSection
                  className="home-section home-section--light home-section--localities"
                  minHeight="320px"
                  fallback={<SectionPlaceholder />}
                >
                  <Localities
                    isSidebarOpen={isSidebarOpen}
                    localities={feed.localities}
                    coords={coordinates}
                  />
                </LazyMountSection>
              )}

              {/* Banner: after localities, before listings or cities */}
              {hasLocalities && (hasSections || hasCities) && (
                <HomeBannerSlot slotIndex={1} />
              )}

              {hasSections && (
                <div className="home-section home-section--light home-section--top-properties">
                  <DynamicSections
                    isSidebarOpen={isSidebarOpen}
                    sections={feed.sections}
                    lazyMountSections
                  />
                </div>
              )}

              {/* Banner: after listings, before popular cities */}
              {hasSections && hasCities && (
                <HomeBannerSlot slotIndex={2} />
              )}

              {hasCities && (
                <LazyMountSection
                  className="home-section home-section--light home-section--cities"
                  minHeight="240px"
                  rootMargin="320px 0px"
                  fallback={<SectionPlaceholder />}
                >
                  <Cities isSidebarOpen={isSidebarOpen} popularCities={feed.popularCities} />
                </LazyMountSection>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Banner: before blogs / testimonials */}
      {!loading && (hasCities || hasSections) && (
        <HomeBannerSlot slotIndex={3} className="home-section-banner--before-blogs" />
      )}

      <div className="home-section home-section--light home-section--blogs">
        <div className="home-feed__inner">
          <Suspense fallback={<HomeBlogsSkeleton />}>
            <HomeBlogs posts={feed.blogs} homeLoading={loading} />
          </Suspense>

          {!loading && feed.testimonials?.length > 0 && (
            <LazyMountSection
              className="home-section--testimonials mt-10 sm:mt-12"
              minHeight="260px"
              rootMargin="400px 0px"
              fallback={<SectionPlaceholder />}
            >
              <HomeTestimonials testimonials={feed.testimonials} />
            </LazyMountSection>
          )}
        </div>
      </div>
    </>
  );
}
