import { create } from 'zustand';
import { API_URL, apiClient } from '../service/api';
import { loadScript } from '../utils/loadScript';
import { buildRazorpayPrefill, getStoredAuthUser } from '../utils/razorpayPrefill';
import { getErrorMessage, PAYMENT_CANCELLED } from '../utils/getErrorMessage';
import { useAuthStore } from './authStore';

const PLANS_URL = `${API_URL}/subscription-plans`;
const PURCHASE_HISTORY_URL = `${API_URL}/subscription-plan-history/purchase-plan`;
const VENDOR_REGISTER_URL = `${API_URL}/registration/vendor-register`;
const VERIFY_PAYMENT_URL = `${API_URL}/subscription-plan-history/verify-payment`;
const FAIL_PAYMENT_URL = `${API_URL}/subscription-plan-history/fail-payment`;

export const useSubscriptionStore = create((set) => ({
  plans: [],
  features: [],
  loading: false,
  error: null,
  billingCycle: 'monthly',

  setBillingCycle: (billingCycle) => set({ billingCycle }),
  clearSubscriptionError: () => set({ error: null }),

  fetchPlans: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient(PLANS_URL);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || json.message);
      set({ loading: false, plans: json.data });
      return json.data;
    } catch (e) {
      set({ loading: false, error: getErrorMessage(e) });
      throw e;
    }
  },

  purchaseSubscription: async (purchaseData) => {
    try {
      const loaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!loaded) {
        throw new Error('Razorpay SDK failed to load. Please check your network connection.');
      }

      const res = await apiClient(PURCHASE_HISTORY_URL, {
        method: 'POST',
        body: JSON.stringify(purchaseData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(getErrorMessage(json.error || json.message));

      const payment = json.data.payment;

      return await new Promise((resolve, reject) => {
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
              const verifyRes = await apiClient(VERIFY_PAYMENT_URL, {
                method: 'POST',
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
                await apiClient(FAIL_PAYMENT_URL, {
                  method: 'POST',
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
            await apiClient(FAIL_PAYMENT_URL, {
              method: 'POST',
              body: JSON.stringify(failPayload),
            });
          } catch (err) {
            console.error('Failed to log payment failure to backend:', err);
          }
          reject(getErrorMessage(response?.error?.description) || 'Payment failed');
        });

        razorpay.open();
      });
    } catch (e) {
      const msg = getErrorMessage(e);
      set({ error: msg });
      throw msg;
    }
  },

  registerVendor: async (registrationData) => {
    try {
      const isFormData = registrationData instanceof FormData;
      const res = await apiClient(VENDOR_REGISTER_URL, {
        method: 'POST',
        body: isFormData ? registrationData : JSON.stringify(registrationData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || json.message);
      return json.data;
    } catch (e) {
      const msg = getErrorMessage(e);
      set({ error: msg });
      throw msg;
    }
  },
}));

const sub = () => useSubscriptionStore.getState();
export const fetchPlans = (...a) => sub().fetchPlans(...a);
export const purchaseSubscription = (...a) => sub().purchaseSubscription(...a);
export const registerVendor = (...a) => sub().registerVendor(...a);
export const setBillingCycle = (...a) => sub().setBillingCycle(...a);
export const clearSubscriptionError = (...a) => sub().clearSubscriptionError(...a);
