/**
 * Utility to load external scripts dynamically.
 * Prevents synchronous block-rendering of 3rd party scripts in index.html,
 * significantly boosting Lighthouse performance, best practices, and load speed.
 */
export const loadScript = (src) => {
  return new Promise((resolve) => {
    // If the script is already loaded/defined globally, resolve immediately
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    // Check if script tag already exists in DOM to avoid duplicate injection
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      existingScript.onload = () => resolve(true);
      existingScript.onerror = () => resolve(false);
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
