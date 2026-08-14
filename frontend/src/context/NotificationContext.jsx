import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();
  const prevNotificationsRef = useRef([]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(window.API_URL + '/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401) {
        logout();
        return;
      }
      if (response.ok) {
        const data = await response.json();
        
        // Compara para detectar nuevas notificaciones
        if (prevNotificationsRef.current.length > 0) {
          const newUnread = data.filter(n => 
            !n.is_read && 
            !prevNotificationsRef.current.some(prev => prev.id === n.id)
          );
          
          if (newUnread.length > 0) {
            newUnread.forEach(notif => {
              triggerToast(notif);
            });
          }
        }
        
        setNotifications(data);
        prevNotificationsRef.current = data;
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 8000); // Polling cada 8 segundos
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      prevNotificationsRef.current = [];
    }
  }, [isAuthenticated]);

  const triggerToast = (notif) => {
    const toastId = `${notif.id}-${Date.now()}`;
    const newToast = {
      id: toastId,
      notificationId: notif.id,
      title: notif.title,
      content: notif.content,
      type: notif.type,
      related_id: notif.related_id
    };
    
    setToasts(prev => [...prev, newToast]);

    // Remover el toast después de 4 segundos
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }, 4000);
  };

  const markAsRead = async (notifId) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${window.API_URL}/api/notifications/${notifId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev =>
        prev.map(n => n.id === notifId ? { ...n, is_read: true } : n)
      );
      // Actualizar ref previa para que no lo cuente como nueva en el siguiente poll
      prevNotificationsRef.current = prevNotificationsRef.current.map(n => n.id === notifId ? { ...n, is_read: true } : n);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(window.API_URL + '/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        prevNotificationsRef.current = prevNotificationsRef.current.map(n => ({ ...n, is_read: true }));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleToastClick = (toast) => {
    // Marcar como leída
    markAsRead(toast.notificationId);
    // Cerrar el toast
    setToasts(prev => prev.filter(t => t.id !== toast.id));
    // Redirigir
    if (toast.type === 'new_message') {
      navigate(`/chats/${toast.related_id}`);
    } else if (toast.type === 'photo_verified') {
      navigate('/my-profile');
    } else if (toast.type === 'nearby_pro') {
      navigate(`/profile/${toast.related_id}`);
    }
  };

  const getIconClass = (type) => {
    switch (type) {
      case 'new_message': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'photo_verified': return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'nearby_pro': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      default: return 'bg-primary/5 text-primary';
    }
  };

  const getIconName = (type) => {
    switch (type) {
      case 'new_message': return 'forum';
      case 'photo_verified': return 'photo_library';
      case 'nearby_pro': return 'location_on';
      default: return 'notifications';
    }
  };

  const value = {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    toasts
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Toast Overlay Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none w-80 max-w-[calc(100vw-32px)]">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white dark:bg-slate-800 border border-outline-variant/10 dark:border-slate-700 p-4 rounded-xl shadow-2xl flex gap-3 animate-toast-in cursor-pointer hover:border-primary/20 dark:hover:border-teal-500 transition-colors"
            onClick={() => handleToastClick(toast)}
          >
            <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${getIconClass(toast.type)}`}>
              <span className="material-symbols-outlined text-[18px]">{getIconName(toast.type)}</span>
            </div>
            <div className="flex-1 space-y-0.5">
              <h4 className="text-xs font-bold text-primary dark:text-slate-100 leading-tight">{toast.title}</h4>
              <p className="text-xs text-primary/70 dark:text-slate-350 leading-tight">{toast.content}</p>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe ser usado dentro de un NotificationProvider');
  }
  return context;
};
