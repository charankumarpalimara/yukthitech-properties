import { create } from 'zustand';
import { VENDORAPI_URL, apiClient } from '../service/api';

export const useVendorSupportStore = create((set, get) => ({
  statusFilter: 'All',
  categoryFilter: 'All',
  priorityFilter: 'All',
  searchFilter: '',
  tickets: [],
  currentTicket: null,
  loading: false,
  error: null,
  stats: { open: 0, inProgress: 0, resolvedToday: 0, avgResponseTime: '0.0h' },
  pagination: { current: 1, total: 1, count: 0 },

  setStatusFilter: (statusFilter) =>
    set({ statusFilter, pagination: { ...get().pagination, current: 1 } }),
  setCategoryFilter: (categoryFilter) =>
    set({ categoryFilter, pagination: { ...get().pagination, current: 1 } }),
  setPriorityFilter: (priorityFilter) =>
    set({ priorityFilter, pagination: { ...get().pagination, current: 1 } }),
  setSearchFilter: (searchFilter) =>
    set({ searchFilter, pagination: { ...get().pagination, current: 1 } }),
  setPage: (current) => set({ pagination: { ...get().pagination, current } }),
  clearError: () => set({ error: null }),

  fetchVendorSupportTickets: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (filters.status && filters.status !== 'All') queryParams.append('status', filters.status);
      if (filters.priority && filters.priority !== 'All')
        queryParams.append('priority', filters.priority);
      if (filters.category && filters.category !== 'All')
        queryParams.append('category', filters.category);
      if (filters.ticketType && filters.ticketType !== 'All')
        queryParams.append('ticketType', filters.ticketType);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const response = await apiClient(`${VENDORAPI_URL}/support/tickets?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch tickets');
      const data = await response.json();
      set({
        loading: false,
        tickets: data.data.tickets,
        stats: data.data.stats,
        pagination: data.data.pagination,
      });
      return data.data;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  fetchSupportTicketById: async (ticketId) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient(`${VENDORAPI_URL}/support/tickets/${ticketId}`);
      if (!response.ok) throw new Error('Failed to fetch ticket');
      const data = await response.json();
      set({ loading: false, currentTicket: data.data });
      return data.data;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  createVendorSupportTicket: async (ticketData) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient(`${VENDORAPI_URL}/support/tickets`, {
        method: 'POST',
        body: JSON.stringify(ticketData),
      });
      if (!response.ok) throw new Error('Failed to create ticket');
      const data = await response.json();
      set((s) => ({ loading: false, tickets: [data.data, ...s.tickets] }));
      return data.data;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  updateVendorTicketStatus: async ({ ticketId, status }) => {
    try {
      const response = await apiClient(`${VENDORAPI_URL}/support/tickets/${ticketId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update ticket status');
      const data = await response.json();
      const updated = data.data;
      set((s) => ({
        tickets: s.tickets.map((t) => (t._id === updated._id ? updated : t)),
        currentTicket: s.currentTicket?._id === updated._id ? updated : s.currentTicket,
      }));
      return updated;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  sendVendorMessage: async ({ ticketId, message }) => {
    try {
      const response = await apiClient(`${VENDORAPI_URL}/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      const data = await response.json();
      const payload = { ticketId, message };
      set((s) => {
        const tickets = s.tickets.map((ticket) => {
          if (ticket._id !== ticketId) return ticket;
          const messages = [
            ...(ticket.messages || []),
            {
              sender: 'user',
              content: message,
              timestamp: new Date(),
            },
          ];
          return { ...ticket, messages };
        });
        let currentTicket = s.currentTicket;
        if (currentTicket?._id === ticketId) {
          currentTicket = {
            ...currentTicket,
            messages: [
              ...(currentTicket.messages || []),
              { sender: 'user', content: message, timestamp: new Date() },
            ],
          };
        }
        return { tickets, currentTicket };
      });
      return data.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
}));

const vendorSupportState = (root) => root?.vendorSupport ?? root;

export const selectVendorTickets = (root) => vendorSupportState(root)?.tickets || [];
export const selectCurrentTicket = (root) => vendorSupportState(root)?.currentTicket;
export const selectVendorStats = (root) => vendorSupportState(root)?.stats || {};
export const selectVendorLoading = (root) => vendorSupportState(root)?.loading || false;
export const selectVendorError = (root) => vendorSupportState(root)?.error;
export const selectVendorFilters = (root) => {
  const s = vendorSupportState(root);
  return {
    statusFilter: s?.statusFilter || 'All',
    categoryFilter: s?.categoryFilter || 'All',
    priorityFilter: s?.priorityFilter || 'All',
    searchFilter: s?.searchFilter || '',
    pagination: s?.pagination || { current: 1, total: 1, count: 0 },
  };
};
export const selectVendorPagination = (root) =>
  vendorSupportState(root)?.pagination || { current: 1, total: 1, count: 0 };
export const selectFilteredVendorTickets = (root) => {
  const s = vendorSupportState(root);
  const { statusFilter, categoryFilter, priorityFilter, searchFilter, tickets } = s;
  return (tickets || []).filter(
    (ticket) =>
      (statusFilter === 'All' || ticket.status === statusFilter.toLowerCase()) &&
      (categoryFilter === 'All' || ticket.category === categoryFilter) &&
      (priorityFilter === 'All' || ticket.priority === priorityFilter) &&
      (searchFilter === '' ||
        ticket.subject?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        ticket._id?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        ticket.userId?.name?.toLowerCase().includes(searchFilter.toLowerCase()))
  );
};

const vs = () => useVendorSupportStore.getState();
export const fetchVendorSupportTickets = (...a) => vs().fetchVendorSupportTickets(...a);
export const fetchSupportTicketById = (...a) => vs().fetchSupportTicketById(...a);
export const createVendorSupportTicket = (...a) => vs().createVendorSupportTicket(...a);
export const updateVendorTicketStatus = (...a) => vs().updateVendorTicketStatus(...a);
export const sendVendorMessage = (...a) => vs().sendVendorMessage(...a);
export const setStatusFilter = (...a) => vs().setStatusFilter(...a);
export const setCategoryFilter = (...a) => vs().setCategoryFilter(...a);
export const setPriorityFilter = (...a) => vs().setPriorityFilter(...a);
export const setSearchFilter = (...a) => vs().setSearchFilter(...a);
export const setPage = (...a) => vs().setPage(...a);
export const clearError = (...a) => vs().clearError(...a);
