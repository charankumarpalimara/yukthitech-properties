import { Link } from 'react-router-dom';
import { getSectionBanner, STATIC_DEMO_BANNERS } from '../PromoBannerSlider/bannerUtils';
import { PromoBannerImage } from '../PromoBannerSlider/PromoBannerSlider';
import '../PromoBannerSlider/PromoBannerSlider.css';

/** Backend / promo image strip — same rendering as hero promo slider, one banner per slot. */
export default function DynamicSectionBanner({ apiBanners, slotIndex = 0 }) {
  const banner = getSectionBanner(apiBanners, slotIndex);
  if (!banner?.img) return null;

  const fallback = STATIC_DEMO_BANNERS[slotIndex % STATIC_DEMO_BANNERS.length];

  const content = (
    <div className="home-section-banner__dynamic relative w-full overflow-hidden rounded-xl bg-[#f8fafc] sm:rounded-2xl">
      <div className="relative aspect-[1920/220] w-full max-h-[200px] sm:max-h-[220px]">
        <PromoBannerImage
          banner={banner}
          fallbackWeb={fallback?.img}
          fallbackMobile={fallback?.imgMobile}
        />
      </div>
    </div>
  );

  if (banner.destination) {
    return (
      <Link
        to={`/property/${banner.destination}`}
        className="home-section-banner__link block no-underline"
        aria-label={banner.title || 'Promotional banner'}
      >
        {content}
      </Link>
    );
  }

  return content;
}
