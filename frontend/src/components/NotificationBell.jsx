import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    setIsOpen(false);
    
    // Mark as read
    if (!notif.is_read) {
      await markAsRead(notif.id);
    }

    // Redirect
    if (notif.type === 'new_message') {
      navigate(`/chats/${notif.related_id}`);
    } else if (notif.type === 'photo_verified') {
      navigate('/my-profile');
    } else if (notif.type === 'nearby_pro') {
      navigate(`/profile/${notif.related_id}`);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_message':
        return { name: 'forum', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' };
      case 'photo_verified':
        return { name: 'photo_library', bg: 'bg-green-500/10 text-green-600 dark:text-green-400' };
      case 'nearby_pro':
        return { name: 'location_on', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' };
      default:
        return { name: 'notifications', bg: 'bg-primary/5 text-primary' };
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Justo ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    return `Hace ${diffDays} d`;
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full bg-primary/5 text-primary hover:bg-primary/10 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-all active:scale-95 flex items-center justify-center cursor-pointer border-none"
        title="Notificaciones"
      >
        <span className="material-symbols-outlined text-[24px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 max-h-[450px] bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-outline-variant/10 dark:border-slate-700 overflow-hidden z-50 flex flex-col animate-feedback">
          {/* Header */}
          <div className="p-4 border-b border-outline-variant/10 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/80">
            <h3 className="font-bold text-sm text-primary dark:text-slate-100 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">notifications_active</span>
              Notificaciones
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] text-primary dark:text-teal-400 font-bold hover:underline bg-transparent border-none cursor-pointer"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/5 dark:divide-slate-700/50">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center text-primary/45 dark:text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2">notifications_off</span>
                <p className="text-xs italic">No tienes notificaciones aún.</p>
              </div>
            ) : (
              notifications.map(notif => {
                const iconInfo = getNotificationIcon(notif.type);
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 flex gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors ${
                      !notif.is_read ? 'bg-primary/5 dark:bg-teal-500/5 font-semibold' : ''
                    }`}
                  >
                    {/* Icon Badge */}
                    <div className={`size-9 shrink-0 rounded-full flex items-center justify-center ${iconInfo.bg}`}>
                      <span className="material-symbols-outlined text-[20px]">{iconInfo.name}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-0.5">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-xs text-primary dark:text-slate-100 font-bold leading-tight">{notif.title}</h4>
                        <span className="text-[9px] text-primary/50 dark:text-slate-450 whitespace-nowrap shrink-0">{formatTime(notif.created_at)}</span>
                      </div>
                      <p className="text-xs text-primary/70 dark:text-slate-350 leading-tight pr-2">{notif.content}</p>
                    </div>

                    {/* Unread indicator dot */}
                    {!notif.is_read && (
                      <div className="size-2 shrink-0 rounded-full bg-red-500 self-center"></div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
