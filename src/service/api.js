export const API_URL =
  import.meta.env.VITE_API_URL || 'https://api.sherlaproperties.com/api/website';
export const VENDORAPI_URL =
  import.meta.env.VITE_VENDOR_API_URL || 'https://api.sherlaproperties.com/api/vendor';

//  export const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.0.117:9000/api/website';
//export const VENDORAPI_URL = import.meta.env.VITE_VENDOR_API_URL || 'http://192.168.0.117:9000/api/vendor';

/**
 * Global API Client for all requests
 */
export const apiClient = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const fcmToken = localStorage.getItem('fcmToken');

  const headers = {
    ...options.headers,
  };

  let body = options.body;

  // Only set Content-Type if not sending FormData
  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';

    // Inject fcmToken into JSON body if it's a mutation request
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method?.toUpperCase())) {
      try {
        const currentBody = body ? JSON.parse(body) : {};
        body = JSON.stringify({ ...currentBody });
      } catch (e) {
        // If parsing fails (e.g. not a JSON string), leave as is
        console.warn('Failed to inject fcmToken into body:', e);
      }
    }
  }

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 30000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      body,
      signal: options.signal ?? controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};
