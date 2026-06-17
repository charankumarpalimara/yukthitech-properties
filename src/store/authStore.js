import { create } from 'zustand';
import { API_URL, apiClient } from '../service/api';

const AUTH_URL = `${API_URL}/auth`;

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch {
    return null;
  }
};

/** JWT may appear on different keys depending on API version. */
const resolveAuthToken = (json) =>
  json?.token || json?.accessToken || json?.data?.token || null;

export const hasAuthToken = () => Boolean(localStorage.getItem('token'));

const hasStoredSession = () => Boolean(hasAuthToken() || readUser());

const applyAuthPayload = (json, set) => {
  const token = resolveAuthToken(json);
  if (token) localStorage.setItem('token', token);
  if (json.firebaseToken) localStorage.setItem('firebaseToken', json.firebaseToken);
  if (json.data) localStorage.setItem('user', JSON.stringify(json.data));

  set({
    loading: false,
    isLoggedIn: true,
    user: json.data || null,
  });
};

export const useAuthStore = create((set, get) => ({
  isLoggedIn: hasStoredSession(),
  user: readUser(),
  error: null,
  loading: false,
  isLoginModalOpen: false,
  isRegisterModalOpen: false,
  modalMessage: null,
  devOtp: null,

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('firebaseToken');
    localStorage.removeItem('user');
    set({
      isLoggedIn: false,
      user: null,
      error: null,
      loading: false,
      devOtp: null,
    });
  },

  loginSuccess: (user) => {
    set({
      isLoggedIn: true,
      user,
      isLoginModalOpen: false,
      isRegisterModalOpen: false,
    });
  },

  updateProfile: (patch) => {
    const user = { ...get().user, ...patch };
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  openLoginModal: (message) => {
    set({
      isLoginModalOpen: true,
      isRegisterModalOpen: false,
      modalMessage: message || null,
      error: null,
      loading: false,
    });
  },

  closeLoginModal: () => set({ isLoginModalOpen: false }),

  openRegisterModal: () => {
    set({
      isRegisterModalOpen: true,
      isLoginModalOpen: false,
      error: null,
      loading: false,
    });
  },

  closeRegisterModal: () => set({ isRegisterModalOpen: false }),

  clearError: () => set({ error: null }),

  resetOtpState: () => set({ devOtp: null, error: null }),

  sendOtp: async ({ mobile, type }) => {
    set({ loading: true, error: null, devOtp: null });
    try {
      const fcmToken = localStorage.getItem('fcmToken');
      const res = await apiClient(`${AUTH_URL}/send-otp`, {
        method: 'POST',
        body: JSON.stringify({ mobile, type, fcmToken }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || json.message);
      set({
        loading: false,
        devOtp: json.devOtp || json.data?.otp || null,
      });
      return json;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  verifyOtp: async ({ mobile, otp }) => {
    set({ loading: true, error: null });
    try {
      const fcmToken = localStorage.getItem('fcmToken');
      const res = await apiClient(`${AUTH_URL}/verify-otp`, {
        method: 'POST',
        body: JSON.stringify({ mobile, otp, fcmToken }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || json.message);

      // isRegister false → profile incomplete: stay on modal step 3 (register), no session yet.
      // isRegister true  → already registered: log in (token optional on verify).
      if (json.isRegister === true && json.data) {
        applyAuthPayload(json, set);
      } else {
        set({ loading: false });
      }
      return json;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  login: async (loginData) => {
    set({ loading: true, error: null });
    try {
      const fcmToken = localStorage.getItem('fcmToken');
      const res = await apiClient(`${AUTH_URL}/login`, {
        method: 'POST',
        body: JSON.stringify({ ...loginData, fcmToken }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || json.message);

      if (json.token) localStorage.setItem('token', json.token);
      if (json.data) localStorage.setItem('user', JSON.stringify(json.data));

      set({ loading: false, isLoggedIn: true, user: json.data });
      return json.data;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  getMe: async () => {
    if (!hasAuthToken()) {
      return get().user || readUser() || null;
    }
    try {
      const res = await apiClient(`${AUTH_URL}/me`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      localStorage.setItem('user', JSON.stringify(json.data));
      set({ isLoggedIn: true, user: json.data });
      return json.data;
    } catch {
      if (hasAuthToken()) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ isLoggedIn: false, user: null });
      }
      throw new Error('Session expired');
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const fcmToken = localStorage.getItem('fcmToken');
      const res = await apiClient(`${AUTH_URL}/register`, {
        method: 'POST',
        body: JSON.stringify({ ...userData, fcmToken }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || json.message);

      applyAuthPayload(json, set);
      return json.data;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  updateUserProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient(`${AUTH_URL}/updateProfile`, {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || json.message);
      const userData = json.data?.user ?? json.data;
      if (userData) localStorage.setItem('user', JSON.stringify(userData));
      set({ loading: false, user: userData });
      return userData;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  uploadAvatar: async (file) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await apiClient(`${AUTH_URL}/upload-avatar`, {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || json.message);

      const currentUser = get().user || {};
      const updatedUser = { ...currentUser, avatar: json.data.avatar };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      set({ loading: false, user: updatedUser });
      return json.data.avatar;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  deleteAccount: async (reason = '') => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient(`${AUTH_URL}/delete-account`, {
        method: 'DELETE',
        body: JSON.stringify({ reason }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || json.message);
      get().logout();
      set({ loading: false });
      return json;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },
}));

export const selectCurrentUser = (root) => (root?.auth ?? root)?.user ?? null;

// Back-compat named exports (used by legacy imports)
export const logout = (...args) => useAuthStore.getState().logout(...args);
export const loginSuccess = (...args) => useAuthStore.getState().loginSuccess(...args);
export const openLoginModal = (...args) => useAuthStore.getState().openLoginModal(...args);
export const closeLoginModal = (...args) => useAuthStore.getState().closeLoginModal(...args);
export const openRegisterModal = (...args) => useAuthStore.getState().openRegisterModal(...args);
export const closeRegisterModal = (...args) => useAuthStore.getState().closeRegisterModal(...args);
export const updateProfile = (...args) => useAuthStore.getState().updateProfile(...args);
export const clearError = (...args) => useAuthStore.getState().clearError(...args);
export const resetOtpState = (...args) => useAuthStore.getState().resetOtpState(...args);
export const sendOtp = (...args) => useAuthStore.getState().sendOtp(...args);
export const verifyOtp = (...args) => useAuthStore.getState().verifyOtp(...args);
export const login = (...args) => useAuthStore.getState().login(...args);
export const getMe = (...args) => useAuthStore.getState().getMe(...args);
export const register = (...args) => useAuthStore.getState().register(...args);
export const updateUserProfile = (...args) => useAuthStore.getState().updateUserProfile(...args);
export const uploadAvatar = (...args) => useAuthStore.getState().uploadAvatar(...args);
export const deleteAccount = (...args) => useAuthStore.getState().deleteAccount(...args);
