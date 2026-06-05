export const PAYMENT_CANCELLED = 'Payment cancelled';

/**
 * Normalize API / Razorpay / Redux errors into a user-readable string.
 */
export function getErrorMessage(error) {
  if (error == null || error === '') return 'Something went wrong';
  if (typeof error === 'string') return error;
  if (typeof error === 'number' || typeof error === 'boolean') return String(error);

  if (error instanceof Error) {
    return error.message || 'Something went wrong';
  }

  if (typeof error === 'object') {
    if (typeof error.message === 'string' && error.message.trim()) {
      return error.message;
    }
    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }
    if (typeof error.description === 'string' && error.description.trim()) {
      return error.description;
    }
    if (typeof error.payload === 'string' && error.payload.trim()) {
      return error.payload;
    }
    if (error.payload != null) {
      const nested = getErrorMessage(error.payload);
      if (nested !== 'Something went wrong') return nested;
    }
  }

  return 'Something went wrong';
}

export function isPaymentCancelled(error) {
  const msg = getErrorMessage(error).toLowerCase();
  return msg.includes('cancel') || msg.includes('dismiss') || msg.includes('user_cancelled');
}

/** Message for react-hot-toast after a failed subscription purchase. */
export function formatPurchaseToastError(error) {
  const msg = getErrorMessage(error);
  if (isPaymentCancelled(msg)) {
    return 'Payment cancelled. No charge was made.';
  }
  return `Purchase failed: ${msg}`;
}
