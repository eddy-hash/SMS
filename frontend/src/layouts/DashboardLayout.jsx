import React, { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Bars3Icon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  UserIcon,
  Cog6ToothIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

import Sidebar from "../components/layout/Sidebar";           
import StudentSidebar from "../components/layout/StudentSidebar"; 
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import ProfileImage from '../components/common/ProfileImage';
import CreateNotification from '../components/notifications/CreateNotification';
import logo from '../assets/logo.png';
import api from '../services/api';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === 'admin' || user?.role === 'principal';
  const isStudent = user?.role === 'student';

  const handleLogout = async () => {
    await logout();
    toast.success(`Logged out successfully, ${user?.username || "User"}`);
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/list?limit=10');
      const data = response.data || [];
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/mark-read`);
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    
    const adminTitles = {
      "/dashboard": "Dashboard",
      "/students": "Student Management",
      "/staff": "Staff Management",
      "/courses": "Course Management",
      "/departments": "Department Management",
      "/announcements": "Reports & Announcements",
    };
   
    const studentTitles = {
      "/student/dashboard": "Student Dashboard",
      "/student/profile": "My Profile",
      "/student/courses": "My Courses",
      "/student/results": "My Results",
      "/student/attendance": "Attendance",
      "/student/timetable": "Timetable",
      "/student/fees": "Fee Status",
      "/student/notifications": "Notifications",
      "/student/change-password": "Change Password",
      "/student/registration/sem1": "Semester 1 Registration",
      "/student/registration/sem2": "Semester 2 Registration",
    };

    if (isStudent) {
      return studentTitles[location.pathname] || "Student Portal";
    }
    return adminTitles[location.pathname] || "East Africa University";
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
    if (isStudent) return "Student";
    return user?.role || user?.user_type || "Administrator";
  };

  const handleProfileImageUpdate = (newImage) => {
    if (user) {
      user.profile_image = newImage;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '📢';
    }
  };

  const CurrentSidebar = isStudent ? StudentSidebar : Sidebar;

  return (
    <div className="min-h-screen bg-gray-50">
   
      <CurrentSidebar sidebarOpen={sidebarOpen} />

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

                <div className="flex items-center gap-3">
                  <img 
                    src={logo} 
                    alt="EAU Logo" 
                    className="h-10 w-10 object-contain"
                  />
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      {getPageTitle()}
                    </h1>
                    <p className="text-xs text-gray-500">
                      University Management System
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:block text-sm text-gray-600">
                  {formatDate(currentDate)}
                </div>

                {isAdmin && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    title="Create Notification"
                  >
                    <BellIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Notify</span>
                  </button>
                )}

                <div ref={notificationRef} className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowProfileMenu(false);
                    }}
                    className="relative p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <BellIcon className="h-5 w-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                      <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-400">
                            <BellIcon className="h-12 w-12 mx-auto mb-2" />
                            <p>No notifications</p>
                          </div>
                        ) : (
                          notifications.map(notification => (
                            <div
                              key={notification.id}
                              onClick={() => markAsRead(notification.id)}
                              className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                                !notification.is_read ? 'bg-blue-50' : ''
                              }`}
                            >
                              <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span>{getNotificationIcon(notification.type)}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-gray-900">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(notification.created_at).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
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
                    <ProfileImage 
                      size="h-10 w-10" 
                      editable={true}
                      onImageUpdate={handleProfileImageUpdate}
                    />
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
                          <ProfileImage 
                            size="h-14 w-14" 
                            editable={true}
                            onImageUpdate={handleProfileImageUpdate}
                          />
                          <div>
                            <p className="text-sm font-semibold">{getUserName()}</p>
                            <p className="text-xs text-gray-500">{getUserRole()}</p>
                            <p className="text-xs text-gray-400 truncate">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            navigate(isStudent ? "/student/profile" : "/profile");
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <UserIcon className="h-4 w-4" />
                          My Profile
                        </button>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            navigate(isStudent ? "/student/change-password" : "/settings");
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

      {showCreateModal && (
        <CreateNotification
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchNotifications();
          }}
        />
      )}
    </div>
  );
};

export default DashboardLayout;