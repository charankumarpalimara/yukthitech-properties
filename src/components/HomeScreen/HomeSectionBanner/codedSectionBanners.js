/** Home inline banners — coded fallback when API banners are unavailable. */
export const CODED_SECTION_BANNERS = [
  {
    id: 'featured',
    theme: 'featured',
    layout: 'split-right',
    tag: 'Sponsored',
    title: 'Featured listings in Hyderabad',
    subtitle: 'Handpicked verified homes with transparent pricing',
    highlight: 'From ₹ 45 L',
    highlightSub: 'Ready to move',
    cta: 'Explore featured',
    to: '/featured-properties',
    icon: 'sparkles',
    image: '/banners/vendor-promo-featured-listing.svg',
    imageMobile: '/banners/vendor-promo-featured-listing-mobile.svg',
  },
  {
    id: 'plots',
    theme: 'plots',
    layout: 'overlay',
    tag: 'Land & plots',
    title: 'HMDA-approved plots & open layouts',
    subtitle: 'Shankarpally, Kokapet, and growth corridors',
    highlight: 'From ₹ 25 L',
    highlightSub: 'Limited inventory',
    cta: 'Browse plots',
    to: '/plots-land-properties',
    icon: 'map',
    image: '/banners/vendor-promo-plots.svg',
    imageMobile: '/banners/vendor-promo-plots-mobile.svg',
  },
  {
    id: 'premium',
    theme: 'premium',
    layout: 'split-left',
    tag: 'Premium collection',
    title: 'Luxury villas & gated communities',
    subtitle: 'Curated by Yukthi — legal check included',
    highlight: '₹ 1.2 Cr+',
    highlightSub: 'Vastu-friendly options',
    cta: 'View premium',
    to: '/premium-properties',
    icon: 'building',
    image: '/banners/vendor-promo-commercial.svg',
    imageMobile: '/banners/vendor-promo-commercial-mobile.svg',
  },
  {
    id: 'vendor',
    theme: 'vendor',
    layout: 'compact',
    tag: 'For owners & agents',
    title: 'List once. Reach serious buyers.',
    subtitle: 'Featured placement, verified leads, simple dashboard',
    highlight: 'Post free',
    highlightSub: 'Plans from ₹ 999/mo',
    cta: 'Post property',
    to: '/subscription',
    icon: 'crown',
    image:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=960&q=80',
    imageMobile:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=640&q=80',
  },
];

export function getCodedSectionBanner(slotIndex = 0) {
  if (!CODED_SECTION_BANNERS.length) return null;
  return CODED_SECTION_BANNERS[slotIndex % CODED_SECTION_BANNERS.length];
}
