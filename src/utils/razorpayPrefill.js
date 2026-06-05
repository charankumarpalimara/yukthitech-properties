/**
 * Razorpay Checkout prefill.contact must be a valid 10-digit Indian mobile (no +91 prefix).
 * @see https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/#123
 */

const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

/**
 * Normalize any phone string to 10-digit Indian mobile for Razorpay, or undefined if invalid.
 */
export function normalizeIndianMobileForRazorpay(value) {
  if (value == null || value === '') return undefined;

  let digits = String(value).replace(/\D/g, '');

  if (digits.length > 10 && digits.startsWith('91')) {
    digits = digits.slice(-10);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  if (digits.length > 10) {
    digits = digits.slice(-10);
  }

  return INDIAN_MOBILE_REGEX.test(digits) ? digits : undefined;
}

function pickMobileFromSource(source) {
  if (!source || typeof source !== 'object') return undefined;

  const fields = [
    source.mobile,
    source.phone,
    source.userMobile,
    source.userPhone,
    source.contactNumber,
    source.contact,
    source.businessMobile,
  ];

  for (const field of fields) {
    const normalized = normalizeIndianMobileForRazorpay(field);
    if (normalized) return normalized;
  }

  return undefined;
}

function pickNameFromSource(source) {
  if (!source || typeof source !== 'object') return undefined;
  const name = source.name || source.userName || source.fullName || source.contactPersonName;
  return name ? String(name).trim() : undefined;
}

function pickEmailFromSource(source) {
  if (!source || typeof source !== 'object') return undefined;
  const email = source.email || source.userEmail;
  return email ? String(email).trim() : undefined;
}

/**
 * Build Razorpay Checkout prefill from payment API payload and/or logged-in user.
 * Payment object is tried first; user fallback fills missing/wrong backend values.
 */
export function buildRazorpayPrefill(payment = {}, userFallback = null) {
  const prefill = {};

  const name = pickNameFromSource(payment) || pickNameFromSource(userFallback);
  const email = pickEmailFromSource(payment) || pickEmailFromSource(userFallback);
  const contact = pickMobileFromSource(payment) || pickMobileFromSource(userFallback);

  if (name) prefill.name = name;
  if (email) prefill.email = email;
  if (contact) prefill.contact = contact;

  return Object.keys(prefill).length > 0 ? prefill : undefined;
}

/** Read cached user from localStorage (vendor panel stores JSON user). */
export function getStoredAuthUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
