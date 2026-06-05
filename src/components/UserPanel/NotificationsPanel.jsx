import React, { useEffect } from 'react';
import {
  useNotificationsStore,
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../../store/notificationsStore';
import { useAuthStore } from '../../store/authStore';
import {
  IconTrendingDown,
  IconCheckCircle,
  IconStar,
  IconSparkles,
  IconSearchAlert,
} from '../../data/icons';
import { Bell, Trash2 } from 'lucide-react';
import {
  upNotifUnread,
  upNotifDot,
  upNotifIconUnread,
  vpPage,
  vpHeader,
  vpHeaderTitle,
  vpHeaderSubtitle,
  vpPanel,
  upBtnSecondary,
} from './userPanelStyles';

const ICON_MAP = {
  price_drop: <IconTrendingDown />,
  new_listing: <IconSparkles />,
  property_verification: <IconCheckCircle />,
  subscription_update: <IconStar />,
  property_submission: <IconSearchAlert />,
  alert: <IconSearchAlert />,
};

export default function NotificationsPanel() {
  const notificationList = useNotificationsStore((s) => s.list);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const isLoading = useNotificationsStore((s) => s.loading);
  const isAuthenticated = useAuthStore((s) => s.isLoggedIn);

  useEffect(() => {
    if (isAuthenticated) fetchNotifications();
  }, [isAuthenticated]);

  const markAsRead = (id) => markNotificationRead(id);

  const markAllAsRead = () => markAllNotificationsRead();

  const handleDelete = (id, e) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return Math.floor(seconds) + ' seconds ago';
  };

  return (
    <div className={vpPage}>
      <div className={vpHeader}>
        <div>
          <h2 className={vpHeaderTitle}>Notifications</h2>
          <p className={vpHeaderSubtitle}>
            {unreadCount > 0
              ? `You have ${unreadCount} unread ${unreadCount === 1 ? 'alert' : 'alerts'}`
              : 'Stay updated on your property activity'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button type="button" onClick={markAllAsRead} className={upBtnSecondary}>
            Mark all read
          </button>
        )}
      </div>

      <div className={`${vpPanel} p-6 min-h-[400px]`}>
        <div className="flex flex-col gap-2">
          {isLoading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-slate-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : notificationList.length > 0 ? (
            notificationList.map((n) => (
              <div
                key={n._id}
                onClick={() => markAsRead(n._id)}
                className={`flex items-start gap-3.5 p-4 rounded-xl transition-all duration-300 group cursor-pointer border border-transparent ${!n.isRead ? upNotifUnread : 'hover:bg-slate-50'}`}
              >
                <div
                  className={`w-2 h-2 rounded-full mt-[10px] shrink-0 transition-all ${!n.isRead ? upNotifDot : 'bg-transparent'}`}
                />

                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${!n.isRead ? upNotifIconUnread : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                >
                  {ICON_MAP[n.type] || <Bell size={18} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <strong
                      className={`text-[0.88rem] font-semibold block leading-tight truncate ${!n.isRead ? 'text-slate-900' : 'text-slate-600'}`}
                    >
                      {n.title}
                    </strong>
                    <span className="text-[0.68rem] font-semibold text-slate-400 whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded-md">
                      {getTimeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-[0.82rem] text-slate-500 leading-relaxed max-w-[95%]">
                    {n.message}
                  </p>

                  <div className="flex items-center gap-4 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleDelete(n._id, e)}
                      className="text-[0.68rem] font-semibold text-slate-400 hover:text-rose-600 uppercase tracking-widest flex items-center gap-1.5 transition-colors bg-transparent border-none cursor-pointer"
                    >
                      <Trash2 size={11} /> Remove Alert
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100 shadow-inner">
                <Bell size={32} className="text-slate-200" />
              </div>
              <h3 className="text-slate-900 font-semibold text-[1rem] mb-1">Your inbox is empty</h3>
              <p className="text-slate-400 text-[0.85rem] max-w-[200px]">
                We'll notify you here when there's an update on your activity.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
