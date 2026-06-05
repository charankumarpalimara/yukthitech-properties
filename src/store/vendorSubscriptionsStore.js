import { create } from 'zustand';
import { VENDORAPI_URL } from '../service/api';
import { loadScript } from '../utils/loadScript';
import { buildRazorpayPrefill, getStoredAuthUser } from '../utils/razorpayPrefill';
import { getErrorMessage, PAYMENT_CANCELLED } from '../utils/getErrorMessage';
import { useAuthStore } from './authStore';

const PLANS_URL = `${VENDORAPI_URL}/subscription-plans`;
const FEATURES_URL = `${PLANS_URL}/features`;
const HISTORY_URL = `${VENDORAPI_URL}/subscription-history`;
const PURCHASE_HISTORY_URL = `${VENDORAPI_URL}/purchase-subscription`;
const VERIFY_PAYMENT_URL = `${VENDORAPI_URL}/purchase-subscription/verify-payment`;
const FAIL_PAYMENT_URL = `${VENDORAPI_URL}/purchase-subscription/fail-payment`;

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

export const useVendorSubscriptionsStore = create((set) => ({
  plans: [],
  features: [],
  history: { data: [], metadata: {}, pagination: {}, activePlanDetails: {} },
  loading: false,
  error: null,
  billingCycle: 'annual',

  setBillingCycle: (billingCycle) => set({ billingCycle }),
  clearSubscriptionError: () => set({ error: null }),

  fetchSubscriptionHistory: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const query = new URLSearchParams(params).toString();
      const url = query ? `${HISTORY_URL}?${query}` : HISTORY_URL;
      const res = await fetch(url, { headers: getAuthHeader() });
      const json = await res.json();
      if (!json.success) throw new Error(getErrorMessage(json.error || json.message));
      set({ loading: false, history: json });
      return json;
    } catch (e) {
      set({ loading: false, error: getErrorMessage(e) });
      throw e;
    }
  },

  fetchFeatures: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(FEATURES_URL, { headers: getAuthHeader() });
      const json = await res.json();
      if (!json.success) throw new Error(getErrorMessage(json.error || json.message));
      set({ loading: false, features: json.data });
      return json.data;
    } catch (e) {
      set({ loading: false, error: getErrorMessage(e) });
      throw e;
    }
  },

  fetchPlans: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(PLANS_URL, { headers: getAuthHeader() });
      const json = await res.json();
      if (!json.success) throw new Error(getErrorMessage(json.error || json.message));
      set({ loading: false, plans: json.data });
      return json.data;
    } catch (e) {
      set({ loading: false, error: getErrorMessage(e) });
      throw e;
    }
  },

  purchaseSubscription: async (purchaseData) => {
    set({ loading: true, error: null });
    try {
      const loaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!loaded)
        throw new Error('Razorpay SDK failed to load. Please check your network connection.');

      const res = await fetch(PURCHASE_HISTORY_URL, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(purchaseData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(getErrorMessage(json.error || json.message));

      const payment = json.data.payment;

      const result = await new Promise((resolve, reject) => {
        const options = {
          key: payment.razorpayKey,
          name: 'Subscription Purchase',
          description: payment.isRecurring
            ? 'Recurring Subscription (Autopay)'
            : 'Plan Subscription',
          handler: async function (response) {
            try {
              const verifyPayload = {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              };
              if (payment.isRecurring) {
                verifyPayload.razorpay_subscription_id =
                  response.razorpay_subscription_id || payment.subscriptionId;
              } else {
                verifyPayload.razorpay_order_id = response.razorpay_order_id || payment.orderId;
              }
              const verifyRes = await fetch(VERIFY_PAYMENT_URL, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(verifyPayload),
              });
              const verifyJson = await verifyRes.json();
              if (!verifyJson.success) {
                throw new Error(getErrorMessage(verifyJson.message || verifyJson.error));
              }
              resolve(verifyJson);
            } catch (error) {
              reject(getErrorMessage(error));
            }
          },
          modal: {
            ondismiss: async function () {
              try {
                const failPayload = {
                  error_code: 'USER_CANCELLED',
                  error_description: 'Payment cancelled by the user',
                };
                if (payment.isRecurring) {
                  failPayload.razorpay_subscription_id = payment.subscriptionId;
                } else {
                  failPayload.razorpay_order_id = payment.orderId;
                }
                await fetch(FAIL_PAYMENT_URL, {
                  method: 'POST',
                  headers: getAuthHeader(),
                  body: JSON.stringify(failPayload),
                });
              } catch (err) {
                console.error('Failed to log user cancellation:', err);
              }
              reject(PAYMENT_CANCELLED);
            },
          },
          theme: { color: '#023526' },
        };

        const authUser = useAuthStore.getState().user || getStoredAuthUser();
        const prefill = buildRazorpayPrefill(payment, authUser);
        if (prefill) options.prefill = prefill;

        if (payment.isRecurring) {
          options.subscription_id = payment.subscriptionId;
        } else {
          options.amount = payment.amount;
          options.currency = payment.currency;
          options.order_id = payment.orderId;
        }

        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', async function (response) {
          try {
            const failPayload = {
              error_code: response.error.code,
              error_description: response.error.description,
            };
            if (payment.isRecurring) {
              failPayload.razorpay_subscription_id =
                response.error.metadata.subscription_id || payment.subscriptionId;
            } else {
              failPayload.razorpay_order_id = response.error.metadata.order_id || payment.orderId;
            }
            await fetch(FAIL_PAYMENT_URL, {
              method: 'POST',
              headers: getAuthHeader(),
              body: JSON.stringify(failPayload),
            });
          } catch (err) {
            console.error('Failed to log payment failure to backend:', err);
          }
          reject(getErrorMessage(response?.error?.description) || 'Payment failed');
        });

        razorpay.open();
      });

      set({ loading: false });
      return result;
    } catch (e) {
      set({ loading: false, error: getErrorMessage(e) });
      throw e;
    }
  },
}));

const sub = () => useVendorSubscriptionsStore.getState();
export const fetchSubscriptionHistory = (...a) => sub().fetchSubscriptionHistory(...a);
export const fetchFeatures = (...a) => sub().fetchFeatures(...a);
export const fetchPlans = (...a) => sub().fetchPlans(...a);
export const purchaseSubscription = (...a) => sub().purchaseSubscription(...a);
export const setBillingCycle = (...a) => sub().setBillingCycle(...a);
export const clearSubscriptionError = (...a) => sub().clearSubscriptionError(...a);
