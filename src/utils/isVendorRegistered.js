/**
 * Whether the seller completed vendor profile registration (required to post properties).
 * API sets `user.registered`; fall back to key profile fields when the flag is absent.
 */
export function isVendorRegistered(user) {
  if (!user) return false;
  if (user.registered === true) return true;
  return Boolean(user.contactPersonName && user.mobile && user.address1 && user.city && user.state);
}
