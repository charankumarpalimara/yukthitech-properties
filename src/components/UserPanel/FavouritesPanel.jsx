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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {wishlistItems.map((item) => {
            const property = item.propertyId;
            if (!property) return null;

            const propertyType = toStr(property.propertyType || property.type);
            const status = toStr(property.status);

            return (
              <div
                key={property._id}
                onClick={() => navigate(`/property/${property._id}`)}
                className="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* ── Image ── */}
                <div className="relative h-44 overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={property.media?.poster || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={property.projectName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* top badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    {propertyType && (
                      <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-[10px] font-bold text-slate-700 uppercase tracking-wide shadow-sm">
                        {propertyType}
                      </span>
                    )}
                    {status && (
                      <span className="px-2 py-0.5 rounded-md bg-primary/90 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wide shadow-sm">
                        {status}
                      </span>
                    )}
                  </div>

                  {/* remove (heart) button */}
                  <button
                    onClick={(e) => handleRemove(e, property._id)}
                    aria-label="Remove from favourites"
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-rose-500 shadow-sm hover:bg-rose-500 hover:text-white transition-all duration-200 z-10"
                  >
                    <IconHeart />
                  </button>
                </div>

                {/* ── Body ── */}
                <div className="p-4 flex-1 flex flex-col gap-2">
                  {/* title */}
                  <h4 className="text-[0.92rem] font-bold text-slate-900 leading-snug line-clamp-1 group-hover:text-primary transition-colors duration-200">
                    {toStr(property.projectName, 'Unnamed Property')}
                  </h4>

                  {/* location */}
                  <div className="flex items-center gap-1.5 text-slate-400 text-[0.72rem] font-medium">
                    <span className="text-slate-300"><IconPin /></span>
                    <span className="truncate">
                      {toStr(property.address?.locality) || toStr(property.address?.city) || 'Hyderabad'}
                    </span>
                  </div>

                  {/* divider */}
                  <div className="h-px bg-slate-100 mt-auto mb-0" />

                  {/* price + arrow */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                        Price
                      </p>
                      <p className="text-[1.05rem] font-extrabold text-slate-900 leading-none tabular-nums">
                        {formatPrice(property.financials?.totalPrice)}
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all duration-300 shrink-0">
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
