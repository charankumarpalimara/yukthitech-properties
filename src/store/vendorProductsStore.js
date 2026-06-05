import { create } from 'zustand';
import { VENDORAPI_URL } from '../service/api';

const PROPERTIES_URL = `${VENDORAPI_URL}/properties`;

async function parsePropertyApiResponse(res) {
  const text = await res.text();
  let json = {};
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      if (res.status === 413) {
        throw new Error(
          'Upload is too large. Use smaller images or video, or save in smaller steps.'
        );
      }
      throw new Error(text.slice(0, 200) || `Request failed (${res.status})`);
    }
  }
  const message = json.message || json.error || `Request failed (${res.status})`;
  if (!res.ok || json.success === false) {
    throw new Error(message);
  }
  return json;
}

const normalizePropertyResponse = (data) => {
  if (data?.property) {
    return {
      ...data.property,
      propertyDocument: data.doc || data.propertyDocument || null,
      user: data.user || null,
    };
  }
  if (data?.documentsId && typeof data.documentsId === 'object') {
    return { ...data, propertyDocument: data.documentsId };
  }
  return data;
};

export const useVendorProductsStore = create((set, get) => ({
  list: [],
  totalItems: 0,
  totalPages: 1,
  statusCounts: {},
  loading: false,
  error: null,
  searchQuery: '',
  typeFilter: '',
  statusFilter: '',
  cityFilter: '',
  currentPage: 1,
  pageSize: 8,
  selectedProperty: null,
  currentProperty: null,
  subscription: null,

  setSearch: (searchQuery) => set({ searchQuery, currentPage: 1 }),
  setTypeFilter: (typeFilter) => set({ typeFilter, currentPage: 1 }),
  setStatusFilter: (statusFilter) => set({ statusFilter, currentPage: 1 }),
  setCityFilter: (cityFilter) => set({ cityFilter, currentPage: 1 }),
  setPage: (currentPage) => set({ currentPage }),
  setSelectedProperty: (selectedProperty) => set({ selectedProperty }),

  updatePropertyStatus: ({ id, status, rejectionReason }) => {
    const list = get().list.map((p) => {
      if (Number(p._id) === Number(id) || p._id === id) {
        return {
          ...p,
          status,
          ...(rejectionReason ? { rejectionReason } : {}),
        };
      }
      return p;
    });
    set({ list });
  },

  fetchProducts: async (params = {}) => {
    const state = get();
    const {
      page = state.currentPage,
      limit = state.pageSize,
      search = state.searchQuery,
      type = state.typeFilter,
      status = state.statusFilter,
    } = params;

    set({ loading: true, error: null });
    try {
      const url = new URL(PROPERTIES_URL);
      url.searchParams.append('page', page);
      url.searchParams.append('limit', limit);
      if (search) url.searchParams.append('search', search);
      if (type) url.searchParams.append('propertyType', type);
      if (status) url.searchParams.append('status', status);

      const token = localStorage.getItem('token');
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      set({
        loading: false,
        list: json.data,
        totalItems: json.pagination?.total || json.data.length,
        totalPages: json.pagination?.totalPages || 1,
        statusCounts: json.count || {},
        subscription: json.subscription || null,
      });
      return json;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  createProperty: async (formData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(PROPERTIES_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await parsePropertyApiResponse(res);
      const property = normalizePropertyResponse(json.data);
      set((s) => ({ loading: false, list: [property, ...s.list] }));
      return property;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  fetchPropertyById: async (id) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${PROPERTIES_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      const property = normalizePropertyResponse(json.data);
      set((s) => {
        const index = s.list.findIndex((p) => p._id === property._id);
        const list =
          index !== -1 ? s.list.map((p, i) => (i === index ? property : p)) : [...s.list, property];
        return { loading: false, currentProperty: property, list };
      });
      return property;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  updateProperty: async ({ id, formData }) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${PROPERTIES_URL}/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await parsePropertyApiResponse(res);
      const property = normalizePropertyResponse(json.data);
      set((s) => {
        const index = s.list.findIndex((p) => p._id === property._id);
        const list =
          index !== -1 ? s.list.map((p, i) => (i === index ? property : p)) : [...s.list, property];
        return { loading: false, currentProperty: property, list };
      });
      return property;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  deleteProperty: async (id) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${PROPERTIES_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      set((s) => ({
        loading: false,
        list: s.list.filter((p) => p._id !== id),
        totalItems: Math.max(0, s.totalItems - 1),
      }));
      return json;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },
}));

const productsState = (root) => root?.products ?? root;

export const selectFilteredProperties = (root) => {
  const state = productsState(root);
  return Array.isArray(state?.list) ? state.list : [];
};

export const selectPropertiesByUserId = (root, id) =>
  (productsState(root)?.list || []).filter((p) => (p.userId?._id || p.userId) === id);

export const selectPropertyById = (root, id) => {
  if (!id) return null;
  const state = productsState(root);
  const current = state?.currentProperty;
  if (current && String(current._id) === String(id)) return current;
  return (state?.list || []).find((p) => String(p._id) === String(id)) || null;
};

export const selectWishlistedProperties = (root, wishlistIds) => {
  if (!wishlistIds || !Array.isArray(wishlistIds)) return [];
  return (productsState(root)?.list || []).filter(
    (p) => wishlistIds.includes(p._id) || wishlistIds.includes(p.id)
  );
};

// Back-compat action exports
const s = () => useVendorProductsStore.getState();
export const setSearch = (v) => s().setSearch(v);
export const setTypeFilter = (v) => s().setTypeFilter(v);
export const setStatusFilter = (v) => s().setStatusFilter(v);
export const setCityFilter = (v) => s().setCityFilter(v);
export const setPage = (v) => s().setPage(v);
export const setSelectedProperty = (v) => s().setSelectedProperty(v);
export const updatePropertyStatus = (v) => s().updatePropertyStatus(v);
export const fetchProducts = (v) => s().fetchProducts(v);
export const createProperty = (v) => s().createProperty(v);
export const fetchPropertyById = (v) => s().fetchPropertyById(v);
export const updateProperty = (v) => s().updateProperty(v);
export const deleteProperty = (v) => s().deleteProperty(v);
