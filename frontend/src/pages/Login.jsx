import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, UserPlusIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import toast from "react-hot-toast";
import logo from '../assets/logo.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const { user, login } = useAuth();

  useEffect(() => {
    if (user) {
      const destination = user.role === 'admin' ? '/dashboard' : '/student/dashboard';
      navigate(destination);
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const toastId = toast.loading("Signing in...");

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.access_token, rememberMe);
        toast.success(`Welcome back, ${data.user?.full_name || data.user?.username || "User"}!`, {
          id: toastId,
        });
      } else {
        toast.error(data.detail || "Invalid username or password", {
          id: toastId,
        });
      }
    } catch (err) {
      toast.error("Server connection failed 🚫", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 relative overflow-hidden">
      <style>{`
        @keyframes formEnter {
          0% {
            opacity: 0;
            transform: translateY(40px) scale(.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes bounceSoft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .login-card {
          animation: formEnter .6s ease;
          box-shadow: 0 12px 35px rgba(0,0,0,.08);
        }

        .input-group {
          position: relative;
        }

        .floating-label {
          position: absolute;
          left: 36px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          color: #6b7280;
          pointer-events: none;
          background: white;
          padding: 0 6px;
          transition: all .2s ease;
        }

        .input-field:focus + .floating-label,
        .input-field:not(:placeholder-shown) + .floating-label {
          top: 0;
          transform: translateY(-50%);
          font-size: 12px;
          color: #2563eb;
        }

        .login-btn:hover {
          animation: bounceSoft .4s ease;
        }
      `}</style>

      <div className="relative z-10 w-full max-w-md">
        <div className="login-card bg-white rounded-xl p-8 border border-gray-200">
          
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
              {logo ? (
                <img src={logo} alt="East Africa University" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              )}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-blue-600">
            EAST AFRICA UNIVERSITY
          </h2>

          <p className="text-center text-gray-500 text-sm mb-8">
            School Management System
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="input-group">
              <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder=" "
                className="input-field w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:border-blue-500 transition"
                required
              />
              <label className="floating-label">Username</label>
            </div>

            <div className="input-group">
              <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                className="input-field w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:border-blue-500 transition"
                required
              />
              <label className="floating-label">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3"
              >
                {showPassword ?
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" /> :
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                }
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-blue-600 hover:text-blue-800 transition hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-btn w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ?
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Signing in...
                </div> :
                <>
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  Sign In
                </>
              }
            </button>
          </form>

          <div className="mt-4">
            <button
              onClick={handleRegisterClick}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 transition"
            >
              <UserPlusIcon className="h-5 w-5" />
              Create New Account
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-gray-400">
            © 2026 East Africa University
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;