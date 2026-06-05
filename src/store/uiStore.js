import { create } from 'zustand';

export const useUiStore = create((set) => ({
  sidebarCollapsed: false,
  notifications: 4,

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  clearNotifications: () => set({ notifications: 0 }),
}));

export const toggleSidebar = (...args) => useUiStore.getState().toggleSidebar(...args);
export const setSidebarCollapsed = (...args) => useUiStore.getState().setSidebarCollapsed(...args);
export const clearNotifications = (...args) => useUiStore.getState().clearNotifications(...args);
