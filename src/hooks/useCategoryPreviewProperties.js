import { useQuery } from '@tanstack/react-query';
import { API_URL } from '../service/api';
import { slugOrId } from '../utils/slugOrId';
import { getCompletionPercentage } from '../utils/propertyCompletion';

const formatPrice = (p) => {
  if (!p || p === 0) return 'Price on Request';
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
  return `₹${p.toLocaleString('en-IN')}`;
};

function normalizeCategoryProperty(p) {
  return {
    id: p._id,
    slug: slugOrId(p),
    title: p.projectName,
    loc: p.address?.city || p.address?.locality || 'India',
    pricing: {
      expectedPrice: p.financials?.totalPrice || 0,
      pricePerSqft: p.financials?.pricePerSft || 0,
    },
    price: formatPrice(p.financials?.totalPrice),
    img:
      p.media?.poster ||
      p.media?.posterThumb ||
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=700&q=80',
    status: p.status,
    propertyType: p.propertyType?.name || 'Property',
    completionPercentage: getCompletionPercentage(p),
    financials: p.financials,
    media: p.media,
    address: p.address,
  };
}

async function fetchCategoryPreview(categoryId, signal) {
  const res = await fetch(`${API_URL}/categories/properties/${categoryId}?limit=8`, {
    signal,
  });
  const json = await res.json();
  if (!json.success) return [];
  const raw = json.data?.properties || json.data || [];
  return raw.slice(0, 8).map(normalizeCategoryProperty);
}

export function useCategoryPreviewProperties(categoryId) {
  return useQuery({
    queryKey: ['home', 'category-preview', categoryId],
    queryFn: ({ signal }) => fetchCategoryPreview(categoryId, signal),
    enabled: Boolean(categoryId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
