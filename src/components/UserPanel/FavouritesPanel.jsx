import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { usePropertiesStore } from '../../store/propertiesStore';
import {
  upLoadingSpinner,
  upExploreButton,
  vpPage,
  vpHeader,
  vpHeaderTitle,
  vpHeaderSubtitle,
  vpPanel,
} from './userPanelStyles';

const IconPin = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconHeart = () => (
  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const IconArrow = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export default function FavouritesPanel() {
  const navigate = useNavigate();
  const wishlistItems = usePropertiesStore((state) => state.wishlistItems || []);
  const wishlistLoading = usePropertiesStore((state) => state.wishlistLoading);
  const fetchWishlist = usePropertiesStore((state) => state.fetchWishlist);
  const toggleWishlist = usePropertiesStore((state) => state.toggleWishlist);
  const user = useAuthStore((s) => s.user);

  React.useEffect(() => {
    const userId =
      user?._id ||
      user?.id ||
      JSON.parse(localStorage.getItem('user'))?._id ||
      JSON.parse(localStorage.getItem('user'))?.id;
    if (userId) {
      fetchWishlist(userId);
    }
  }, [fetchWishlist, user]);

  const handleRemove = (e, propertyId) => {
    e.stopPropagation();
    const userId =
      user?._id ||
      user?.id ||
      JSON.parse(localStorage.getItem('user'))?._id ||
      JSON.parse(localStorage.getItem('user'))?.id;
    if (userId) {
      toggleWishlist(propertyId, userId);
    }
  };

  const formatPrice = (p) => {
    if (!p) return 'Price on Request';
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
    return `₹${p.toLocaleString()}`;
  };

  /**
   * Safely converts any value to a renderable string.
   * Handles populated MongoDB refs like { _id, name, image }.
   */
  const toStr = (val, fallback = '') => {
    if (!val) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') return val.name || val.title || String(val._id || '') || fallback;
    return String(val);
  };

  const headerSubtitle = wishlistLoading
    ? 'Loading your saved properties...'
    : !wishlistItems?.length
      ? 'Save properties you love to view them later'
      : `You have ${wishlistItems.length} saved ${wishlistItems.length === 1 ? 'property' : 'properties'}`;

  return (
    <div className={vpPage}>
      <div className={vpHeader}>
        <div>
          <h2 className={vpHeaderTitle}>Favourites</h2>
          <p className={vpHeaderSubtitle}>{headerSubtitle}</p>
        </div>
      </div>

      {wishlistLoading ? (
        <div className={`${vpPanel} p-8 flex flex-col items-center justify-center min-h-[400px]`}>
          <div className={upLoadingSpinner} />
          <p className="text-slate-500 font-medium">Loading your favorites...</p>
        </div>
      ) : !wishlistItems || wishlistItems.length === 0 ? (
        <div className={`${vpPanel} p-10 text-center`}>
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl opacity-40">💝</span>
          </div>
          <h3 className="text-[1.5rem] font-semibold text-slate-900 mb-2">
            Your collection is empty
          </h3>
          <p className="text-slate-500 mb-8 max-w-[300px] mx-auto">
            Save your dream properties to view them later here.
          </p>
          <button onClick={() => navigate('/')} className={upExploreButton}>
            Explore Properties
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistItems.map((item) => {
            const property = item.propertyId;
            if (!property) return null;

            const propertyType = toStr(property.propertyType || property.type);
            const status = toStr(property.status);

            return (
              <div
                key={property._id}
                onClick={() => navigate(`/property/${property._id}`)}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:border-slate-200 hover:shadow-xl sm:rounded-2xl"
              >
                {/* ── Image ── */}
                <div className="relative h-28 shrink-0 overflow-hidden bg-slate-100 sm:h-44">
                  <img
                    src={property.media?.poster || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={property.projectName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* top badges */}
                  <div className="absolute left-2 top-2 flex flex-wrap gap-1 sm:left-3 sm:top-3 sm:gap-1.5">
                    {propertyType && (
                      <span className="rounded-md bg-white/90 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-slate-700 shadow-sm backdrop-blur-sm sm:px-2 sm:text-[10px]">
                        {propertyType}
                      </span>
                    )}
                    {status && (
                      <span className="rounded-md bg-primary/90 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white shadow-sm backdrop-blur-sm sm:px-2 sm:text-[10px]">
                        {status}
                      </span>
                    )}
                  </div>

                  {/* remove (heart) button */}
                  <button
                    onClick={(e) => handleRemove(e, property._id)}
                    aria-label="Remove from favourites"
                    className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-rose-500 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-rose-500 hover:text-white sm:right-3 sm:top-3 sm:h-8 sm:w-8 sm:rounded-xl"
                  >
                    <IconHeart />
                  </button>
                </div>

                {/* ── Body ── */}
                <div className="flex flex-1 flex-col gap-1.5 p-2.5 sm:gap-2 sm:p-4">
                  {/* title */}
                  <h4 className="line-clamp-2 text-[0.72rem] font-bold leading-snug text-slate-900 transition-colors duration-200 group-hover:text-primary sm:line-clamp-1 sm:text-[0.92rem]">
                    {toStr(property.projectName, 'Unnamed Property')}
                  </h4>

                  {/* location */}
                  <div className="flex items-center gap-1 text-[0.62rem] font-medium text-slate-400 sm:gap-1.5 sm:text-[0.72rem]">
                    <span className="shrink-0 text-slate-300">
                      <IconPin />
                    </span>
                    <span className="truncate">
                      {toStr(property.address?.locality) || toStr(property.address?.city) || 'Hyderabad'}
                    </span>
                  </div>

                  {/* divider */}
                  <div className="mb-0 mt-auto h-px bg-slate-100" />

                  {/* price + arrow */}
                  <div className="flex items-center justify-between gap-1 pt-1">
                    <div className="min-w-0">
                      <p className="mb-0.5 text-[8px] font-bold uppercase leading-none tracking-widest text-slate-400 sm:mb-1 sm:text-[10px]">
                        Price
                      </p>
                      <p className="truncate text-[0.82rem] font-extrabold leading-none tabular-nums text-slate-900 sm:text-[1.05rem]">
                        {formatPrice(property.financials?.totalPrice)}
                      </p>
                    </div>
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-400 transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-white sm:h-9 sm:w-9 sm:rounded-xl">
                      <IconArrow />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
