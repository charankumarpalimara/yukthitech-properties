import { Link } from 'react-router-dom';
import { getCodedSectionBanner } from './codedSectionBanners';
import CodedBannerArt from './CodedBannerArt';
import DynamicSectionBanner from './DynamicSectionBanner';
import './HomeSectionBanner.css';

/**
 * @param {'dynamic' | 'coded'} variant
 * - dynamic: backend promo image strip (unchanged)
 * - coded: inline section promo with content + image layout
 */
export default function HomeSectionBanner({
  slotIndex = 0,
  className = '',
  apiBanners = [],
  variant = 'coded',
}) {
  if (variant === 'dynamic') {
    return (
      <aside className={`home-section-banner ${className}`.trim()} aria-label="Promotional banner">
        <div className="home-feed__inner">
          <DynamicSectionBanner apiBanners={apiBanners} slotIndex={slotIndex} />
        </div>
      </aside>
    );
  }

  const codedBanner = getCodedSectionBanner(slotIndex);
  if (!codedBanner) return null;

  return (
    <aside className={`home-section-banner ${className}`.trim()} aria-label={codedBanner.title}>
      <div className="home-feed__inner">
        <Link to={codedBanner.to} className="home-section-banner__link block no-underline">
          <CodedBannerArt banner={codedBanner} />
        </Link>
      </div>
    </aside>
  );
}
