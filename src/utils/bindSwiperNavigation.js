/** Re-bind Swiper external nav after nav buttons mount or move (mobile/desktop split). */
export function bindSwiperNavigation(swiper, prevSelector, nextSelector) {
  if (!swiper || !prevSelector || !nextSelector) return;

  const attach = () => {
    const prev =
      typeof prevSelector === 'string' ? document.querySelector(prevSelector) : prevSelector;
    const next =
      typeof nextSelector === 'string' ? document.querySelector(nextSelector) : nextSelector;

    if (!prev || !next || !swiper.params?.navigation) return false;

    swiper.params.navigation.prevEl = prev;
    swiper.params.navigation.nextEl = next;

    if (swiper.navigation) {
      swiper.navigation.destroy();
      swiper.navigation.init();
      swiper.navigation.update();
    }
    return true;
  };

  requestAnimationFrame(() => {
    if (!attach()) {
      setTimeout(attach, 50);
    }
  });
}
