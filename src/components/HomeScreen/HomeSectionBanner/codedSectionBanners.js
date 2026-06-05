/** Home inline banners — pure code (no image assets). */
export const CODED_SECTION_BANNERS = [
  {
    id: 'featured',
    theme: 'featured',
    tag: 'Sponsored',
    title: 'Featured listings in Hyderabad',
    subtitle: 'Handpicked verified homes with transparent pricing',
    highlight: 'From ₹ 45 L',
    highlightSub: 'Ready to move',
    cta: 'Explore featured',
    to: '/collection/featured-properties',
    icon: 'sparkles',
  },
  {
    id: 'plots',
    theme: 'plots',
    tag: 'Land & plots',
    title: 'HMDA-approved plots & open layouts',
    subtitle: 'Shankarpally, Kokapet, and growth corridors',
    highlight: 'From ₹ 25 L',
    highlightSub: 'Limited inventory',
    cta: 'Browse plots',
    to: '/properties?propertyType=plot',
    icon: 'map',
  },
  {
    id: 'premium',
    theme: 'premium',
    tag: 'Premium collection',
    title: 'Luxury villas & gated communities',
    subtitle: 'Curated by Yukthi — legal check included',
    highlight: '₹ 1.2 Cr+',
    highlightSub: 'Vastu-friendly options',
    cta: 'View premium',
    to: '/collection/premium-properties',
    icon: 'building',
  },
  {
    id: 'vendor',
    theme: 'vendor',
    tag: 'For owners & agents',
    title: 'List once. Reach serious buyers.',
    subtitle: 'Featured placement, verified leads, simple dashboard',
    highlight: 'Post free',
    highlightSub: 'Plans from ₹ 999/mo',
    cta: 'Post property',
    to: '/subscription',
    icon: 'crown',
  },
];

export function getCodedSectionBanner(slotIndex = 0) {
  if (!CODED_SECTION_BANNERS.length) return null;
  return CODED_SECTION_BANNERS[slotIndex % CODED_SECTION_BANNERS.length];
}
