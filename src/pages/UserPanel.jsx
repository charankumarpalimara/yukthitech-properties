import React, { useEffect, lazy, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore, logout, getMe } from '../store/authStore';
import { usePropertiesStore } from '../store/propertiesStore';
import { isSellerUserType } from '../utils/isSellerUserType';

// Modular Components
import Overview from '../components/UserPanel/Overview';
import ProfilePanel from '../components/UserPanel/ProfilePanel';
import FavouritesPanel from '../components/UserPanel/FavouritesPanel';
import MessagesPanel from '../components/UserPanel/MessagesPanel';
import SupportPanel from '../components/UserPanel/SupportPanel';
import NotificationsPanel from '../components/UserPanel/NotificationsPanel';
import SettingsPanel from '../components/UserPanel/SettingsPanel';
// import SubscriptionPanel from '../components/UserPanel/SubscriptionPanel';
import '../components/vendor/index.css';

// Lazy-loaded Vendor Components
const Dashboard = lazy(() => import('../components/UserPanel/pages/Dashboard'));
const SubscriptionPlans = lazy(() => import('../components/UserPanel/pages/SubscriptionPlans'));
const Transactions = lazy(() => import('../components/UserPanel/pages/Transactions'));
const VendorProperties = lazy(() => import('../components/UserPanel/pages/Properties'));
const VendorPropertyDetails = lazy(() => import('../components/UserPanel/pages/PropertyDetails'));
const CreateProperty = lazy(() => import('../components/UserPanel/pages/CreateProperty'));
const Support = lazy(() => import('../components/UserPanel/pages/Support'));
const TicketDetails = lazy(() => import('../components/UserPanel/pages/TicketDetails'));
const VendorBannerSubscriptions = lazy(() => import('../components/UserPanel/pages/BannerSubscriptions'));
const PropertyPending = lazy(() => import('../components/UserPanel/pages/properties/PropertyPending'));
const PropertyVerified = lazy(() => import('../components/UserPanel/pages/properties/PropertyVerified'));
const PropertyRejected = lazy(() => import('../components/UserPanel/pages/properties/PropertyRejected'));
const PropertyDraft = lazy(() => import('../components/UserPanel/pages/properties/PropertyDraft'));

import {
  upBtnLogin,
  upMobileHeaderAvatar,
  upMobileTabContainer,
  upMobileTabActive,
  upMobileTabInactive,
  upMobileTabIconActive,
  upMobileTabIconInactive,
  upMobileTabBadgeActive,
  upMobileTabBadgeInactive,
  upMobileTabIndicator,
  upSidebarContainer,
  upSidebarAvatar,
  upSidebarItemActive,
  upSidebarItemInactive,
  upSidebarIconActive,
  upSidebarIconInactive,
  upSidebarBadgeActive,
  upSidebarBadgeInactive,
  upSidebarLogoutBtn,
  upSidebarLogoutIcon,
} from '../components/UserPanel/userPanelStyles';

/* ── Icons (Kept here for navigation) ── */
const IconHome = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M3 12L12 3l9 9" />
    <path d="M9 21V12h6v9" />
  </svg>
);
const IconHeart = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const IconUser = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconBell = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const IconSettings = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const IconLogout = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconMessage = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IconHelp = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// Vendor-specific icons
const IconDashboard = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="9" />
    <rect x="14" y="3" width="7" height="5" />
    <rect x="14" y="12" width="7" height="9" />
    <rect x="3" y="16" width="7" height="5" />
  </svg>
);
const IconProperties = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M3 21h18" />
    <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
  </svg>
);
const IconAdd = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconSubscription = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);
const IconBanners = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);
const IconTransactions = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const IconSupport = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default function UserPanel() {
  const navigate = useNavigate();
  const { tab, id } = useParams();
  const wishlist = usePropertiesStore((state) => state.wishlist || []);
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const tabName = tab || 'overview';
  const isSeller = isSellerUserType(user?.type);

  const userTabs = [
    { key: 'profile', label: 'My Profile', icon: <IconUser /> },
    { key: 'favourites', label: 'Favourites', icon: <IconHeart /> },
    { key: 'notifications', label: 'Notifications', icon: <IconBell /> },
    ...(isSeller ? [
      { key: 'dashboard', label: 'Dashboard', icon: <IconDashboard /> },
      { key: 'properties', label: 'My Properties', icon: <IconProperties /> },
      { key: 'create-property', label: 'Post Property', icon: <IconAdd /> },
      { key: 'subscriptions', label: 'Subscription Plans', icon: <IconSubscription /> },
      // { key: 'banner-subscriptions', label: 'Banner Ads', icon: <IconBanners /> },
      { key: 'transactions', label: 'Transactions', icon: <IconTransactions /> },
      { key: 'support', label: 'Support', icon: <IconSupport /> },
    ] : [])
  ];

  useEffect(() => {
    if (!user?._id && !user?.id) {
      getMe();
    }
  }, [user?._id, user?.id]);

  if (!isLoggedIn) {
    return (
      <div className="text-center py-20 px-5">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-slate-900 mb-2 text-2xl font-semibold">
          Please login to access your panel
        </h2>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          Sign in to view your profile, favourites and settings.
        </p>
        <button
          className={upBtnLogin}
          onClick={() => navigate('/login')}
        >
          Login / Register
        </button>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    navigate('/');
  };

  const renderPanel = () => {
    return (
      <Suspense fallback={<div className="p-10 text-center text-slate-500 font-semibold">Loading section...</div>}>
        {(() => {
          switch (tabName) {
            case 'profile':
              return <ProfilePanel />;
            case 'favourites':
              return <FavouritesPanel />;
            case 'notifications':
              return <NotificationsPanel />;
            case 'dashboard':
              return <Dashboard />;
            case 'subscriptions':
              return <SubscriptionPlans />;
            case 'transactions':
              return <Transactions />;
            case 'properties':
              if (id === 'pending') return <PropertyPending />;
              if (id === 'verified') return <PropertyVerified />;
              if (id === 'rejected') return <PropertyRejected />;
              if (id === 'draft') return <PropertyDraft />;
              return <VendorProperties />;
            case 'property-details':
              return <VendorPropertyDetails />;
            case 'create-property':
              return <CreateProperty />;
            case 'support':
              if (id) return <TicketDetails />;
              return <Support />;
            case 'banner-subscriptions':
              return <VendorBannerSubscriptions />;
            default:
              return <ProfilePanel />;
          }
        })()}
      </Suspense>
    );
  };

  return (
    <div className="bg-[#f8fafc] min-h-[calc(100vh-72px)] py-4 lg:py-6 pb-6 font-sans antialiased">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        {/* ── MOBILE HEADER & TABS ── */}
        <div className="lg:hidden mb-8">
          <div className="flex items-center gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className={upMobileHeaderAvatar}>
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-[1.15rem] font-semibold text-slate-900 truncate m-0">
                {user?.name || user?.firstName || user?.username || 'User'}
              </h2>
              <p className="text-[0.82rem] text-slate-500 truncate m-0 opacity-80 uppercase tracking-widest font-medium">
                {isSeller ? 'Seller Account' : 'Personal Account'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-auto w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100 active:scale-95 transition-all"
            >
              <IconLogout />
            </button>
          </div>

          <div className={upMobileTabContainer}>
            {userTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => navigate(`/profile/${t.key}`)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[0.88rem] font-semibold transition-all duration-300 shrink-0 whitespace-nowrap flex-1 justify-center relative
                  ${tabName === t.key ? upMobileTabActive : upMobileTabInactive}`}
              >
                <span className={`transition-transform duration-300 ${tabName === t.key ? upMobileTabIconActive : upMobileTabIconInactive}`}>
                  {t.icon}
                </span>
                <span>{t.label}</span>
                {t.key === 'favourites' && wishlist.length > 0 && (
                  <span
                    className={`text-[0.62rem] px-1.5 py-0.5 rounded-full font-bold ml-1.5 transition-all
                      ${tabName === t.key ? upMobileTabBadgeActive : upMobileTabBadgeInactive}`}
                  >
                    {wishlist.length}
                  </span>
                )}
                {tabName === t.key && (
                  <span className={upMobileTabIndicator} />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5 items-start">
          {/* ── SIDEBAR ── */}
          <aside className={upSidebarContainer}>
            <div className="bg-[#fcfcfd] p-[32px_20px_24px] text-center relative border-b border-slate-100/80">
              <div className={upSidebarAvatar}>
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-4xl mb-4">👤</div>
                )}
              </div>
              <div>
                <div className="text-[1.15rem] font-semibold text-slate-900 mb-1 leading-tight tracking-tight">
                  {user?.name || user?.firstName || user?.username || 'User'}
                </div>
                <div className="text-[0.85rem] text-slate-500 break-all font-medium">
                  {user?.email || 'user@example.com'}
                </div>
              </div>
            </div>
            <nav className="p-3.5 flex flex-col gap-1">
              {userTabs.map((t) => {
                const isActive = tabName === t.key;
                return (
                  <button
                    key={t.key}
                    className={`group/item ${isActive ? upSidebarItemActive : upSidebarItemInactive}`}
                    onClick={() => navigate(`/profile/${t.key}`)}
                  >
                    <span className={`transition-all duration-300 ${isActive ? upSidebarIconActive : upSidebarIconInactive}`}>
                      {t.icon}
                    </span>
                    <span>{t.label}</span>
                    {t.key === 'favourites' && wishlist.length > 0 && (
                      <span className={`ml-auto text-[0.68rem] px-2 py-0.5 rounded-full font-bold transition-all
                        ${isActive ? upSidebarBadgeActive : upSidebarBadgeInactive}`}>
                        {wishlist.length}
                      </span>
                    )}
                  </button>
                );
              })}
              <div className="h-px bg-slate-100 my-3.5 mx-2" />
              <button
                className={upSidebarLogoutBtn}
                onClick={handleLogout}
              >
                <span className={upSidebarLogoutIcon}>
                  <IconLogout />
                </span>
                <span>Logout</span>
              </button>
            </nav>
          </aside>

          {/* ── MAIN ── */}
          <main className="min-w-0 vendor-panel">{renderPanel()}</main>
        </div>
      </div>
    </div>
  );
}
