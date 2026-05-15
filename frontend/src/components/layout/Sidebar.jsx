import React, { useEffect, useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  AcademicCapIcon,
  UsersIcon,
  BookOpenIcon,
  BuildingOfficeIcon,
  DocumentChartBarIcon,
  ChartBarSquareIcon,
  SignalIcon,
} from '@heroicons/react/24/outline';

import DarkModeToggle from '../common/DarkModeToggle';
import { useAuth } from '../../context/AuthContext';
import { getCounts } from '../../services/dashboard';

const Sidebar = ({ sidebarOpen }) => {
  const { user } = useAuth();

  const [counts, setCounts] = useState({
    students: 0,
    staff: 0,
    announcements: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const data = await getCounts();
        setCounts(data);
      } catch (e) {
        console.log(e);
      }
    };
    fetchCounts();
  }, []);

  const navSections = useMemo(() => [
    {
      label: 'Main',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Analytics', href: '/analytics', icon: ChartBarSquareIcon },
      ],
    },
    {
      label: 'People',
      items: [
        { name: 'Students', href: '/students', icon: AcademicCapIcon, badge: counts.students },
        { name: 'Staff', href: '/staff', icon: UsersIcon, badge: counts.staff },
      ],
    },
    {
      label: 'Academic',
      items: [
        { name: 'Courses', href: '/courses', icon: BookOpenIcon },
        { name: 'Departments', href: '/departments', icon: BuildingOfficeIcon },
      ],
    },
    {
      label: 'Communication',
      items: [
        { name: 'Announcements', href: '/announcements', icon: DocumentChartBarIcon, badge: counts.announcements },
      ],
    },
  ], [counts]);

  const getUserName = () => user?.full_name || user?.username || 'Administrator';
  const getUserRole = () => user?.role || 'Super Admin';

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
    >
      <div className="flex h-full flex-col bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white shadow-2xl">

        <div className="flex items-center gap-3 px-5 h-16 border-b border-blue-700">
          <div className="h-9 w-9 flex items-center justify-center rounded-xl font-bold text-xs
            bg-gradient-to-br from-cyan-400 to-purple-500 shadow-md">
            EAU
          </div>

          {sidebarOpen && (
            <div>
              <p className="text-lg font-bold">East Africa</p>
              <p className="text-xs text-blue-200">University</p>
            </div>
          )}

          <div className="ml-auto">
            <DarkModeToggle />
          </div>
        </div>

     
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">

          {navSections.map((section) => (
            <div key={section.label}>
              {sidebarOpen && (
                <p className="px-2 text-[11px] uppercase tracking-wider text-blue-300 mb-2">
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
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-blue-200 hover:bg-blue-700 hover:text-white'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                         
                          <div
                            className={`h-8 w-8 flex items-center justify-center rounded-lg transition
                            ${isActive
                              ? 'bg-white/20'
                              : 'bg-blue-700 group-hover:bg-blue-600'
                            }`}
                          >
                            <item.icon className="h-4 w-4" />
                          </div>

                          {sidebarOpen && (
                            <>
                              <span className="flex-1">{item.name}</span>

                            
                              {item.badge > 0 && (
                                <span className="text-xs font-bold bg-cyan-400 text-blue-900 px-2 py-0.5 rounded-full">
                                  {item.badge}
                                </span>
                              )}
                            </>
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

    
        {sidebarOpen && (
          <div className="p-4 border-t border-blue-700">
            <div className="flex items-center text-xs text-blue-300">
              <SignalIcon className="h-4 w-4 mr-2" />
              <span>© 2026 EAU</span>
              <span className="ml-auto text-[10px]">Admin Portal</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
