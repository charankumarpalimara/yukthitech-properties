import { createContext, useContext } from 'react';

/** Optional: pause parent Swiper autoplay while a property card / hover preview is active */
export const PropertyCardCarouselPauseContext = createContext(null);

export function usePropertyCardCarouselPause() {
  return useContext(PropertyCardCarouselPauseContext);
}
