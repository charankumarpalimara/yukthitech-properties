// Global fetch interceptor for the website and vendor portal
let isAlerting = false;

const originalFetch = window.fetch;

window.fetch = async function (input, init) {
  // 1. Resolve Request URL to check if it's an API request
  let urlString = '';
  if (typeof input === 'string') {
    urlString = input;
  } else if (input instanceof URL) {
    urlString = input.toString();
  } else if (input && typeof input === 'object' && 'url' in input) {
    urlString = input.url;
  }

  // Check if target is backend website or vendor API
  const isApiRequest =
    urlString.includes('/api/website') ||
    urlString.includes('/api/vendor') ||
    urlString.includes('/api/');

  // 2. Clone/Rebuild 'init' options to inject Authorization Header if available
  let newInit = init ? { ...init } : {};

  if (isApiRequest) {
    const token = localStorage.getItem('token');
    if (token) {
      // Build options headers safely
      let headers = newInit.headers ? { ...newInit.headers } : {};

      // Determine if a Bearer token is already specified to avoid overriding it
      let hasAuth = false;
      if (headers instanceof Headers) {
        hasAuth = headers.has('Authorization');
      } else if (Array.isArray(headers)) {
        hasAuth = headers.some(([key]) => key.toLowerCase() === 'authorization');
      } else {
        hasAuth = Object.keys(headers).some((key) => key.toLowerCase() === 'authorization');
      }

      if (!hasAuth) {
        if (headers instanceof Headers) {
          headers.set('Authorization', `Bearer ${token}`);
        } else if (Array.isArray(headers)) {
          headers.push(['Authorization', `Bearer ${token}`]);
        } else {
          headers['Authorization'] = `Bearer ${token}`;
        }
        newInit.headers = headers;
      }
    }
  }

  try {
    const response = await originalFetch(input, newInit);

    if (response.status === 401) {
      // Avoid intercepting if we are calling auth routes (sending or verifying OTP)
      const isLoginRequest =
        urlString.includes('/auth/verify-otp') ||
        urlString.includes('/auth/send-otp') ||
        urlString.includes('/auth/login') ||
        urlString.includes('/auth/register');

      if (!isLoginRequest) {
        let isAuthError = false;

        try {
          const clone = response.clone();
          const data = await clone.json();
          if (
            data &&
            (data.error === 'Not authorized to access this route' ||
              data.message === 'Not authorized to access this route')
          ) {
            isAuthError = true;
          }
        } catch (e) {
          // If we can't parse JSON, treat any 401 on non-login requests as unauthorized access
          isAuthError = true;
        }

        if (isAuthError && !isAlerting) {
          isAlerting = true;

          alert('Not authorized to access this route. Please login again.');

          // Clear all auth-related local storage details for website/vendor portal
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('firebaseToken');
          localStorage.removeItem('fcmToken');
          localStorage.removeItem('name');
          localStorage.removeItem('email');
          localStorage.removeItem('avatar');
          localStorage.removeItem('subscribed');
          localStorage.removeItem('type');

          // Redirect to home and trigger login modal overlay
          window.location.href = '/?showLogin=true';
        }
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
};
