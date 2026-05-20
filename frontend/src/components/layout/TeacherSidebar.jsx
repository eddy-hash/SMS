// src/components/layout/TeacherSidebar.jsx
import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  UserCircleIcon,
  BookOpenIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  CreditCardIcon,
  BellIcon,
  KeyIcon,
  DocumentDuplicateIcon,
  SignalIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';

import { useAuth } from '../../context/AuthContext';

const TeacherSidebar = ({ sidebarOpen }) => {
  const { user } = useAuth();

  const navSections = useMemo(() => [
    {
      label: 'Main',
      items: [
        { name: 'Dashboard', href: '/teacher', icon: HomeIcon },
        { name: 'Profile', href: '/teacher/profile', icon: UserCircleIcon },
        { name: 'Notifications', href: '/teacher/notifications', icon: BellIcon },
      ],
    },
    {
      label: 'Teaching',
      items: [
        { name: 'My Courses', href: '/teacher/courses', icon: BookOpenIcon },
        { name: 'My Students', href: '/teacher/students', icon: UserGroupIcon },
        { name: 'Results Management', href: '/teacher/results', icon: DocumentTextIcon },
        { name: 'Upload Results', href: '/teacher/upload', icon: CloudArrowUpIcon },
        { name: 'Attendance', href: '/teacher/attendance', icon: CalendarIcon },
      ],
    },
    {
      label: 'Academic',
      items: [
        { name: 'Student Results', href: '/teacher/student-results', icon: ChartBarIcon },
        { name: 'Class Performance', href: '/teacher/performance', icon: ChartBarIcon },
        { name: 'Timetable', href: '/teacher/timetable', icon: ClockIcon },
      ],
    },
    {
      label: 'Account',
      items: [
        { name: 'Change Password', href: '/teacher/change-password', icon: KeyIcon },
      ],
    },
  ], []);

  const getUserName = () => user?.full_name || user?.username || 'Teacher';
  const getUserRole = () => {
    if (user?.role === 'teacher') return 'Teacher';
    if (user?.role === 'hod') return 'Head of Department';
    return 'Teaching Staff';
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
    >
      <div className="flex h-full flex-col bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-emerald-700">
          <div className="h-9 w-9 flex items-center justify-center rounded-xl font-bold text-xs
            bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md">
            EAU
          </div>
          {sidebarOpen && (
            <div>
              <p className="text-lg font-bold">East Africa</p>
              <p className="text-xs text-emerald-200">University</p>
            </div>
          )}
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div className="px-5 py-4 border-b border-emerald-700">
            <p className="text-sm font-semibold">{getUserName()}</p>
            <p className="text-xs text-emerald-300">{getUserRole()}</p>
            <p className="text-xs text-emerald-400 mt-1 truncate">{user?.email}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {navSections.map((section) => (
            <div key={section.label}>
              {sidebarOpen && (
                <p className="px-2 text-[11px] uppercase tracking-wider text-emerald-300 mb-2">
                  {section.label}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
                        ${isActive
                          ? 'bg-emerald-600 text-white shadow-lg'
                          : 'text-emerald-200 hover:bg-emerald-700 hover:text-white'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div
                            className={`h-8 w-8 flex items-center justify-center rounded-lg transition
                            ${isActive
                              ? 'bg-white/20'
                              : 'bg-emerald-700 group-hover:bg-emerald-600'
                            }`}
                          >
                            <item.icon className="h-4 w-4" />
                          </div>
                          {sidebarOpen && (
                            <span className="flex-1">{item.name}</span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-emerald-700">
            <div className="flex items-center text-xs text-emerald-300">
              <SignalIcon className="h-4 w-4 mr-2" />
              <span>© 2026 EAU</span>
              <span className="ml-auto text-[10px]">Teacher Portal</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default TeacherSidebar;