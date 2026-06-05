import { useEffect, useState } from 'react';

/** `max-width` breakpoint in px (e.g. 767 → mobile ≤767px). */
export function useMaxWidth(maxWidthPx) {
  const query = `(max-width: ${maxWidthPx}px)`;
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
