import React, { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Bars3Icon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  UserIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import Sidebar from "../layout/Sidebar";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import NotificationDropdown from "../notifications/NotificationDropdown";
import ProfileImage from "./ProfileImage";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    toast.success(`Logged out successfully, ${user?.username || "User"}`);
    navigate("/login");
  };

  const getPageTitle = () => {
    const titles = {
      "/dashboard": "Dashboard",
      "/analytics": "Analytics",
      "/students": "Student Management",
      "/staff": "Staff Management",
      "/courses": "Course Management",
      "/departments": "Department Management",
      "/announcements": "Announcements",
    };
    return titles[location.pathname] || "East Africa University";
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getUserName = () => {
    return user?.full_name || user?.username || user?.email || "User";
  };

  const getUserRole = () => {
    return user?.role || user?.user_type || "Administrator";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className={`${sidebarOpen ? "lg:ml-72" : "lg:ml-20"} transition-all`}>
        <nav className="sticky top-0 bg-white border-b z-30">
          <div className="px-6">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 text-gray-600"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {getPageTitle()}
                  </h1>
                  <p className="text-xs text-gray-500">
                    University Management System
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:block text-sm text-gray-600">
                  {formatDate(currentDate)}
                </div>

                <div ref={notificationRef} className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowProfileMenu(false);
                    }}
                    className="relative p-2 rounded-lg bg-gray-100"
                  >
                    <BellIcon className="h-5 w-5 text-gray-600" />
                  </button>

                  {showNotifications && (
                    <NotificationDropdown
                      notifications={notifications}
                      markNotificationAsRead={() => {}}
                    />
                  )}
                </div>

                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => {
                      setShowProfileMenu(!showProfileMenu);
                      setShowNotifications(false);
                    }}
                    className="flex items-center gap-3 bg-gray-100 rounded-full px-3 py-1 hover:bg-gray-200 transition-colors"
                  >
                    <ProfileImage size="h-9 w-9" editable={false} />
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-semibold">{getUserName()}</p>
                      <p className="text-xs text-gray-500">{getUserRole()}</p>
                    </div>
                    <ChevronDownIcon className="h-4 w-4 text-gray-500 hidden lg:block" />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-50">
                      <div className="p-4 border-b">
                        <div className="flex items-center gap-3">
                          <ProfileImage size="h-12 w-12" editable={false} />
                          <div>
                            <p className="text-sm font-semibold">{getUserName()}</p>
                            <p className="text-xs text-gray-500">{getUserRole()}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[150px]">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            navigate("/profile");
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <UserIcon className="h-4 w-4" />
                          My Profile
                        </button>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            navigate("/settings");
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Cog6ToothIcon className="h-4 w-4" />
                          Settings
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
