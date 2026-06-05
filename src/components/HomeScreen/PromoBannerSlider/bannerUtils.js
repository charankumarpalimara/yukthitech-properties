const API_ORIGIN = (import.meta.env.VITE_BASE_URL || 'http://localhost:9000').replace(/\/$/, '');

/** Static demos — web 1920×220, mobile 750×280 */
export const STATIC_DEMO_BANNERS = [
  {
    type: 'image',
    img: '/banners/web banner 1920x220. copy.jpg',
    imgMobile: '/banners/vendor-promo-featured-listing-mobile.svg',
    title: 'Sponsored - 3 BHK Apartment, Banjara Hills',
    destination: null,
    fullImage: true,
  },
  {
    type: 'image',
    img: '/banners/vendor-promo-plots.svg',
    imgMobile: '/banners/vendor-promo-plots-mobile.svg',
    title: 'Featured Vendor - HMDA Plots, Shankarpally',
    destination: null,
    fullImage: true,
  },
  {
    type: 'image',
    img: '/banners/vendor-promo-commercial.svg',
    imgMobile: '/banners/vendor-promo-commercial-mobile.svg',
    title: 'Promoted - Commercial Office, Hi-Tec City',
    destination: null,
    fullImage: true,
  },
];

export const resolveBannerUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/banners/')) return trimmed;
  if (trimmed.startsWith('/')) return `${API_ORIGIN}${trimmed}`;
  return `${API_ORIGIN}/${trimmed}`;
};

const normalizePropertyId = (propertyId) => {
  if (!propertyId) return null;
  if (typeof propertyId === 'object') {
    return propertyId._id || propertyId.id ? String(propertyId._id || propertyId.id) : null;
  }
  return String(propertyId);
};

export const mapApiBanners = (list) =>
  (list || [])
    .map((banner) => {
      const webUrl =
        resolveBannerUrl(banner?.webUrl) ||
        resolveBannerUrl(banner?.bannerImages?.find((i) => i.variant === 'web')?.url) ||
        resolveBannerUrl(banner?.bannerImages?.[0]?.url);

      const mobileUrl =
        resolveBannerUrl(banner?.mobileUrl) ||
        resolveBannerUrl(banner?.bannerImages?.find((i) => i.variant === 'mobile')?.url) ||
        resolveBannerUrl(banner?.bannerImages?.[1]?.url);

      const destination = normalizePropertyId(banner?.bannerContent?.propertyId);

      return {
        type: 'image',
        img: webUrl,
        imgMobile: mobileUrl || webUrl,
        title: banner?.bannerContent?.title || 'Promo',
        destination,
        fullImage: true,
      };
    })
    .filter((b) => Boolean(b.img || b.imgMobile));

export function getDisplayBanners(apiBanners) {
  const mapped = mapApiBanners(apiBanners);
  return mapped.length > 0 ? mapped : STATIC_DEMO_BANNERS;
}

/** Pick one banner for an inline home section slot (rotates through pool). */
export function getSectionBanner(apiBanners, slotIndex = 0) {
  const pool = getDisplayBanners(apiBanners);
  if (!pool.length) return null;
  return pool[slotIndex % pool.length];
}
