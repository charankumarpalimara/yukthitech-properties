import { useMemo } from 'react';
import HomeSectionHeader from '../HomeSectionHeader';
import HomePropertyCarousel from '../HomePropertyCarousel';
import LazyMountSection from '../LazyMountSection';
import { slugOrId } from '../../../utils/slugOrId';
import { getCompletionPercentage } from '../../../utils/propertyCompletion';

const formatPrice = (price) => {
  if (!price) return 'Price on request';
  if (price >= 10000000) return `₹ ${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹ ${(price / 100000).toFixed(2)} L`;
  return `₹ ${price.toLocaleString()}`;
};

const formatProperty = (backendProp) => ({
  id: backendProp._id || backendProp.id,
  title: backendProp.projectName || backendProp.title || 'Premium property',
  slug: slugOrId(backendProp),
  listingType: backendProp.listingType,
  listingPlacement: backendProp.listingPlacement,
  propertyType: backendProp.propertyType,
  img:
    backendProp.media?.poster ||
    backendProp.img ||
    'https://via.placeholder.com/400x300?text=Property',
  loc:
    [
      backendProp.address?.addressLine1,
      backendProp.address?.addressLine2,
      backendProp.address?.city,
    ]
      .filter(Boolean)
      .join(', ') ||
    backendProp.loc ||
    'Hyderabad',
  price: formatPrice(backendProp.financials?.totalPrice) || backendProp.price,
  size: backendProp.financials?.priceUnit
    ? `1 ${backendProp.financials.priceUnit}`
    : backendProp.size || 'Contact for info',
  badge: backendProp.status === 'verified' ? 'Verified' : '',
  rating: '4.5',
  beds: backendProp.beds || 0,
  baths: backendProp.baths || 0,
  direction: backendProp.direction || 'East',
  completionPercentage: getCompletionPercentage(backendProp),
  financials: backendProp.financials,
  media: backendProp.media,
  address: backendProp.address,
});

function SectionSkeleton() {
  return (
    <div className="w-full animate-pulse space-y-4" aria-hidden>
      <div className="h-8 w-48 rounded-lg bg-slate-200" />
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[220px] w-[42%] shrink-0 rounded-2xl bg-slate-200 sm:w-[28%]" />
        ))}
      </div>
    </div>
  );
}

export default function DynamicSections({ isSidebarOpen, sections, lazyMountSections = false }) {
  const formattedSections = useMemo(() => {
    if (!sections?.length) return [];
    const variants = ['vertical', 'land', 'horizontal', 'vertical', 'land'];

    return sections.map((section, index) => ({
      ...section,

      displayVariant: variants[index % variants.length],
      properties: (section.properties || []).map(formatProperty),
    }));
  }, [sections]);

  if (!formattedSections.length) return null;

  return (
    <div className="flex w-full flex-col gap-10 sm:gap-12">
      {formattedSections.map((section, index) => {
        if (!section.properties?.length) return null;

        const prevClass = `ds-prev-${index}`;
        const nextClass = `ds-next-${index}`;

        const isPremiumSection = section.sectionKey === 'premium_listing';
        const isFeaturedSection = section.sectionKey === 'featured_listing';
        const isTopBudgetSection = section.sectionKey === 'top_budget_properties';
        const viewAllTo = isTopBudgetSection
          ? '/top-budget-properties'
          : isFeaturedSection
            ? '/collection/featured-properties'
            : isPremiumSection
              ? '/collection/premium-properties'
              : `/collection/${slugOrId(section)}`;
        const eyebrow = isTopBudgetSection
          ? 'Top picks'
          : isPremiumSection
            ? 'Premium collection'
            : isFeaturedSection
              ? 'Featured collection'
              : 'Curated collection';

        const block = (
          <section key={section._id || index} className="w-full">
            <HomeSectionHeader
              eyebrow={eyebrow}
              title={section.name}
              subtitle={section.subtitle || 'Verified listings curated for you'}
              viewAllTo={viewAllTo}
              viewAllLabel="View all"
              showNav
              prevClass={prevClass}
              nextClass={nextClass}
            />

            <HomePropertyCarousel
              swiperKey={`${isSidebarOpen}-${index}`}
              properties={section.properties}
              variant={section.displayVariant || 'vertical'}
              autoplayEnabled={index < 1}
              navigation={{
                prevEl: `.${prevClass}`,
                nextEl: `.${nextClass}`,
              }}
              autoplayDelay={4200 + index * 400}
              loop={section.properties.length > 4}
              breakpoints={{
                640: { slidesPerView: 2.1, spaceBetween: 18 },
                1024: { slidesPerView: 5, spaceBetween: 20 },
                1280: { slidesPerView: 5, spaceBetween: 16 },
              }}
            />
          </section>
        );

        if (!lazyMountSections || index === 0) {
          return block;
        }

        return (
          <LazyMountSection
            key={section._id || index}
            minHeight="420px"
            rootMargin="320px 0px"
            fallback={<SectionSkeleton />}
          >
            {block}
          </LazyMountSection>
        );
      })}
    </div>
  );
}
