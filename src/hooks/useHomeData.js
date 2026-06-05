import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { API_URL, apiClient } from '../service/api';
import { mapApiBlogToHomeShape } from '../data/homeBlogs';

const EMPTY_HOME = {
  sections: [],
  categories: [],
  banners: [],
  localities: [],
  popularCities: [],
  testimonials: [],
  blogs: [],
};

async function fetchHomeData({ apiCity, coordsKey }) {
  let queryParams = 'productsLimit=8&testimonialsLimit=12&blogsLimit=8';

  if (coordsKey) {
    const [lat, lng] = coordsKey.split(',');
    queryParams += `&lat=${lat}&lng=${lng}`;
  }

  if (apiCity) {
    queryParams += `&city=${encodeURIComponent(apiCity)}`;
  }

  const response = await apiClient(`${API_URL}/dynamic-section?${queryParams}`);
  const data = await response.json();

  if (!data.success) {
    return EMPTY_HOME;
  }

  return {
    sections: data.sections || [],
    categories: data.categories || [],
    banners: data.banners || [],
    localities: data.localities || [],
    popularCities: data.popularCities || [],
    testimonials: data.testimonials || [],
    blogs: (data.blogs || []).map(mapApiBlogToHomeShape).filter(Boolean),
  };
}

export function useHomeData(apiCity, coordsKey, locationRevision) {
  return useQuery({
    queryKey: ['home', 'dynamic-section', apiCity, coordsKey, locationRevision],
    queryFn: () => fetchHomeData({ apiCity, coordsKey }),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
  });
}
