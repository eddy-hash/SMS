import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function RegisterForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState({ width: "0%", color: "", label: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateStrength = (v) => {
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    const map = [
      { width: "0%", color: "", label: "" },
      { width: "25%", color: "#E24B4A", label: "Weak" },
      { width: "50%", color: "#EF9F27", label: "Fair" },
      { width: "75%", color: "#1D9E75", label: "Good" },
      { width: "100%", color: "#639922", label: "Strong" },
    ];
    setStrength(map[score]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "password") updateStrength(value);
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.fname.trim()) errs.fname = "First name is required";
    if (!form.lname.trim()) errs.lname = "Last name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email address";
    if (form.password.length < 6) errs.password = "Password must be at least 6 characters";
    if (form.confirm !== form.password) errs.confirm = "Passwords do not match";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    
    if (Object.keys(errs).length === 0) {
      setLoading(true);
      
      try {
        // Combine first_name and last_name into full_name
        const fullName = `${form.fname} ${form.lname}`.trim();
        
        const response = await fetch('http://localhost:8000/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: form.email,  // Use email as username
            email: form.email,
            password: form.password,
            full_name: fullName
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setSuccess(true);
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setErrors({ submit: data.detail || "Registration failed" });
        }
      } catch (error) {
        setErrors({ submit: "Connection error. Please try again." });
      } finally {
        setLoading(false);
      }
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" strokeWidth={2.5} />
            </svg>
          </div>
          <p className="text-2xl font-semibold text-gray-800 mb-2">Account Created!</p>
          <p className="text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="w-20 h-20 rounded-full shadow-lg object-cover" />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Create an account</h2>
        <p className="text-gray-500 text-center mb-6">Sign up to get started</p>

        <div className="grid grid-cols-2 gap-3 mb-2">
          <div className="relative mb-4">
            <input
              name="fname"
              type="text"
              value={form.fname}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all focus:ring-2 peer ${
                errors.fname 
                  ? 'border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
              }`}
              placeholder=" "
            />
            <label className={`absolute left-3 transition-all duration-200 pointer-events-none bg-white px-1
              ${form.fname
                ? '-top-2 text-xs text-blue-600' 
                : 'top-2.5 text-gray-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600'}`}>
              First name
            </label>
            {errors.fname && <p className="text-red-500 text-xs mt-1">{errors.fname}</p>}
          </div>

          <div className="relative mb-4">
            <input
              name="lname"
              type="text"
              value={form.lname}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all focus:ring-2 peer ${
                errors.lname 
                  ? 'border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
              }`}
              placeholder=" "
            />
            <label className={`absolute left-3 transition-all duration-200 pointer-events-none bg-white px-1
              ${form.lname
                ? '-top-2 text-xs text-blue-600' 
                : 'top-2.5 text-gray-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600'}`}>
              Last name
            </label>
            {errors.lname && <p className="text-red-500 text-xs mt-1">{errors.lname}</p>}
          </div>
        </div>

        <div className="relative mb-4">
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all focus:ring-2 peer ${
              errors.email 
                ? 'border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
            }`}
            placeholder=" "
          />
          <label className={`absolute left-3 transition-all duration-200 pointer-events-none bg-white px-1
            ${form.email
              ? '-top-2 text-xs text-blue-600' 
              : 'top-2.5 text-gray-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600'}`}>
            Email address
          </label>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div className="relative mb-2">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all focus:ring-2 peer pr-12 ${
              errors.password 
                ? 'border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
            }`}
            placeholder=" "
          />
          <label className={`absolute left-3 transition-all duration-200 pointer-events-none bg-white px-1
            ${form.password
              ? '-top-2 text-xs text-blue-600' 
              : 'top-2.5 text-gray-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600'}`}>
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        {form.password && (
          <div className="mb-4">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full transition-all duration-300 rounded-full" style={{ width: strength.width, backgroundColor: strength.color }} />
            </div>
            {strength.label && <p className="text-xs mt-1" style={{ color: strength.color }}>{strength.label}</p>}
          </div>
        )}

        <div className="relative mb-4">
          <input
            name="confirm"
            type={showConfirmPassword ? "text" : "password"}
            value={form.confirm}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all focus:ring-2 peer pr-12 ${
              errors.confirm 
                ? 'border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
            }`}
            placeholder=" "
          />
          <label className={`absolute left-3 transition-all duration-200 pointer-events-none bg-white px-1
            ${form.confirm
              ? '-top-2 text-xs text-blue-600' 
              : 'top-2.5 text-gray-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600'}`}>
            Confirm password
          </label>
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showConfirmPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
          {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
        </div>

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{errors.submit}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md mt-2"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating account...
            </div>
          ) : (
            "Create account"
          )}
        </button>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')} className="text-blue-600 font-semibold cursor-pointer hover:underline">
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}