import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LockClosedIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [strength, setStrength] = useState({ width: '0%', color: '', label: '' });

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [token, navigate]);

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

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    updateStrength(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    const toastId = toast.loading('Resetting password...');
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/password-reset/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        toast.success('Password reset successfully!', { id: toastId });
        setTimeout(() => navigate('/login'), 3000);
      } else {
        toast.error(data.detail || 'Failed to reset password', { id: toastId });
      }
    } catch (error) {
      toast.error('Connection failed. Please try again.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Password Reset!</h2>
          <p className="text-gray-600 mb-6">
            Your password has been successfully reset.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <LockClosedIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Create New Password</h2>
          <p className="text-gray-500 mt-2">
            Please enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              placeholder=" "
              className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 hover:border-gray-300 transition-all duration-200 outline-none peer"
              required
            />
            <label className="absolute left-10 top-3 text-gray-500 transition-all duration-200 pointer-events-none peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-blue-600 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:bg-white peer-[&:not(:placeholder-shown)]:px-1">
              New Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>

          {password && (
            <div className="mb-4">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full transition-all duration-300 rounded-full" style={{ width: strength.width, backgroundColor: strength.color }} />
              </div>
              <p className="text-xs mt-1" style={{ color: strength.color }}>{strength.label}</p>
            </div>
          )}

          <div className="relative mb-6">
            <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder=" "
              className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 hover:border-gray-300 transition-all duration-200 outline-none peer"
              required
            />
            <label className="absolute left-10 top-3 text-gray-500 transition-all duration-200 pointer-events-none peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-blue-600 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:bg-white peer-[&:not(:placeholder-shown)]:px-1">
              Confirm Password
            </label>
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting Password...
              </div>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center gap-1 mx-auto"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}