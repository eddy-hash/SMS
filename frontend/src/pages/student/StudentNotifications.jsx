import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/notifications/list', {
        params: { limit: 50, unread_only: false }
      });
      if (Array.isArray(response.data)) {
        setNotifications(response.data);
        const unread = response.data.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/mark-read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadCount]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeBg = (type) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <BellIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Notifications</h1>
              <p className="text-sm text-gray-500 mt-1">
                {unreadCount > 0 ? (
                  <span className="text-blue-600 font-semibold">{unreadCount} unread</span>
                ) : (
                  'All caught up!'
                )}
              </p>
            </div>
          </div>
          {notifications.length > 0 && unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all"
            >
              <CheckCircleIcon className="h-4 w-4" />
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="loading-spinner"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <EnvelopeIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">No notifications</h3>
            <p className="text-gray-500 text-sm">You're all caught up! Check back later for updates.</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {notifications.map((notification, idx) => (
              <div
                key={notification.id}
                className={`notification-card rounded-xl border transition-all duration-300 ${getTypeBg(notification.type)} ${!notification.is_read ? 'shadow-sm ring-1 ring-blue-200' : 'opacity-90 hover:opacity-100'}`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                        <h3 className={`text-base font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{new Date(notification.created_at).toLocaleString()}</span>
                          {!notification.is_read && (
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed mt-1">{notification.message}</p>
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
                        >
                          <CheckCircleIcon className="h-3 w-3" />
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulseRing {
          0% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .notification-card {
          animation: slideIn 0.3s ease forwards;
          opacity: 0;
          transform: translateX(-20px);
          animation-fill-mode: forwards;
        }

        .notification-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @media (max-width: 640px) {
          .notification-card {
            margin: 0 0.5rem;
          }
          .notification-card .p-4 {
            padding: 1rem;
          }
        }

        @media (min-width: 768px) {
          .notification-card .p-5 {
            padding: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentNotifications;