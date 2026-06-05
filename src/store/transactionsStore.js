import { create } from 'zustand';
import { API_URL, VENDORAPI_URL } from '../service/api';

const TRANSACTIONS_URL = `${VENDORAPI_URL}/transaction-history`;

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

export const useTransactionsStore = create((set) => ({
  list: [],
  stats: { paymentSuccess: 0, paymentFailed: 0 },
  pagination: { page: 1, pages: 1, limit: 10, total: 0 },
  loading: false,
  error: null,

  fetchTransactionHistory: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const query = new URLSearchParams(params).toString();
      const url = query ? `${TRANSACTIONS_URL}?${query}` : TRANSACTIONS_URL;
      const res = await fetch(url, { headers: getAuthHeader() });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || json.message);
      set({
        loading: false,
        list: json.data.transactions,
        stats: json.data.stats,
        pagination: json.data.pagination,
      });
      return json.data;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },
}));

export const fetchTransactionHistory = (...a) =>
  useTransactionsStore.getState().fetchTransactionHistory(...a);
