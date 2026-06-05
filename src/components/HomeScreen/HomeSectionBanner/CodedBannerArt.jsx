import { ArrowRight, Building2, Crown, MapPin, Sparkles } from 'lucide-react';

const ICONS = {
  sparkles: Sparkles,
  map: MapPin,
  building: Building2,
  crown: Crown,
};

export default function CodedBannerArt({ banner }) {
  const Icon = ICONS[banner.icon] || Sparkles;

  return (
    <div
      className={`coded-banner coded-banner--${banner.theme}`}
      role="presentation"
    >
      <div className="coded-banner__shape coded-banner__shape--1" aria-hidden />
      <div className="coded-banner__shape coded-banner__shape--2" aria-hidden />
      <div className="coded-banner__shape coded-banner__shape--3" aria-hidden />
      <div className="coded-banner__grid" aria-hidden />

      <div className="coded-banner__inner">
        <div className="coded-banner__icon-wrap" aria-hidden>
          <Icon className="coded-banner__icon" strokeWidth={2} />
        </div>

        <div className="coded-banner__copy">
          <span className="coded-banner__tag">{banner.tag}</span>
          <p className="coded-banner__title">{banner.title}</p>
          <p className="coded-banner__subtitle">{banner.subtitle}</p>
        </div>

        <div className="coded-banner__aside">
          <div className="coded-banner__price">
            <span className="coded-banner__price-main">{banner.highlight}</span>
            {banner.highlightSub && (
              <span className="coded-banner__price-sub">{banner.highlightSub}</span>
            )}
          </div>
          <span className="coded-banner__cta">
            {banner.cta}
            <ArrowRight className="coded-banner__cta-icon" strokeWidth={2.5} aria-hidden />
          </span>
        </div>
      </div>
    </div>
  );
}
