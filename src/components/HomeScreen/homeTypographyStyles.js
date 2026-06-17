/** Shared home feed typography — semibold headings, medium body (no bold) */

export const HOME_EYEBROW = 'mb-2 inline-block text-sm font-medium tracking-wide text-primary-600';

export const HOME_SECTION_TITLE =
  'm-0 text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.65rem]';

export const HOME_SECTION_SUBTITLE =
  'mt-2 max-w-xl text-base font-medium leading-relaxed text-slate-600';

export const HOME_VIEW_ALL_BTN =
  'inline-flex h-11 items-center gap-2 rounded-sm bg-primary px-6 text-sm font-semibold text-white no-underline shadow-sm transition-all hover:opacity-90 active:scale-[0.98]';

/** Round prev/next carousel controls — shared on mobile overlay & desktop header */
export const HOME_CAROUSEL_NAV_ROUND =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-[0_2px_10px_rgba(15,23,42,0.08)] transition-all hover:border-primary hover:bg-primary hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-30 sm:h-11 sm:w-11';

export const HOME_CAROUSEL_NAV_OVERLAY_PREV = `${HOME_CAROUSEL_NAV_ROUND} absolute left-1 top-[42%] z-20 -translate-y-1/2`;

export const HOME_CAROUSEL_NAV_OVERLAY_NEXT = `${HOME_CAROUSEL_NAV_ROUND} absolute right-1 top-[42%] z-20 -translate-y-1/2`;
