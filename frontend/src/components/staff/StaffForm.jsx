import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

const StaffForm = ({ staff, onSubmit, onClose }) => {
  const isEditing = !!staff;
  const [departments, setDepartments] = useState([]);
  
  const [formData, setFormData] = useState({
    first_name: staff?.first_name || '',
    last_name: staff?.last_name || '',
    email: staff?.email || '',
    phone: staff?.phone || '',
    position: staff?.position || '',
    department_id: staff?.department_id || '',
    role: staff?.role || 'STAFF',
    hire_date: staff?.hire_date || '',
    qualification: staff?.qualification || '',
    address: staff?.address || '',
    is_active: staff?.is_active !== false
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments/list');
      setDepartments(response.data.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submitData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone || null,
      position: formData.position || null,
      department_id: formData.department_id ? parseInt(formData.department_id) : null,
      role: formData.role,
      hire_date: formData.hire_date || null,
      qualification: formData.qualification || null,
      address: formData.address || null,
      is_active: formData.is_active
    };
    
    onSubmit(submitData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Staff Member' : 'Add New Staff Member'}
            </h2>
            <button 
              onClick={onClose} 
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter first name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="last_name"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter last name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="staff@university.edu"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="+255 700 000 000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., Senior Lecturer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="STAFF">Staff</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="LECTURER">Lecturer</option>
                  <option value="HOD">Head of Department</option>
                  <option value="DEAN">Dean</option>
                  <option value="ADMIN">Administrator</option>
                  <option value="PRINCIPAL">Principal</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hire Date
                </label>
                <input
                  type="date"
                  name="hire_date"
                  value={formData.hire_date}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qualification
                </label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., PhD in Computer Science, Masters in Business Administration"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Full address"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Active Status</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-sm"
              >
                {isEditing ? 'Update Staff' : 'Add Staff'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StaffForm;