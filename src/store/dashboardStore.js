import { create } from 'zustand';
import { VENDORAPI_URL } from '../service/api';

const DASHBOARD_URL = `${VENDORAPI_URL}/dashboard`;

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

export const useDashboardStore = create((set) => ({
  kpis: [],
  loading: false,
  error: null,

  fetchDashboardStats: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(DASHBOARD_URL, { headers: getAuthHeader() });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || json.message);
      set({ loading: false, kpis: json.data.kpis });
      return json.data;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },
}));

export const fetchDashboardStats = (...a) => useDashboardStore.getState().fetchDashboardStats(...a);
