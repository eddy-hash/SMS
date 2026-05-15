
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/outline';
import DepartmentCard from './DepartmentCard';
import DepartmentModal from './DepartmentModal';
import Loader from './Loader';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDept, setExpandedDept] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentCourses = async (deptId) => {
    try {
      const response = await api.get(`/departments/${deptId}/courses`);
      return response.data.courses || [];
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  };

  const toggleDepartment = async (deptId) => {
    if (expandedDept === deptId) {
      setExpandedDept(null);
    } else {
      setExpandedDept(deptId);
      const dept = departments.find(d => d.id === deptId);
      if (dept && !dept.courses) {
        const courses = await fetchDepartmentCourses(deptId);
        setDepartments(prev => prev.map(d => 
          d.id === deptId ? { ...d, courses } : d
        ));
      }
    }
  };

  const handleOpenModal = (dept = null) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({
        name: dept.name,
        code: dept.code,
        description: dept.description || ''
      });
    } else {
      setEditingDept(null);
      setFormData({
        name: '',
        code: '',
        description: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDept(null);
    setFormData({ name: '', code: '', description: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await api.put(`/departments/${editingDept.id}`, formData);
        toast.success('Department updated successfully');
      } else {
        await api.post('/departments/create', formData);
        toast.success('Department created successfully');
      }
      handleCloseModal();
      fetchDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
      toast.error(error.response?.data?.detail || 'Failed to save department');
    }
  };

  const handleDelete = async (dept) => {
    if (window.confirm(`Are you sure you want to delete "${dept.name}"? This will also remove all associated courses.`)) {
      try {
        await api.delete(`/departments/${dept.id}`);
        toast.success('Department deleted successfully');
        fetchDepartments();
      } catch (error) {
        console.error('Error deleting department:', error);
        toast.error(error.response?.data?.detail || 'Failed to delete department');
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Department Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Total Departments: {departments.length}
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5" />
          Add Department
        </button>
      </div>

      <div className="space-y-4">
        {departments.map((dept) => (
          <DepartmentCard
            key={dept.id}
            department={dept}
            isExpanded={expandedDept === dept.id}
            onToggle={() => toggleDepartment(dept.id)}
            onEdit={handleOpenModal}
            onDelete={handleDelete}
          />
        ))}

        {departments.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-400">No departments found. Click "Add Department" to create one.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <DepartmentModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingDept={editingDept}
        formData={formData}
        onChange={handleInputChange}
      />
    </div>
  );
};

export default Departments;