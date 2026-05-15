import React from 'react';
import { XMarkIcon, EnvelopeIcon, PhoneIcon, CalendarIcon, BuildingOfficeIcon, AcademicCapIcon, MapPinIcon } from '@heroicons/react/24/outline';

const StaffViewModal = ({ staff, onClose, departments }) => {
  if (!staff) return null;

  // Get department name from department_id
  const getDepartmentName = () => {
    if (staff.department_name) return staff.department_name;
    if (staff.department) return staff.department;
    if (staff.department_id && departments && departments.length > 0) {
      const dept = departments.find(d => d.id === staff.department_id);
      if (dept) return dept.department_name || dept.name;
    }
    // Direct mapping for known department IDs
    const deptMap = {
      1: 'Department of Engineering',
      2: 'Department of Information and Communication Technology',
      3: 'Department of Education',
      4: 'Department of Business Studies',
      5: 'Department of Health Sciences',
      6: 'Department of Agriculture',
      7: 'Department of Law',
      8: 'Department of Humanities and Social Sciences',
      12: 'Department of Medicine'
    };
    return deptMap[staff.department_id] || 'Not Assigned';
  };

  // Format date properly
  const formatDate = (date) => {
    if (!date) return 'Not set';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get staff code
  const getStaffCode = () => {
    return staff.staff_code || staff.staff_id || `EAU/STAFF/${String(staff.id).padStart(4, '0')}`;
  };

  // Get role badge color
  const getRoleBadge = () => {
    const role = staff.role || 'STAFF';
    const roles = {
      ADMIN: 'bg-purple-100 text-purple-800',
      TEACHER: 'bg-blue-100 text-blue-800',
      STAFF: 'bg-gray-100 text-gray-800',
      HOD: 'bg-green-100 text-green-800',
      DEAN: 'bg-yellow-100 text-yellow-800',
      PRINCIPAL: 'bg-red-100 text-red-800',
      LECTURER: 'bg-cyan-100 text-cyan-800'
    };
    return roles[role] || roles.STAFF;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl">
          <button onClick={onClose} className="absolute right-4 top-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <XMarkIcon className="h-5 w-5" />
          </button>
          
          <div className="p-6">
            {/* Header with Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {(staff.full_name || staff.first_name || staff.name || 'S').charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {staff.full_name || `${staff.first_name || ''} ${staff.last_name || ''}`.trim() || staff.name}
                </h2>
                <p className="text-gray-500">{staff.position || 'Staff Member'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-400 font-mono">{getStaffCode()}</p>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getRoleBadge()}`}>
                    {staff.role || 'STAFF'}
                  </span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium">{staff.email || 'Not provided'}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium">{staff.phone || 'Not provided'}</p>
                </div>
              </div>

              {/* Department - FIXED */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="text-sm font-medium text-gray-900">
                    {getDepartmentName()}
                  </p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="text-sm font-medium">{staff.role || 'STAFF'}</p>
                </div>
              </div>

              {/* Position */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Position</p>
                  <p className="text-sm font-medium">{staff.position || 'Not specified'}</p>
                </div>
              </div>

              {/* Joined Date - FIXED */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Joined</p>
                  <p className="text-sm font-medium">
                    {formatDate(staff.hire_date || staff.joining_date)}
                  </p>
                </div>
              </div>

              {/* Qualification */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Qualification</p>
                  <p className="text-sm font-medium">{staff.qualification || 'Not specified'}</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="h-5 w-5" />
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="text-sm font-medium">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${staff.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {staff.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Address - Full Width */}
              <div className="md:col-span-2 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm font-medium">{staff.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffViewModal;