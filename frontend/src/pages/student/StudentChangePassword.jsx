import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const StudentChangePassword = () => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.new_password !== formData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        current_password: formData.current_password,
        new_password: formData.new_password
      });
      toast.success('Password changed successfully');
      setFormData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="max-w-md align-center">
      <h1 className="text-2xl font-bold text-black-800 mb-6 text-center">Change Password</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4" >
          <div>
            <label className="block text-sm font-medium mb-2 focus border-none">Current Password</label>
            <input
              type="password"
              value={formData.current_password}
              onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">New Password</label>
            <input
              type="password"
              value={formData.new_password}
              onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Confirm New Password</label>
            <input
              type="password"
              value={formData.confirm_password}
              onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentChangePassword;
