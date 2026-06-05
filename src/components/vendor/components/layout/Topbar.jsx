import { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  Menu,
  ChevronDown,
  User,
  Shield,
  LogOut,
  Settings,
  Calendar,
  MapPin,
  Users,
  Building2,
  CreditCard,
  FileText,
  Check,
  Trash2,
  ExternalLink,
  Inbox,
} from 'lucide-react';
import { useAuthStore, logout } from '../../../../store/authStore';
import { useUiStore } from '../../../../store/uiStore';
import { fetchProducts } from '../../../../store/vendorProductsStore';
import { WEBSITE_API_URL } from '../../service/api';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';

const routeLabels = {
  '/vendor/dashboard': 'Dashboard',
  '/vendor/subscriptions': 'Subscription Plans',
  '/vendor/transactions': 'Transactions',
  '/vendor/properties/list': 'Properties',
  '/vendor/support': 'Support',
  '/vendor/profile': 'Seller Profile',
};

const formatJoinedDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
};

const formatAccountType = (type) => {
  if (!type) return 'Seller';
  const label = String(type).replace(/_/g, ' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationList, setNotificationList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [draftCount, setDraftCount] = useState(0);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  const fetchNotifications = async () => {
    const userToken = localStorage.getItem('token');
    if (!userToken) return;
    try {
      const response = await fetch(`${WEBSITE_API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const json = await response.json();
      if (json.success) {
        setNotificationList(json.data);
        setUnreadCount(json.data.filter((n) => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    const userToken = localStorage.getItem('token');
    try {
      await fetch(`${WEBSITE_API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${userToken}` },
      });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    const userToken = localStorage.getItem('token');
    try {
      await fetch(`${WEBSITE_API_URL}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${userToken}` },
      });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    const userToken = localStorage.getItem('token');
    try {
      await fetch(`${WEBSITE_API_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userToken}` },
      });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + 'y ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + 'mo ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'd ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'h ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + 'm ago';
    return Math.floor(seconds) + 's ago';
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileModalOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    if (isProfileModalOpen || isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileModalOpen, isNotificationsOpen]);

  // Fetch draft count on component mount
  useEffect(() => {
    const loadDraftCount = async () => {
      try {
        const json = await fetchProducts({ status: 'draft', limit: 1 });
        const count = json?.pagination?.total ?? json?.count?.draft ?? json?.data?.length ?? 0;
        setDraftCount(count);
      } catch (error) {
        console.error('Failed to fetch draft count:', error);
        setDraftCount(0);
      }
    };

    loadDraftCount();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const pageTitle =
    routeLabels[location.pathname] ||
    (location.pathname.startsWith('/vendor/profile') ? 'Seller Profile' : null) ||
    (location.pathname.startsWith('/vendor/properties') ? 'Properties' : null) ||
    'Seller Panel';
  const userInitials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'V';
  const joinedLabel = formatJoinedDate(user?.createdAt);
  const locationLabel = [user?.city, user?.state].filter(Boolean).join(', ') || '—';
  const accountTypeLabel = formatAccountType(user?.type);

  return (
    <header
      className={`fixed top-0 right-0 z-30 bg-white border-b border-slate-200 flex items-center justify-between h-20 px-8 transition-all duration-500 ease-in-out ${collapsed ? 'left-20' : 'left-64'}`}
    >
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <h1 className="text-md font-semibold text-slate-900 leading-none truncate">
            {pageTitle}
          </h1>
          <p className="text-md font-medium text-slate-500 mt-1">
            Yukthi Properties · Seller panel
          </p>
        </div>
      </div>

      {/* Center: Search */}
      {/* <div className="flex-1 max-w-xs mx-6 hidden md:block">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Quick search..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-border rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:bg-white transition-all"
          />
        </div>
      </div> */}

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Draft Properties Indicator */}
        <button
          onClick={() => navigate('/vendor/properties/draft')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-all group shadow-sm active:scale-95"
          title="Resume your draft listings"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-amber-200 text-amber-600 group-hover:rotate-6 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
            {draftCount > 0 && (
              <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center animate-pulse shadow-sm">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              </span>
            )}
          </div>
          <div className="hidden md:flex flex-col items-start leading-none gap-0.5">
            <span className="text-md font-semibold text-amber-900 tabular-nums">
              {draftCount} <span className="text-amber-600 font-medium">drafts</span>
            </span>
            <span className="text-md font-medium text-amber-700/80">Incomplete</span>
          </div>
        </button>
        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`relative p-2 rounded-lg transition-all duration-200 active:scale-90 ${isNotificationsOpen ? 'bg-primary/10 text-primary shadow-sm' : 'hover:bg-slate-50 text-slate-500 hover:text-slate-700'}`}
          >
            <Bell size={16} className={unreadCount > 0 ? 'animate-bounce' : ''} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse border border-white" />
            )}
          </button>

          {/* Smart Notification Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute top-[calc(100%+8px)] right-0 w-[22rem] bg-white rounded-2xl shadow-xl border border-slate-200 z-50 animate-scale-in overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <h3 className="text-md font-semibold text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-amber-100 text-amber-700 text-md font-semibold px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider bg-transparent border-none cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[22rem] overflow-y-auto divide-y divide-border/60 custom-scrollbar">
                {notificationList.length > 0 ? (
                  notificationList.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => markAsRead(n._id)}
                      className={`p-3.5 hover:bg-slate-50 transition-colors group cursor-pointer relative ${!n.isRead ? 'bg-amber-50/20' : ''}`}
                    >
                      {!n.isRead && (
                        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-amber-500" />
                      )}
                      <div className="flex gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            n.type === 'property_verification'
                              ? 'bg-emerald-50 text-emerald-500'
                              : n.type === 'property_submission'
                                ? 'bg-blue-50 text-blue-500'
                                : 'bg-slate-50 text-slate-500'
                          }`}
                        >
                          {n.type === 'property_verification' ? (
                            <Check size={14} />
                          ) : n.type === 'property_submission' ? (
                            <FileText size={14} />
                          ) : (
                            <Bell size={14} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5 gap-2">
                            <p
                              className={`text-[11px] font-bold truncate ${!n.isRead ? 'text-slate-900' : 'text-slate-600'}`}
                            >
                              {n.title}
                            </p>
                            <span className="text-[9px] font-medium text-slate-400 flex-shrink-0">
                              {getTimeAgo(n.createdAt)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                            {n.message}
                          </p>

                          <div className="flex items-center gap-2 mt-2">
                            {n.data?.propertyId && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/vendor/properties/${n.data?.propertyId}`);
                                  setIsNotificationsOpen(false);
                                }}
                                className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1"
                              >
                                Check Status <ExternalLink size={10} />
                              </button>
                            )}
                            <button
                              onClick={(e) => deleteNotification(n._id, e)}
                              className="text-[9px] font-bold text-slate-400 hover:text-red-500 ml-auto opacity-0 group-hover:opacity-100 transition-all bg-transparent border-none cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 border border-slate-100">
                      <Inbox className="w-6 h-6 text-slate-200" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      Inbox Clean
                    </p>
                  </div>
                )}
              </div>

              <div className="p-2 border-t border-border mt-auto bg-slate-50/30">
                <Link
                  to="/vendor/dashboard"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="flex items-center justify-center w-full py-2 rounded-lg text-[10px] font-bold text-slate-500 hover:text-primary hover:bg-primary/5 transition-all uppercase tracking-widest"
                >
                  View Activity Feed
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-border mx-1" />

        {/* Admin Profile Section - Relative for Smart Positioning */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileModalOpen(!isProfileModalOpen)}
            className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg hover:bg-slate-100 transition-colors border border-transparent hover:border-border"
          >
            <div className="w-8 h-8 rounded-full bg-primary border border-slate-200 overflow-hidden flex items-center justify-center shadow-sm shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-white text-md font-semibold">{userInitials}</span>
              )}
            </div>
            <div className="hidden md:block text-left min-w-0">
              <p className="text-md font-semibold text-slate-800 leading-tight truncate">
                {user?.name || 'Seller'}
              </p>
              <p className="text-md font-medium text-slate-500 leading-tight">Seller account</p>
            </div>
            <ChevronDown
              size={12}
              className={`text-slate-400 hidden md:block transition-transform duration-200 ${isProfileModalOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Smart Positioned Dropdown Modal */}
          {isProfileModalOpen && (
            <div className="absolute top-[calc(100%+8px)] right-0 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50 animate-scale-in overflow-hidden">
              <div className="p-4 space-y-4">
                {/* Profile header */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex flex-col items-center text-center">
                  <div className="relative mb-3">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt=""
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <Avatar initials={userInitials} size="xl" />
                    )}
                    {user?.verified && (
                      <div
                        className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center"
                        title="Verified account"
                      >
                        <Check size={10} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <h3 className="text-md font-semibold text-slate-900">{user?.name || 'Seller'}</h3>
                  <p className="text-md font-medium text-slate-500 mt-0.5 truncate max-w-full">
                    {user?.email || user?.mobile || '—'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2.5 bg-primary/10 text-primary px-2.5 py-1 rounded-md border border-primary/20">
                    <Shield size={14} className="shrink-0" />
                    <span className="text-md font-semibold capitalize">
                      {user?.verified ? 'Verified seller' : accountTypeLabel}
                    </span>
                  </div>
                </div>

                {/* Quick details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-1.5 mb-1">
                      <MapPin size={14} className="text-slate-400 shrink-0" />
                      <span className="text-md font-semibold text-slate-500">Location</span>
                    </div>
                    <p
                      className="text-md font-semibold text-slate-800 truncate"
                      title={locationLabel}
                    >
                      {locationLabel}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Calendar size={14} className="text-slate-400 shrink-0" />
                      <span className="text-md font-semibold text-slate-500">Joined</span>
                    </div>
                    <p className="text-md font-semibold text-slate-800">{joinedLabel}</p>
                  </div>
                </div>

                <Link
                  to="/vendor/profile"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-slate-50 transition-colors group border border-slate-200"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 group-hover:text-primary group-hover:bg-primary/10 transition-colors shrink-0">
                      <User size={16} />
                    </div>
                    <span className="text-md font-semibold text-slate-700 group-hover:text-slate-900">
                      My profile
                    </span>
                  </div>
                  <ChevronDown
                    size={14}
                    className="text-slate-400 -rotate-90 group-hover:text-primary transition-colors shrink-0"
                  />
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-rose-50 text-rose-700 text-md font-semibold hover:bg-rose-100 transition-all border border-rose-200 active:scale-[0.98]"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
