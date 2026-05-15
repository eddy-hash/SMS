import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const toastId = toast.loading('Sending reset link...');
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/password-reset/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitted(true);
        toast.success('Reset link sent to your email!', { id: toastId });
      } else {
        toast.error(data.detail || 'Failed to send reset link', { id: toastId });
      }
    } catch (error) {
      toast.error('Connection failed. Please try again.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h2>
          <p className="text-gray-600 mb-4">We've sent password reset instructions to:</p>
          <p className="font-semibold text-blue-600 mb-6">{email}</p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Login
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
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM9 12h6m-6 4h6m-3-8v12m0 0L9 16m3 4l3-4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Forgot Password?</h2>
          <p className="text-gray-500 mt-2">Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="relative mb-6">
            <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 hover:border-gray-300 transition-all duration-200 outline-none peer"
              required
            />
            <label className="absolute left-10 top-3 text-gray-500 transition-all duration-200 pointer-events-none peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-blue-600 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:bg-white peer-[&:not(:placeholder-shown)]:px-1">
              Email address
            </label>
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
                Sending...
              </div>
            ) : (
              'Send Reset Link'
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