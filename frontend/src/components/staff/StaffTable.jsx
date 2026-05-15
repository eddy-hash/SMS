import React, { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, EyeIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../common/ConfirmationModal';
import api from '../../services/api';

const StaffTable = ({ staff, onEdit, onDelete, onView, isAdmin }) => {
  const [showConfirm, setShowConfirm] = useState(null);
  const [sortField, setSortField] = useState('full_name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [departments, setDepartments] = useState({});
  const [loading, setLoading] = useState(false);

  const colorPatterns = [
    'bg-blue-100 hover:bg-blue-200',
    'bg-blue-50 hover:bg-blue-100',
    'bg-indigo-100 hover:bg-indigo-200',
    'bg-indigo-50 hover:bg-indigo-100',
    'bg-cyan-100 hover:bg-cyan-200',
    'bg-cyan-50 hover:bg-cyan-100',
  ];

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments/list');
      const deptList = response.data.departments || [];
      const deptMap = {};
      deptList.forEach(dept => {
        deptMap[dept.id] = dept.name;
      });
      setDepartments(deptMap);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedStaff = [...staff].sort((a, b) => {
    let aVal = a[sortField] || '';
    let bVal = b[sortField] || '';
    
    if (sortField === 'full_name') {
      aVal = a.full_name || a.name || '';
      bVal = b.full_name || b.name || '';
    }
    if (sortField === 'staff_code') {
      aVal = a.staff_code || a.staff_id || '';
      bVal = b.staff_code || b.staff_id || '';
    }
    if (sortField === 'department') {
      aVal = departments[a.department_id] || a.department || '';
      bVal = departments[b.department_id] || b.department || '';
    }
    
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  const getDepartmentName = (member) => {
    if (member.department_name && member.department_name !== 'General Administration') {
      return member.department_name;
    }
    if (member.department && member.department !== 'General Administration') {
      return member.department;
    }
    if (member.department_id && departments[member.department_id]) {
      return departments[member.department_id];
    }
    return 'Not Assigned';
  };

  const getRoleBadge = (role) => {
    const roles = {
      admin: { color: 'bg-purple-700 text-white', label: 'Administrator' },
      teacher: { color: 'bg-blue-600 text-white', label: 'Teacher' },
      staff: { color: 'bg-gray-600 text-white', label: 'Staff' },
      hod: { color: 'bg-green-600 text-white', label: 'Head of Department' },
      dean: { color: 'bg-yellow-600 text-white', label: 'Dean' },
      principal: { color: 'bg-red-600 text-white', label: 'Principal' },
      bursar: { color: 'bg-pink-600 text-white', label: 'Bursar' },
      ADMIN: { color: 'bg-purple-700 text-white', label: 'Administrator' },
      TEACHER: { color: 'bg-blue-600 text-white', label: 'Teacher' },
      STAFF: { color: 'bg-gray-600 text-white', label: 'Staff' },
      HOD: { color: 'bg-green-600 text-white', label: 'Head of Department' },
      DEAN: { color: 'bg-yellow-600 text-white', label: 'Dean' },
      PRINCIPAL: { color: 'bg-red-600 text-white', label: 'Principal' },
      BURSAR: { color: 'bg-pink-600 text-white', label: 'Bursar' },
      BUR: { color: 'bg-pink-600 text-white', label: 'Bursar' },
      LECTURER: { color: 'bg-cyan-600 text-white', label: 'Lecturer' },
      TCH: { color: 'bg-blue-600 text-white', label: 'Teacher' },
      LEC: { color: 'bg-cyan-600 text-white', label: 'Lecturer' },
      ADM: { color: 'bg-purple-700 text-white', label: 'Administrator' },
      PRN: { color: 'bg-red-600 text-white', label: 'Principal' }
    };
    return roles[role] || { color: 'bg-gray-600 text-white', label: role || 'Staff' };
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <ChevronDownIcon className="h-4 w-4 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUpIcon className="h-4 w-4 text-blue-600" /> 
      : <ChevronDownIcon className="h-4 w-4 text-blue-600" />;
  };

  const handleView = async (member) => {
    setLoading(true);
    try {
      const response = await api.get(`/staff/${member.id}`);
      const freshData = response.data;
      
      if (freshData.department_id && departments[freshData.department_id]) {
        freshData.department_name = departments[freshData.department_id];
      }
      
      onView(freshData);
    } catch (error) {
      console.error('Error fetching staff details:', error);
      const fallbackData = {
        ...member,
        department_name: getDepartmentName(member)
      };
      onView(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (member) => {
    setLoading(true);
    try {
      const response = await api.get(`/staff/${member.id}`);
      onEdit(response.data);
    } catch (error) {
      console.error('Error fetching staff for edit:', error);
      onEdit(member);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (member) => {
    setShowConfirm(member);
  };

  const handleConfirmDelete = async () => {
    if (!showConfirm) return;
    
    setLoading(true);
    try {
      await api.delete(`/staff/${showConfirm.id}`);
      onDelete(showConfirm.id, showConfirm.full_name || showConfirm.name);
      setShowConfirm(null);
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert(error.response?.data?.detail || 'Failed to delete staff member');
    } finally {
      setLoading(false);
    }
  };

  if (!staff || staff.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 text-center">
        <div className="text-gray-400">
          <p className="text-lg font-medium">No staff members found</p>
          <p className="text-sm mt-1">Click "Add Staff" to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-blue-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-blue-200">
            <thead className="bg-blue-900">
              <tr className="border-b border-blue-800">
                <th 
                  onClick={() => handleSort('staff_code')} 
                  className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:text-blue-200 border-r border-blue-700"
                >
                  <div className="flex items-center gap-1">
                    Staff ID 
                    <SortIcon field="staff_code" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('full_name')} 
                  className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:text-blue-200 border-r border-blue-700"
                >
                  <div className="flex items-center gap-1">
                    Name 
                    <SortIcon field="full_name" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-blue-700">
                  Position
                </th>
                <th 
                  onClick={() => handleSort('department')} 
                  className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:text-blue-200 border-r border-blue-700"
                >
                  <div className="flex items-center gap-1">
                    Department 
                    <SortIcon field="department" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-blue-700">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-blue-700">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              {sortedStaff.map((member, index) => (
                <tr 
                  key={member.id} 
                  className={`${colorPatterns[index % colorPatterns.length]} transition-all duration-200`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-blue-900 border-r border-blue-200">
                    {member.staff_code || `EAU/STAFF/${String(member.id).padStart(4, '0')}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-r border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                        {(member.full_name || member.first_name || 'S').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-blue-900">
                          {member.full_name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'N/A'}
                        </div>
                        <div className="text-xs text-blue-600">{member.email || 'No email'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-800 font-medium border-r border-blue-200">
                    {member.position || 'Not Specified'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-800 font-medium border-r border-blue-200">
                    {getDepartmentName(member)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-r border-blue-200">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getRoleBadge(member.role).color}`}>
                      {getRoleBadge(member.role).label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-r border-blue-200">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${member.is_active === 1 || member.is_active === true ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {member.is_active === 1 || member.is_active === true ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleView(member)} 
                        disabled={loading}
                        className="p-1.5 rounded-lg text-blue-400 hover:text-blue-700 hover:bg-blue-100 transition-all disabled:opacity-50" 
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {isAdmin && (
                        <>
                          <button 
                            onClick={() => handleEdit(member)} 
                            disabled={loading}
                            className="p-1.5 rounded-lg text-blue-400 hover:text-green-600 hover:bg-green-100 transition-all disabled:opacity-50" 
                            title="Edit Staff"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(member)} 
                            disabled={loading}
                            className="p-1.5 rounded-lg text-blue-400 hover:text-red-600 hover:bg-red-100 transition-all disabled:opacity-50" 
                            title="Delete Staff"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Processing...</span>
          </div>
        </div>
      )}
      
      {showConfirm && (
        <ConfirmationModal
          isOpen={!!showConfirm}
          onClose={() => setShowConfirm(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Staff Member"
          message={`Are you sure you want to delete "${showConfirm.full_name || showConfirm.name}"? This action cannot be undone.`}
          confirmText="Delete"
          type="danger"
        />
      )}
    </>
  );
};

export default StaffTable;