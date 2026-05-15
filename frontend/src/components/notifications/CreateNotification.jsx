import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CreateNotification = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    target_type: 'all',
    target_id: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    try {
      const submitData = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        target_type: formData.target_type,
        target_id: formData.target_type === 'specific_user' ? parseInt(formData.target_id) : null
      };
      
      await api.post('/notifications/create', submitData);
      toast.success('Notification sent successfully');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Send Notification</h2>
            <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Notification title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Notification message"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                value={formData.target_type}
                onChange={(e) => setFormData({ ...formData, target_type: e.target.value, target_id: '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Users</option>
                <option value="students">Students Only</option>
                <option value="staff">Staff Only</option>
                <option value="admins">Admins Only</option>
                <option value="specific_user">Specific User</option>
              </select>
            </div>
            
            {formData.target_type === 'specific_user' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <input
                  type="number"
                  value={formData.target_id}
                  onChange={(e) => setFormData({ ...formData, target_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter user ID"
                />
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Notification'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateNotification;