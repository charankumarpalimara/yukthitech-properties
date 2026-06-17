import { Link } from 'react-router-dom';
import { useMaxWidth } from '../../hooks/useMediaQuery';
import {
  preloadPropertiesPage,
  preloadCollectionPage,
  preloadNearbyPage,
} from '../../utils/preloadRoutes';
import { ArrowR, ChevronL, ChevronR } from '../../data/icons';
import {
  HOME_EYEBROW,
  HOME_SECTION_TITLE,
  HOME_SECTION_SUBTITLE,
  HOME_VIEW_ALL_BTN,
  HOME_CAROUSEL_NAV_ROUND,
} from './homeTypographyStyles';

/**
 * Shared header for home feed sections (below hero / promo banners).
 */
export default function HomeSectionHeader({
  eyebrow,
  title,
  subtitle,
  viewAllTo,
  viewAllLabel = 'View all',
  showNav = false,
  navLayout = 'inline',
  prevClass = '',
  nextClass = '',
  onViewAllClick,
  compact = false,
  variant = 'light',
}) {
  const isDark = variant === 'dark';
  const isBelowLg = useMaxWidth(1023);
  const showHeaderNav = showNav && (navLayout !== 'split' || !isBelowLg);

  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${compact ? 'mb-4 sm:mb-5' : 'mb-6 sm:mb-8'}`}
    >
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <span
            className={
              isDark
                ? 'mb-2 inline-block text-sm font-medium tracking-wide text-primary-400'
                : HOME_EYEBROW
            }
          >
            {eyebrow}
          </span>
        )}
        <h2
          className={
            isDark
              ? 'm-0 text-2xl font-semibold tracking-tight text-white sm:text-[1.65rem]'
              : HOME_SECTION_TITLE
          }
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={
              isDark
                ? 'mt-2 max-w-xl text-base font-medium leading-relaxed text-slate-300'
                : HOME_SECTION_SUBTITLE
            }
          >
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {showHeaderNav && (
          <>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                className={`${prevClass} ${HOME_CAROUSEL_NAV_ROUND}`}
                aria-label="Previous"
              >
                <ChevronL className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
              </button>
              <button
                type="button"
                className={`${nextClass} ${HOME_CAROUSEL_NAV_ROUND}`}
                aria-label="Next"
              >
                <ChevronR className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
              </button>
            </div>
            <span className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" aria-hidden />
          </>
        )}

        {viewAllTo && (
          <Link
            to={viewAllTo}
            className={
              isDark
                ? 'inline-flex h-11 items-center gap-2 rounded-none bg-gold px-6 text-sm font-semibold text-slate-900 no-underline shadow-sm transition-all hover:bg-gold-light active:scale-[0.98]'
                : HOME_VIEW_ALL_BTN
            }
            onMouseEnter={() => {
              if (viewAllTo.startsWith('/collection')) preloadCollectionPage();
              else if (viewAllTo.startsWith('/nearby')) preloadNearbyPage();
              else if (viewAllTo.startsWith('/properties')) preloadPropertiesPage();
            }}
          >
            {viewAllLabel}
            <ArrowR className="h-4 w-4" />
          </Link>
        )}

        {onViewAllClick && !viewAllTo && (
          <button
            type="button"
            onClick={onViewAllClick}
            className={
              isDark
                ? 'inline-flex h-11 items-center gap-2 rounded-none bg-gold px-6 text-sm font-semibold text-slate-900 no-underline shadow-sm transition-all hover:bg-gold-light active:scale-[0.98]'
                : HOME_VIEW_ALL_BTN
            }
          >
            {viewAllLabel}
            <ArrowR className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
