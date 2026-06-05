import { create } from 'zustand';
import { VENDORAPI_URL } from '../service/api';

const CATEGORY_API_URL = `${VENDORAPI_URL}/categories`;

export const useVendorCategoriesStore = create((set, get) => ({
  categories: [],
  counts: { total: 0, active: 0, inactive: 0 },
  statusFilter: 'All',
  loading: false,
  error: null,

  setStatusFilter: (statusFilter) => set({ statusFilter }),

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(CATEGORY_API_URL);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch');
      set({
        loading: false,
        categories: data.data,
        counts: data.count,
      });
      return data;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  addCategory: async (formData) => {
    set({ loading: true });
    try {
      const response = await fetch(CATEGORY_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to add');
      const payload = data.data;
      set((s) => ({
        loading: false,
        categories: [payload, ...s.categories],
        counts: {
          ...s.counts,
          total: s.counts.total + 1,
          active: s.counts.active + (payload.isActive ? 1 : 0),
          inactive: s.counts.inactive + (payload.isActive ? 0 : 1),
        },
      }));
      return payload;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  updateCategory: async (payload) => {
    set({ loading: true });
    try {
      const id = payload._id || payload.id;
      const dataToUpdate = payload.formData || payload;
      const response = await fetch(`${CATEGORY_API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToUpdate),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update');
      const updated = data.data;
      set((s) => {
        const categories = [...s.categories];
        const index = categories.findIndex((c) => c._id === updated._id);
        let counts = { ...s.counts };
        if (index !== -1) {
          const oldStatus = categories[index].isActive;
          const newStatus = updated.isActive;
          if (oldStatus !== newStatus) {
            if (newStatus) {
              counts.active += 1;
              counts.inactive -= 1;
            } else {
              counts.active -= 1;
              counts.inactive += 1;
            }
          }
          categories[index] = updated;
        }
        return { loading: false, categories, counts };
      });
      return updated;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  deleteCategory: async (id) => {
    set({ loading: true });
    try {
      const response = await fetch(`${CATEGORY_API_URL}/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete');
      set((s) => {
        const category = s.categories.find((c) => c._id === id);
        let counts = { ...s.counts };
        if (category) {
          if (category.isActive) counts.active -= 1;
          else counts.inactive -= 1;
          counts.total -= 1;
        }
        return {
          loading: false,
          categories: s.categories.filter((c) => c._id !== id),
          counts,
        };
      });
      return id;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },
}));

export const selectFilteredCategories = (root) => {
  const state = root?.vendorCategories ?? root;
  const { statusFilter, categories } = state;
  if (statusFilter === 'All') return categories;
  const isActive = statusFilter === 'Active';
  return categories.filter((c) => c.isActive === isActive);
};

const s = () => useVendorCategoriesStore.getState();
export const fetchCategories = (...args) => s().fetchCategories(...args);
export const addCategory = (...args) => s().addCategory(...args);
export const updateCategory = (...args) => s().updateCategory(...args);
export const deleteCategory = (...args) => s().deleteCategory(...args);
export const setStatusFilter = (...args) => s().setStatusFilter(...args);
