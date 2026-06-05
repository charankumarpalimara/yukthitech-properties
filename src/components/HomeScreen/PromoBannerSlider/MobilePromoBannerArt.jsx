/** Static demo paths → HTML mobile creative (750×280). SVG in &lt;img&gt; often hides text on phones. */
const DEMO_KEY_BY_PATH = {
  '/banners/vendor-promo-featured-listing-mobile.svg': 'featured',
  '/banners/vendor-promo-plots-mobile.svg': 'plots',
  '/banners/vendor-promo-commercial-mobile.svg': 'commercial',
};

const ART = {
  featured: {
    theme: 'listing',
    tag: 'SPONSORED',
    title: '3 BHK Apartment',
    subtitle: 'Banjara Hills, Hyderabad',
    meta: 'Prime Realtors · RERA Verified',
    price: 'Rs. 1.2 Cr',
    priceSub: 'Ready to Move',
  },
  plots: {
    theme: 'plots',
    tag: 'FEATURED VENDOR',
    title: 'HMDA Approved Plots',
    subtitle: 'Shankarpally · 200 Sq. Yards',
    meta: 'Green Valley Developers',
    price: 'From Rs. 25 L',
    priceSub: 'Limited Units',
  },
  commercial: {
    theme: 'commercial',
    tag: 'PROMOTED',
    title: 'Commercial Office',
    subtitle: 'Hi-Tec City · 2,400 SFT',
    meta: 'Skyline Business Parks',
    price: 'Lease Available',
    priceSub: 'Book a Site Visit',
  },
};

export const isStaticMobileDemo = (url) => {
  if (!url || typeof url !== 'string') return false;
  const path = url.replace(/^https?:\/\/[^/]+/i, '').split('?')[0];
  return Boolean(DEMO_KEY_BY_PATH[path]);
};

export default function MobilePromoBannerArt({ src, title }) {
  const path = (src || '').replace(/^https?:\/\/[^/]+/i, '').split('?')[0];
  const key = DEMO_KEY_BY_PATH[path];
  if (!key) return null;

  const art = ART[key];

  return (
    <div
      className={`promo-banner-mobile-art promo-banner-mobile-art--${art.theme}`}
      role="img"
      aria-label={title || art.title}
    >
      <div className="promo-banner-mobile-art__row">
        <div className="promo-banner-mobile-art__icon" aria-hidden />
        <div className="promo-banner-mobile-art__copy">
          <span className="promo-banner-mobile-art__tag">{art.tag}</span>
          <p className="promo-banner-mobile-art__title">{art.title}</p>
          <p className="promo-banner-mobile-art__subtitle">{art.subtitle}</p>
          <p className="promo-banner-mobile-art__meta">{art.meta}</p>
        </div>
        <div className="promo-banner-mobile-art__price">
          <span className="promo-banner-mobile-art__price-main">{art.price}</span>
          <span className="promo-banner-mobile-art__price-sub">{art.priceSub}</span>
        </div>
      </div>
    </div>
  );
}
