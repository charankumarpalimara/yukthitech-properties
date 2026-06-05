import { create } from 'zustand';
import { API_URL, apiClient } from '../service/api';

export const useSupportStore = create((set, get) => ({
  tickets: [],
  currentTicket: null,
  messages: [],
  loading: false,
  error: null,
  categories: [
    'Listing Issue',
    'Payment/Subscription',
    'Technical Support',
    'Account/Profile',
    'Other',
  ],
  priorities: ['Low', 'Medium', 'High', 'Urgent'],
  stats: { total: 0, open: 0, resolved: 0, pending: 0 },

  setCurrentTicket: (currentTicket) => set({ currentTicket }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  clearError: () => set({ error: null }),
  updateTicketStatus: ({ ticketId, status }) => {
    const tickets = get().tickets.map((t) => (t._id === ticketId ? { ...t, status } : t));
    set({ tickets });
  },

  createSupportTicket: async (ticketData) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient(`${API_URL}/support/tickets`, {
        method: 'POST',
        body: JSON.stringify(ticketData),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      const newTicket = data.data || data;
      set((s) => ({
        loading: false,
        tickets: [newTicket, ...s.tickets],
        stats: {
          ...s.stats,
          total: s.stats.total + 1,
          open: s.stats.open + 1,
        },
      }));
      return data;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  fetchSupportTickets: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient(`${API_URL}/support/tickets`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      const tickets = data.data || data;
      set({
        loading: false,
        tickets,
        stats: {
          total: tickets.length,
          open: tickets.filter((t) => t.status === 'open').length,
          resolved: tickets.filter((t) => t.status === 'resolved').length,
          pending: tickets.filter((t) => t.status === 'pending').length,
        },
        error: null,
      });
      return data;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  updateSupportTicket: async ({ ticketId, updateData }) => {
    const response = await apiClient(`${API_URL}/support/tickets/${ticketId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    const updatedTicket = data.data || data;
    set((s) => ({
      tickets: s.tickets.map((t) => (t._id === updatedTicket._id ? updatedTicket : t)),
    }));
    return updatedTicket;
  },

  sendSupportMessage: async ({ ticketId, message }) => {
    const response = await apiClient(`${API_URL}/support/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    const currentTicket = get().currentTicket;
    if (currentTicket?._id === ticketId) {
      set({
        currentTicket: {
          ...currentTicket,
          messages: [...(currentTicket.messages || []), message],
        },
      });
    }
    return { ticketId, message };
  },
}));

const sup = () => useSupportStore.getState();
export const createSupportTicket = (...a) => sup().createSupportTicket(...a);
export const fetchSupportTickets = (...a) => sup().fetchSupportTickets(...a);
export const updateSupportTicket = (...a) => sup().updateSupportTicket(...a);
export const sendSupportMessage = (...a) => sup().sendSupportMessage(...a);
export const setCurrentTicket = (...a) => sup().setCurrentTicket(...a);
export const addMessage = (...a) => sup().addMessage(...a);
export const clearError = (...a) => sup().clearError(...a);
export const updateTicketStatus = (...a) => sup().updateTicketStatus(...a);
