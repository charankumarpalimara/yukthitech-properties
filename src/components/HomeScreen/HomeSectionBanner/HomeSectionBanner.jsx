import { Link } from 'react-router-dom';
import { getCodedSectionBanner } from './codedSectionBanners';
import CodedBannerArt from './CodedBannerArt';
import './HomeSectionBanner.css';

export default function HomeSectionBanner({ slotIndex = 0, className = '' }) {
  const banner = getCodedSectionBanner(slotIndex);
  if (!banner) return null;

  return (
    <aside
      className={`home-section-banner ${className}`.trim()}
      aria-label={banner.title}
    >
      <div className="home-feed__inner">
        <Link to={banner.to} className="home-section-banner__link">
          <CodedBannerArt banner={banner} />
        </Link>
      </div>
    </aside>
  );
}
