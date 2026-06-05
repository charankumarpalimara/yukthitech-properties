/** Preload lazy route chunks on sidebar hover so navigation feels instant */
const prefetchers = {
  '/vendor/dashboard': () => import('../../UserPanel/pages/Dashboard'),
  '/vendor/subscriptions': () => import('../../UserPanel/pages/SubscriptionPlans'),
  '/vendor/properties/list': () => import('../../UserPanel/pages/Properties'),
  '/vendor/properties/pending': () => import('../../UserPanel/pages/properties/PropertyPending'),
  '/vendor/properties/verified': () => import('../../UserPanel/pages/properties/PropertyVerified'),
  '/vendor/properties/rejected': () => import('../../UserPanel/pages/properties/PropertyRejected'),
  '/vendor/properties/draft': () => import('../../UserPanel/pages/properties/PropertyDraft'),
  '/vendor/banner-subscriptions': () => import('../../UserPanel/pages/BannerSubscriptions'),
  '/vendor/support': () => import('../../UserPanel/pages/Support'),
  '/vendor/create-property': () => import('../../UserPanel/pages/CreateProperty'),
};

export function prefetchVendorRoute(path) {
  const load = prefetchers[path];
  if (load) load();
}
