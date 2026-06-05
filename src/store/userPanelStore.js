import { create } from 'zustand';
import { MOCK_USER_DATA } from '../data/constants';

export const useUserPanelStore = create((set) => ({
  ...MOCK_USER_DATA,

  updateProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),

  sendMessage: () => {},

  addTicket: (ticket) => set((s) => ({ tickets: [ticket, ...s.tickets] })),

  markAllNotificationsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, unread: false })),
    })),

  toggleSetting: (key) => set((s) => ({ settings: { ...s.settings, [key]: !s.settings[key] } })),
}));
