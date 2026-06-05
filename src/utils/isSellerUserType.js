const SELLER_USER_TYPES = new Set(['owner', 'agent', 'builder', 'seller']);

/** User types that use the vendor panel — not the public /subscription page. */
export function isSellerUserType(type) {
  if (type == null || type === '') return false;
  return SELLER_USER_TYPES.has(String(type).toLowerCase());
}
