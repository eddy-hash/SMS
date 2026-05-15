import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

const StudentForm = ({ isOpen, onClose, onSubmit, editingStudent }) => {
  const [formData, setFormData] = useState({
    full_name: '', email: '', phone: '', department_id: '', course_id: '',
    year_of_study: 1, address: '', guardian_name: '', guardian_phone: '', status: 'active'
  });
  
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (isOpen) fetchDepartments();
  }, [isOpen]);

  useEffect(() => {
    if (formData.department_id) {
      fetchCourses();
    } else {
      setCourses([]);
    }
  }, [formData.department_id]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments/list');
      const data = res.data.departments || res.data || [];
      setDepartments(data);
    } catch (err) { 
      console.error('Error fetching departments:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get(`/departments/${formData.department_id}/courses`);
      const courses = res.data.courses || [];
      setCourses(courses);
    } catch (err) { 
      console.error('Error fetching courses:', err);
      setCourses([]);
    }
  };

  useEffect(() => {
    if (editingStudent) {
      setFormData({
        full_name: editingStudent.full_name || '',
        email: editingStudent.email || '',
        phone: editingStudent.phone || '',
        department_id: editingStudent.department_id || '',
        course_id: editingStudent.course_id || '',
        year_of_study: editingStudent.year_of_study || 1,
        address: editingStudent.address || '',
        guardian_name: editingStudent.guardian_name || '',
        guardian_phone: editingStudent.guardian_phone || '',
        status: editingStudent.status || 'active'
      });
    } else {
      setFormData(prev => ({ 
        ...prev, 
        department_id: '', 
        course_id: '',
        full_name: '', email: '', phone: ''
      }));
      setCourses([]);
    }
  }, [editingStudent, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'department_id') {
      setFormData(prev => ({ ...prev, course_id: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.department_id || !formData.course_id) {
      alert('Please select department and course');
      return;
    }
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">
            {editingStudent ? 'Edit Student' : 'Register Student'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <input type="text" name="full_name" placeholder="Full Name *" required
            value={formData.full_name} onChange={handleChange}
            className="w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-300 focus:outline-none" />

          <div className="grid grid-cols-2 gap-3">
            <input type="email" name="email" placeholder="Email *" required
              value={formData.email} onChange={handleChange}
              className="px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-300 focus:outline-none" />
            <input type="tel" name="phone" placeholder="Phone *" required
              value={formData.phone} onChange={handleChange}
              className="px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-300 focus:outline-none" />
          </div>

          <select name="department_id" value={formData.department_id} onChange={handleChange} required
            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="">Select Department</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select name="course_id" value={formData.course_id} onChange={handleChange} required
            disabled={!formData.department_id}
            className="w-full px-3 py-2 text-sm border rounded-md disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="">
              {!formData.department_id ? 'Select department first' : 
               courses.length === 0 ? 'No courses available for this department' : 'Select Course'}
            </option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c.course_name} {c.course_code ? `(${c.course_code})` : ''}
              </option>
            ))}
          </select>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year <span className="text-red-500">*</span>
            </label>
            <select 
              name="year_of_study" 
              value={formData.year_of_study} 
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-300 focus:outline-none"
            >
              <option value="" disabled>Select Academic Year</option>
              {[1, 2, 3, 4].map(y => (
                <option key={y} value={y}>Year {y}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input type="text" name="guardian_name" placeholder="Guardian name"
              value={formData.guardian_name} onChange={handleChange}
              className="px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-300 focus:outline-none"/>
            <input type="tel" name="guardian_phone" placeholder="Guardian phone"
              value={formData.guardian_phone} onChange={handleChange}
              pattern="[0-9+\-\s]+"  
              title="Please enter a valid phone number"
              className="px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-300 focus:outline-none" />
          </div>

          <textarea name="address" placeholder="Address" rows="2"
            value={formData.address} onChange={handleChange}
            className="w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-300 resize-none focus:outline-none" />

          {editingStudent && (
            <select name="status" value={formData.status} onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          )}

          <div className="flex gap-3 pt-3">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 text-sm border rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading || !formData.course_id}
              className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Saving...' : (editingStudent ? 'Update' : 'Register')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;