import React, { useState, useEffect, useRef } from 'react';
import { BellIcon, XMarkIcon, PencilIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';

const NotificationCenter = ({ isAdmin = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    message: '',
    type: 'info',
    target_type: 'all',
    expires_hours: 2
  });
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/list?limit=50');
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/mark-read`);
      await fetchNotifications();
      await fetchUnreadCount();
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      await fetchNotifications();
      await fetchUnreadCount();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const openNotification = async (notification) => {
    try {
      const response = await api.get(`/notifications/${notification.id}`);
      setSelectedNotification(response.data);
    } catch (error) {
      setSelectedNotification(notification);
    }
    setShowDetails(true);
  };

  const openEditModal = () => {
    setEditForm({
      title: selectedNotification.title,
      message: selectedNotification.message,
      type: selectedNotification.type || 'info',
      target_type: selectedNotification.target_type || 'all',
      expires_hours: 2
    });
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    setLoading(true);
    try {
      await api.put(`/notifications/${selectedNotification.id}`, {
        title: editForm.title,
        message: editForm.message,
        type: editForm.type,
        target_type: editForm.target_type,
        expires_hours: editForm.expires_hours
      });
      toast.success('Notification updated');
      setShowEditModal(false);
      await fetchNotifications();
      await fetchUnreadCount();
      const updated = await api.get(`/notifications/${selectedNotification.id}`);
      setSelectedNotification(updated.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this notification?')) return;
    setLoading(true);
    try {
      await api.delete(`/notifications/${selectedNotification.id}`);
      toast.success('Notification deleted');
      setShowDetails(false);
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (error) {
      toast.error('Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <BellIcon className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-700">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <BellIcon className="h-12 w-12 mx-auto mb-2" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => openNotification(notification)}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                      <span>{getNotificationIcon(notification.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showDetails && selectedNotification && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDetails(false)} />
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl">
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${
                    selectedNotification.type === 'success' ? 'bg-green-500' :
                    selectedNotification.type === 'warning' ? 'bg-yellow-500' :
                    selectedNotification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <h3 className="text-lg font-semibold text-gray-900">{selectedNotification.title}</h3>
                </div>
                <div className="flex gap-2">
                  {isAdmin && (
                    <>
                      <button
                        onClick={openEditModal}
                        className="p-1 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={handleDelete}
                        className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(selectedNotification.type)}`}>
                    <span className="text-lg">{getNotificationIcon(selectedNotification.type)}</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedNotification.created_at).toLocaleString()}
                    </p>
                    {selectedNotification.expires_at && (
                      <p className="text-xs text-orange-500">
                        Expires: {new Date(selectedNotification.expires_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedNotification.message}</p>
                </div>
              </div>

              <div className="flex justify-between p-4 border-t">
                <button
                  onClick={() => markAsRead(selectedNotification.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <CheckIcon className="h-4 w-4 inline mr-1" />
                  Mark as Read
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedNotification && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowEditModal(false)} />
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Edit Notification</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={editForm.message}
                    onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                    rows="4"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                  <select
                    value={editForm.target_type}
                    onChange={(e) => setEditForm({ ...editForm, target_type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="all">All Users</option>
                    <option value="students">Students Only</option>
                    <option value="staff">Staff Only</option>
                    <option value="admins">Admins Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expires (hours)</label>
                  <input
                    type="number"
                    value={editForm.expires_hours}
                    onChange={(e) => setEditForm({ ...editForm, expires_hours: parseInt(e.target.value) })}
                    min="1"
                    max="168"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t">
                <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleEdit} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;