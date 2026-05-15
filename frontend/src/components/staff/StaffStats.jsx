import React, { useState, useEffect } from 'react';
import { UsersIcon, UserGroupIcon, ChartBarIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

const StaffStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    teachers: 0,
    administrative: 0,
    departments: 0,
    total_percentage: 0,
    teachers_percentage: 0,
    administrative_percentage: 0,
    departments_percentage: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffStats();
  }, []);

  const fetchStaffStats = async () => {
    try {
      const response = await api.get('/staff/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching staff stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      label: 'Total Staff', 
      value: stats.total, 
      icon: UsersIcon, 
      color: 'blue', 
      change: stats.total_percentage,
      changeText: `${stats.total_percentage >= 0 ? '+' : ''}${stats.total_percentage}% from last month`
    },
    { 
      label: 'Teachers', 
      value: stats.teachers, 
      icon: UserGroupIcon, 
      color: 'green', 
      change: stats.teachers_percentage,
      changeText: `${stats.teachers_percentage >= 0 ? '+' : ''}${stats.teachers_percentage}% from last month`
    },
    { 
      label: 'Administrative', 
      value: stats.administrative, 
      icon: BuildingOfficeIcon, 
      color: 'purple', 
      change: stats.administrative_percentage,
      changeText: `${stats.administrative_percentage >= 0 ? '+' : ''}${stats.administrative_percentage}% from last month`
    },
    { 
      label: 'Departments', 
      value: stats.departments, 
      icon: ChartBarIcon, 
      color: 'orange', 
      change: stats.departments_percentage,
      changeText: `${stats.departments_percentage >= 0 ? '+' : ''}${stats.departments_percentage}% from last month`
    }
  ];

  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <p className="text-xs text-green-600 mt-1">{stat.changeText}</p>
            </div>
            <div className={`h-12 w-12 rounded-xl ${colors[stat.color]} bg-opacity-10 flex items-center justify-center`}>
              <stat.icon className={`h-6 w-6 text-${stat.color}-500`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StaffStats;