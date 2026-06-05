import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { usePropertiesStore } from '../../store/propertiesStore';
import {
  upLoadingSpinner,
  upExploreButton,
  upFavCardContainer,
  upFavCardTitle,
  upFavCardPrice,
  upFavCardArrow,
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {wishlistItems.map((item) => {
            const property = item.propertyId;
            if (!property) return null;

            return (
              <div
                key={property._id}
                className={upFavCardContainer}
                onClick={() => navigate(`/property/${property._id}`)}
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={
                      property.media?.poster || 'https://via.placeholder.com/400x300?text=No+Image'
                    }
                    alt={property.projectName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <button
                    onClick={(e) => handleRemove(e, property._id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center text-rose-500 shadow-sm hover:bg-rose-500 hover:text-white transition-all z-10"
                  >
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <h4 className={upFavCardTitle}>{property.projectName}</h4>
                  <div className="flex items-center gap-1 text-slate-400 text-[0.7rem] mb-4">
                    <IconPin />
                    <span className="truncate">
                      {property.address?.locality || property.address?.city || 'Hyderabad'}
                    </span>
                  </div>

                  <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                        Price
                      </span>
                      <span className={upFavCardPrice}>
                        {formatPrice(property.financials?.totalPrice)}
                      </span>
                    </div>
                    <div className={upFavCardArrow}>
                      <svg
                        width="14"
                        height="14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
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
