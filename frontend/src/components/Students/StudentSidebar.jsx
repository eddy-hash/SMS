import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChartBarSquareIcon,
  CalendarIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
  SignalIcon,
} from '@heroicons/react/24/outline';
import DarkModeToggle from '../common/DarkModeToggle';
import { useAuth } from '../../context/AuthContext';

const StudentSidebar = ({ sidebarOpen }) => {
  const { user } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/student/dashboard', icon: HomeIcon },
    { name: 'My Profile', href: '/student/profile', icon: UserCircleIcon },
    { name: 'My Courses', href: '/student/courses', icon: BookOpenIcon },
    { name: 'Attendance', href: '/student/attendance', icon: CalendarIcon },
    { name: 'Results', href: '/student/results', icon: ClipboardDocumentListIcon },
    { name: 'Analytics', href: '/student/analytics', icon: ChartBarSquareIcon },
  ];

  const getStudentName = () => user?.full_name || user?.username || 'Student';
  const getStudentRole = () => user?.role || 'Student';
  const getRegistrationNumber = () => user?.registration_number || 'Not assigned';

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
    >
      <div className="flex h-full flex-col bg-gradient-to-b from-green-900 via-green-800 to-green-900 text-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-green-700">
          <div className="h-9 w-9 flex items-center justify-center rounded-xl font-bold text-xs
            bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md">
            EAU
          </div>

          {sidebarOpen && (
            <div>
              <p className="text-lg font-bold">East Africa</p>
              <p className="text-xs text-green-200">University</p>
            </div>
          )}

          <div className="ml-auto">
            <DarkModeToggle />
          </div>
        </div>

        {/* Student Info */}
        {sidebarOpen && (
          <div className="px-4 py-4 border-b border-green-700">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center">
                <span className="text-lg font-bold">
                  {getStudentName().charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{getStudentName()}</p>
                <p className="text-xs text-green-300">{getStudentRole()}</p>
                <p className="text-xs text-green-300 mt-1">Reg: {getRegistrationNumber()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
                    ${isActive
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'text-green-200 hover:bg-green-700 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={`h-8 w-8 flex items-center justify-center rounded-lg transition
                        ${isActive
                          ? 'bg-white/20'
                          : 'bg-green-700 group-hover:bg-green-600'
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
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-green-700">
            <div className="flex items-center text-xs text-green-300">
              <SignalIcon className="h-4 w-4 mr-2" />
              <span>© 2026 EAU</span>
              <span className="ml-auto text-[10px]">v2.1 - Student Portal</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default StudentSidebar;