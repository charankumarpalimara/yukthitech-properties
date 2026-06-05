import { useEffect, useRef, useState } from 'react';

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/**
 * Track whether an element is near the viewport.
 * @param {boolean} initialInView — `true` for carousels (autoplay until observer runs);
 *   `false` for lazy-mount sections (avoid mounting children before first check).
 */
export function useCarouselInView({
  enabled = true,
  rootMargin = '80px 0px',
  threshold = 0.08,
  initialInView = true,
} = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(initialInView);

  useEffect(() => {
    if (!enabled) {
      setInView(false);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin,
      threshold,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, rootMargin, threshold]);

  return { ref, inView };
}
