/** Warm up lazy route chunks so navigation from Home feels instant */

export const preloadPropertiesPage = () => import('../pages/Properties');
export const preloadPropertyDetailsPage = () => import('../pages/PropertyDetails');
export const preloadUserPanelPage = () => import('../pages/UserPanel');
export const preloadCategoryPage = () => import('../pages/CategoryViewDetails');
export const preloadCollectionPage = () => import('../pages/CollectionPage');
export const preloadNearbyPage = () => import('../pages/NearbyPropertiesPage');
export const preloadCityPage = () => import('../pages/CityPropertiesPage');
export const preloadBlogsPage = () => import('../pages/Blogs');

export function cityPagePath(cityName) {
  return `/city/${encodeURIComponent(cityName || '')}`;
}

export function preloadCommonRoutes() {
  preloadPropertiesPage();
  preloadPropertyDetailsPage();
  preloadUserPanelPage();
  preloadCategoryPage();
  preloadCollectionPage();
  preloadNearbyPage();
  preloadCityPage();
}
