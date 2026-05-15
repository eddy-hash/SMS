import React from 'react';
import { ChevronDownIcon, ChevronRightIcon, PencilIcon, TrashIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import CourseTable from './CourseTable';


const DepartmentCard = ({ department, isExpanded, onToggle, onEdit, onDelete }) => {
  // Get department name from the correct database field
  const departmentName = department.department_name || department.name || 'Unnamed Department';
  const departmentCode = department.code || `ID: ${department.id}`;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
      {/* Department Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDownIcon className="w-5 h-5 text-blue-500" />
          ) : (
            <ChevronRightIcon className="w-5 h-5 text-blue-500" />
          )}
          <div className="flex items-center gap-2">
            <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{departmentName}</h3>
              <p className="text-sm text-gray-500">{departmentCode}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 mr-4">
            📚 {department.courses?.length || 0} Courses
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(department); }}
            className="text-blue-600 hover:text-blue-800 p-1 transition-colors"
            title="Edit Department"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(department); }}
            className="text-red-600 hover:text-red-800 p-1 transition-colors"
            title="Delete Department"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Department Courses (Expandable) */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          <CourseTable courses={department.courses} departmentName={departmentName} />
        </div>
      )}
    </div>
  );
};

export default DepartmentCard;
