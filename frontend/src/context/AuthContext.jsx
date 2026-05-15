import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const API_BASE = "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("✅ Token attached to:", config.url);
  } else {
    console.warn("⚠️ No token for:", config.url);
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("🔐 Authentication failed - redirecting to login");
      localStorage.removeItem("access_token");
      sessionStorage.removeItem("access_token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const apiClient = api;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const storedToken =
          localStorage.getItem("access_token") ||
          sessionStorage.getItem("access_token");

        const storedUser =
          localStorage.getItem("user") ||
          sessionStorage.getItem("user");

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          
         
          if (!parsedUser.username && parsedUser.email) {
            parsedUser.username = parsedUser.email.split('@')[0];
          }
          if (!parsedUser.full_name && (parsedUser.first_name || parsedUser.last_name)) {
            parsedUser.full_name = `${parsedUser.first_name || ''} ${parsedUser.last_name || ''}`.trim();
          }
          
          setToken(storedToken);
          setUser(parsedUser);
          console.log("✅ User restored from storage");
        }
      } catch (error) {
        console.warn("Auth init failed:", error.message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const login = (userData, accessToken, rememberMe = false) => {
    if (!userData || !accessToken) {
      console.error("❌ Login failed: Missing userData or accessToken");
      return;
    }

    console.log("🔐 Logging in, saving token");

    const normalizedUser = {
      ...userData,
      username: userData.username || userData.email?.split('@')[0] || "user",
      full_name: userData.full_name || 
                 (userData.first_name && userData.last_name ? `${userData.first_name} ${userData.last_name}` : 
                 userData.first_name || userData.last_name || userData.email?.split('@')[0] || "User"),
      role: userData.role || "student"
    };
    
    setUser(normalizedUser);
    setToken(accessToken);

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("access_token", accessToken);
    storage.setItem("user", JSON.stringify(normalizedUser));
    
    console.log("✅ Login successful, user:", normalizedUser.username);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user");

    setUser(null);
    setToken(null);
    console.log("🔓 Logged out");
  };

  const updateProfileImage = (imageData) => {
    setUser((prev) => {
      if (!prev) return prev;

      const updated = { ...prev, profile_image: imageData };
      const storage = localStorage.getItem("access_token")
        ? localStorage
        : sessionStorage;

      storage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  const hasRole = (role) => user?.role === role;
  const isSuperAdmin = () => hasRole("superadmin");
  const isStudent = () => hasRole("student");

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateProfileImage,
    hasRole,
    isSuperAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};