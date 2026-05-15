import React, { useState } from 'react';
import { LockClosedIcon, EyeIcon, EyeSlashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState({ width: '0%', color: '', label: '' });

  const updateStrength = (v) => {
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    const map = [
      { width: '0%', color: '', label: '' },
      { width: '25%', color: '#E24B4A', label: 'Weak' },
      { width: '50%', color: '#EF9F27', label: 'Fair' },
      { width: '75%', color: '#1D9E75', label: 'Good' },
      { width: '100%', color: '#639922', label: 'Strong' },
    ];
    setStrength(map[score]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    const toastId = toast.loading('Changing password...');
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/v1/password-reset/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Password changed successfully!', { id: toastId });
        onClose();
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data.detail || 'Failed to change password', { id: toastId });
      }
    } catch (error) {
      toast.error('Connection failed. Please try again.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Change Password</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="relative mb-4">
            <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showCurrent ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative mb-2">
            <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                updateStrength(e.target.value);
              }}
              placeholder="New password"
              className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showNew ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>

          {newPassword && (
            <div className="mb-4">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full transition-all duration-300 rounded-full" style={{ width: strength.width, backgroundColor: strength.color }} />
              </div>
              {strength.label && <p className="text-xs mt-1" style={{ color: strength.color }}>{strength.label}</p>}
            </div>
          )}

          <div className="relative mb-6">
            <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showConfirm ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Changing...
              </div>
            ) : (
              'Change Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}