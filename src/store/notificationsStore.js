import { create } from 'zustand';
import { API_URL, apiClient } from '../service/api';

export const useNotificationsStore = create((set, get) => ({
  list: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient(`${API_URL}/notifications`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      const list = json.data;
      set({
        loading: false,
        list,
        unreadCount: list.filter((n) => !n.isRead).length,
      });
      return list;
    } catch (err) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  markNotificationRead: async (id) => {
    await apiClient(`${API_URL}/notifications/${id}/read`, { method: 'PUT' });
    set((s) => {
      const list = s.list.map((n) => (n._id === id ? { ...n, isRead: true } : n));
      const notif = s.list.find((n) => n._id === id);
      const unreadCount = notif && !notif.isRead ? Math.max(0, s.unreadCount - 1) : s.unreadCount;
      return { list, unreadCount };
    });
  },

  markAllNotificationsRead: async () => {
    await apiClient(`${API_URL}/notifications/mark-all-read`, { method: 'PUT' });
    set((s) => ({
      list: s.list.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  deleteNotification: async (id) => {
    await apiClient(`${API_URL}/notifications/${id}`, { method: 'DELETE' });
    set((s) => {
      const notif = s.list.find((n) => n._id === id);
      const unreadCount = notif && !notif.isRead ? Math.max(0, s.unreadCount - 1) : s.unreadCount;
      return { list: s.list.filter((n) => n._id !== id), unreadCount };
    });
  },
}));

const n = () => useNotificationsStore.getState();
export const fetchNotifications = (...a) => n().fetchNotifications(...a);
export const markNotificationRead = (...a) => n().markNotificationRead(...a);
export const markAllNotificationsRead = (...a) => n().markAllNotificationsRead(...a);
export const deleteNotification = (...a) => n().deleteNotification(...a);
