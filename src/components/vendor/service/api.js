// Base server URL (no sub-path)
//export const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:9000";
export const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api.yukthiproperties.com';

// Vendor API (for property, etc.)
export const API_URL = import.meta.env.VITE_VENDOR_API_URL || `${BASE_URL}/api/vendor`;

// Website API (auth, subscriptions, etc.)
export const WEBSITE_API_URL = import.meta.env.VITE_API_URL || `${BASE_URL}/api/website`;
