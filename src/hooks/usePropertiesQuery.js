import { useQuery } from '@tanstack/react-query';
import { API_URL, apiClient } from '../service/api';

const normalizePropertyPayload = (data) => {
  if (!data) return null;
  const p = { ...data };
  p.id = p._id || p.id;
  p.title = p.projectName || p.title;
  p.img = p.media?.poster || p.media?.photos?.[0] || p.img;
  if (p.address?.addressLine1 || p.address?.city) {
    const parts = [
      p.address.addressLine1,
      p.address.locality,
      p.address.city,
      p.address.state,
    ].filter(Boolean);
    p.loc = parts.join(', ');
  }
  return p;
};

export const usePropertyDetails = (id) => {
  return useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await apiClient(`${API_URL}/properties/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return normalizePropertyPayload(json.property);
    },
    enabled: !!id,
  });
};

/** Full property payload for hover preview (cached, fetched on hover). */
export const usePropertyPreviewDetails = (id, enabled = false) => {
  return useQuery({
    queryKey: ['property-preview', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await apiClient(`${API_URL}/properties/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return normalizePropertyPayload(json.property);
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
