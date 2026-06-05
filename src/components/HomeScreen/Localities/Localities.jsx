import { useSearch } from '../../../context/SearchContext';
import HomeSectionHeader from '../HomeSectionHeader';
import HomePropertyCarousel from '../HomePropertyCarousel';

export default function Localities({ isSidebarOpen, localities: propLocalities, coords }) {
  const { userLocation: currentCity, detectedLocation } = useSearch();
  const localities = propLocalities ?? [];

  const isCurrentlyInSelectedCity =
    (detectedLocation &&
      currentCity &&
      detectedLocation.toLowerCase().includes(currentCity.toLowerCase())) ||
    currentCity?.toLowerCase().includes(detectedLocation?.toLowerCase() || '');

  const viewAllLink =
    coords?.lat && coords?.lng && isCurrentlyInSelectedCity
      ? `/nearby?lat=${coords.lat}&lng=${coords.lng}&city=${encodeURIComponent(currentCity)}`
      : `/nearby?city=${encodeURIComponent(currentCity || '')}`;

  if (!localities?.length) return null;

  return (
    <section className="w-full">
      <HomeSectionHeader
        compact
        eyebrow="Near you"
        title="Properties nearby"
        subtitle="Handpicked listings in top localities around your selected city"
        viewAllTo={viewAllLink}
        viewAllLabel="See all"
        showNav
        prevClass="loc-prev-btn"
        nextClass="loc-next-btn"
      />

      <HomePropertyCarousel
        swiperKey={isSidebarOpen ? 'opened' : 'closed'}
        properties={localities.map((item) => ({
          ...item,
          id: item.id || item._id,
          title: item.title || item.name || 'Premium property',
          img: item.img || item.image,
          loc: isCurrentlyInSelectedCity
            ? item.address?.locality || item.loc || item.address?.city
            : item.address?.city,
          price:
            item.price ||
            (item.financials?.totalPrice
              ? `₹${item.financials.totalPrice.toLocaleString()}`
              : 'Price on request'),
        }))}
        variant="localities"
        navigation={{
          prevEl: '.loc-prev-btn',
          nextEl: '.loc-next-btn',
        }}
        autoplayDelay={4500}
        loop={localities.length > 3}
        breakpoints={{
          480: { slidesPerView: 2.1, spaceBetween: 16 },
          768: { slidesPerView: 2.5, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 20 },
          1280: { slidesPerView: 5, spaceBetween: 10 },
        }}
      />
    </section>
  );
}
