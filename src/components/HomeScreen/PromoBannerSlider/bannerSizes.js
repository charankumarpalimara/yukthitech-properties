/** Canonical promo banner dimensions — must match uploaded creatives. */
export const PROMO_BANNER_SIZES = {
  web: { width: 1920, height: 220, label: '1920 × 220' },
  mobile: { width: 750, height: 280, label: '750 × 280' },
};

/** Mobile strip height in CSS (see Home.css --promo-mobile-height) */
export const PROMO_BANNER_MOBILE_ASPECT = `${PROMO_BANNER_SIZES.mobile.width} / ${PROMO_BANNER_SIZES.mobile.height}`;
