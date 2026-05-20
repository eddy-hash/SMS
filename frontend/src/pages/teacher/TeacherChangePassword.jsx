import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import {
  KeyIcon,
  UserCircleIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import FloatingLabelInput from './components/FloatingLabelInput';
import PasswordStrengthMeter from './components/PasswordStrengthMeter';
import PasswordRequirements from './components/PasswordRequirement';

const TeacherChangePassword = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [focused, setFocused] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFocus = (field) => {
    setFocused((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field, value) => {
    if (!value) setFocused((prev) => ({ ...prev, [field]: false }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'new_password') setPasswordError('');
  };

  const validatePassword = () => {
    const pwd = formData.new_password;
    if (pwd.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    if (!/[A-Z]/.test(pwd)) {
      setPasswordError('Password must contain at least one uppercase letter');
      return false;
    }
    if (!/[0-9]/.test(pwd)) {
      setPasswordError('Password must contain at least one number');
      return false;
    }
    if (!/[^A-Za-z0-9]/.test(pwd)) {
      setPasswordError('Password must contain at least one special character (!@#$%^&*)');
      return false;
    }
    return true;
  };

  const showSuccessToast = () => {
    toast.success(
      (t) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">Password Changed!</p>
            <p className="text-xs text-gray-500">Your password has been updated successfully</p>
          </div>
        </div>
      ),
      {
        duration: 4000,
        style: { background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px' },
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.current_password) {
      toast.error('Please enter current password');
      return;
    }
    if (!formData.new_password) {
      toast.error('Please enter new password');
      return;
    }
    if (formData.new_password !== formData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    if (!validatePassword()) {
      toast.error(passwordError);
      return;
    }
    if (formData.new_password === formData.current_password) {
      toast.error('New password cannot be same as current password');
      return;
    }

    setLoading(true);
    try {
      await api.put('/teacher/password/change-password', {
        current_password: formData.current_password,
        new_password: formData.new_password
      });

      showSuccessToast();
      setFormData({ current_password: '', new_password: '', confirm_password: '' });
      setFocused({ current: false, new: false, confirm: false });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-center gap-2 mb-6">
          
          <h1 className="text-xl font-bold text-green-600">Welcome, change your Password here!</h1>
        </div>

        {/* Teacher Info Card */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <UserCircleIcon className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Logged in as</p>
            <p className="font-semibold text-gray-800">{user?.full_name || user?.username}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <p className="text-xs text-emerald-600 capitalize mt-1">Role: {user?.role}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-5">
          <FloatingLabelInput
            name="current_password"
            label="Current Password"
            type="password"
            value={formData.current_password}
            field="current"
            handleChange={handleChange}
            handleFocus={handleFocus}
            handleBlur={handleBlur}
            togglePasswordVisibility={togglePasswordVisibility}
            showPasswords={showPasswords}
            focused={focused}
          />

          <div>
            <FloatingLabelInput
              name="new_password"
              label="New Password"
              type="password"
              value={formData.new_password}
              field="new"
              handleChange={handleChange}
              handleFocus={handleFocus}
              handleBlur={handleBlur}
              togglePasswordVisibility={togglePasswordVisibility}
              showPasswords={showPasswords}
              focused={focused}
              error={passwordError}
            />
            <PasswordStrengthMeter password={formData.new_password} />
            <PasswordRequirements password={formData.new_password} />
          </div>

          <FloatingLabelInput
            name="confirm_password"
            label="Confirm New Password"
            type="password"
            value={formData.confirm_password}
            field="confirm"
            handleChange={handleChange}
            handleFocus={handleFocus}
            handleBlur={handleBlur}
            togglePasswordVisibility={togglePasswordVisibility}
            showPasswords={showPasswords}
            focused={focused}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Changing...</span>
              </>
            ) : (
              <>
                <ShieldCheckIcon className="h-5 w-5" />
                <span>Change Password</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherChangePassword;