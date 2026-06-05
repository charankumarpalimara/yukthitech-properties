import { create } from 'zustand';
import { VENDORAPI_URL } from '../service/api';
import { loadScript } from '../utils/loadScript';
import { buildRazorpayPrefill, getStoredAuthUser } from '../utils/razorpayPrefill';
import { getErrorMessage, PAYMENT_CANCELLED } from '../utils/getErrorMessage';
import { useAuthStore } from './authStore';

const BASE_URL = `${VENDORAPI_URL}/banner-orders`;
const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

export const useBannerOrdersStore = create((set, get) => ({
  availablePlans: [],
  myOrders: [],
  slotAvailability: null,
  currentOrder: null,
  loading: false,
  weeksLoading: false,
  error: null,
  successMessage: null,

  clearError: () => set({ error: null }),
  clearSuccessMessage: () => set({ successMessage: null }),
  clearCurrentOrder: () => set({ currentOrder: null }),

  fetchAvailablePlans: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/plans`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      set({ loading: false, availablePlans: json.data });
      return json.data;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  fetchMyOrders: async (status = '') => {
    set({ loading: true, error: null });
    try {
      const query = status ? `?status=${encodeURIComponent(status)}` : '';
      const res = await fetch(`${BASE_URL}${query}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      set({ loading: false, myOrders: json.data });
      return json.data;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  createBannerOrder: async ({ planId, bannerContent, startDate, webImage, mobileImage }) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('planId', planId);
      formData.append('bannerContent', JSON.stringify(bannerContent));
      if (startDate) formData.append('startDate', startDate);
      if (webImage) formData.append('bannerWeb', webImage);
      if (mobileImage) formData.append('bannerMobile', mobileImage);

      const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      set({ loading: false, currentOrder: json.data });
      return json.data;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  updateBannerOrder: async ({ orderId, bannerContent, webImage, mobileImage }) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('bannerContent', JSON.stringify(bannerContent));
      if (webImage) formData.append('bannerWeb', webImage);
      if (mobileImage) formData.append('bannerMobile', mobileImage);

      const res = await fetch(`${BASE_URL}/${orderId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      set((s) => {
        const myOrders = s.myOrders.map((o) => (o._id === json.data._id ? json.data : o));
        return {
          loading: false,
          currentOrder: json.data,
          myOrders,
          successMessage: 'Banner order updated successfully',
        };
      });
      return json.data;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  checkSlotAvailability: async ({
    pageType,
    position,
    duration,
    planId,
    startDate,
    month,
    year,
  }) => {
    const isSingleWeekCheck = Boolean(startDate);
    set(isSingleWeekCheck ? { weeksLoading: true, error: null } : { loading: true, error: null });
    try {
      const params = new URLSearchParams({ pageType, position, duration, planId });
      if (startDate) params.append('startDate', startDate);
      if (month) params.append('month', String(month));
      if (year) params.append('year', String(year));

      const res = await fetch(`${BASE_URL}/check-slots?${params.toString()}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      if (isSingleWeekCheck) {
        set((s) => ({
          weeksLoading: false,
          slotAvailability: {
            ...(s.slotAvailability || {}),
            ...json.data,
            weeks: s.slotAvailability?.weeks ?? [],
          },
        }));
      } else {
        set({ weeksLoading: false, loading: false, slotAvailability: json.data });
      }
      return json.data;
    } catch (e) {
      set({
        loading: false,
        weeksLoading: false,
        error: e.message || 'Failed to check availability',
      });
      throw e;
    }
  },

  processPayment: async ({ orderId, startDate }) => {
    set({ loading: true, error: null });
    try {
      const loaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!loaded) {
        throw new Error('Razorpay SDK failed to load. Please check your network connection.');
      }

      const checkoutRes = await fetch(`${BASE_URL}/${orderId}/checkout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      });
      const checkoutJson = await checkoutRes.json();
      if (!checkoutJson.success) {
        throw new Error(
          getErrorMessage(checkoutJson.message || checkoutJson.error) || 'Checkout failed'
        );
      }

      const payment = checkoutJson.data?.payment || checkoutJson.data;

      const data = await new Promise((resolve, reject) => {
        const authHeaders = {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        };

        const options = {
          key: payment.razorpayKey,
          amount: payment.amount,
          currency: payment.currency,
          order_id: payment.orderId,
          name: 'Yukthi Properties',
          description: 'Banner placement booking',
          handler: async function (response) {
            try {
              const verifyRes = await fetch(`${BASE_URL}/${orderId}/verify-payment`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  startDate,
                }),
              });
              const verifyJson = await verifyRes.json();
              if (!verifyJson.success) {
                throw new Error(
                  getErrorMessage(verifyJson.message || verifyJson.error) ||
                    'Payment verification failed'
                );
              }
              resolve(verifyJson.data);
            } catch (error) {
              reject(getErrorMessage(error));
            }
          },
          modal: {
            ondismiss: async function () {
              try {
                await fetch(`${BASE_URL}/${orderId}/fail-payment`, {
                  method: 'POST',
                  headers: authHeaders,
                  body: JSON.stringify({
                    razorpay_order_id: payment.orderId,
                    error_code: 'USER_CANCELLED',
                    error_description: 'Payment cancelled by the user',
                  }),
                });
              } catch (err) {
                console.error('Failed to log banner cancellation:', err);
              }
              reject(PAYMENT_CANCELLED);
            },
          },
          theme: { color: '#023526' },
        };

        const authUser = useAuthStore.getState().user || getStoredAuthUser();
        const prefill = buildRazorpayPrefill(payment, authUser);
        if (prefill) options.prefill = prefill;

        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', async function (response) {
          try {
            await fetch(`${BASE_URL}/${orderId}/fail-payment`, {
              method: 'POST',
              headers: authHeaders,
              body: JSON.stringify({
                razorpay_order_id: response.error?.metadata?.order_id || payment.orderId,
                error_code: response.error?.code,
                error_description: response.error?.description,
              }),
            });
          } catch (err) {
            console.error('Failed to log banner payment failure:', err);
          }
          reject(getErrorMessage(response?.error?.description) || 'Payment failed');
        });

        razorpay.open();
      });

      set((s) => {
        const myOrders = data ? s.myOrders.map((o) => (o._id === data._id ? data : o)) : s.myOrders;
        return {
          loading: false,
          successMessage: 'Payment successful! Banner pending verification.',
          currentOrder: data || s.currentOrder,
          myOrders,
        };
      });
      return data;
    } catch (e) {
      set({ loading: false, error: getErrorMessage(e) });
      throw e;
    }
  },
}));

const b = () => useBannerOrdersStore.getState();
export const fetchAvailablePlans = (...a) => b().fetchAvailablePlans(...a);
export const fetchMyOrders = (...a) => b().fetchMyOrders(...a);
export const createBannerOrder = (...a) => b().createBannerOrder(...a);
export const updateBannerOrder = (...a) => b().updateBannerOrder(...a);
export const checkSlotAvailability = (...a) => b().checkSlotAvailability(...a);
export const processPayment = (...a) => b().processPayment(...a);
export const clearError = (...a) => b().clearError(...a);
export const clearSuccessMessage = (...a) => b().clearSuccessMessage(...a);
export const clearCurrentOrder = (...a) => b().clearCurrentOrder(...a);
