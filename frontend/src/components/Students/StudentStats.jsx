import React from 'react';
import { UserGroupIcon, AcademicCapIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const StudentStats = ({ stats }) => {
  const statCards = [
    { label: 'Total Students', value: stats.total, color: 'blue', icon: UserGroupIcon },
    { label: 'Active Students', value: stats.active, color: 'green', icon: AcademicCapIcon },
    { label: 'Departments', value: stats.departments, color: 'purple', icon: BuildingOfficeIcon },
    { label: 'Courses', value: stats.courses, color: 'orange', icon: AcademicCapIcon }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {statCards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{card.label}</p>
              <p className={`text-2xl font-bold text-${card.color}-600`}>{card.value}</p>
            </div>
            <card.icon className={`h-10 w-10 text-${card.color}-500 opacity-50`} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentStats;