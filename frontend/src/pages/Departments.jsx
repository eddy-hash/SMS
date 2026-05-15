import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  BookOpenIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Loader from '../components/departments/Loader';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDept, setExpandedDept] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  // Keep original structure to avoid breaking UI
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });

  const colorPatterns = [
    'bg-blue-50 hover:bg-blue-100',
    'bg-green-50 hover:bg-green-100',
    'bg-purple-50 hover:bg-purple-100',
    'bg-yellow-50 hover:bg-yellow-100',
    'bg-pink-50 hover:bg-pink-100',
    'bg-indigo-50 hover:bg-indigo-100'
  ];

  const courseColorPatterns = [
    'bg-blue-100 border-blue-200',
    'bg-green-100 border-green-200',
    'bg-purple-100 border-purple-200',
    'bg-yellow-100 border-yellow-200',
    'bg-pink-100 border-pink-200',
    'bg-indigo-100 border-indigo-200'
  ];

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get('/departments/list');

      const departmentsData = response.data?.departments || [];

      setDepartments(
        departmentsData.map((dept) => ({
          ...dept,
          code: dept.code || '',
          description: dept.description || '',
          courses: dept.courses || null,
        }))
      );
    } catch (error) {
      console.error(error);
      toast.error('Failed to load departments');
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDepartmentCourses = useCallback(async (deptId) => {
    try {
      const response = await api.get(`/departments/${deptId}/courses`);
      return response.data?.courses || [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }, []);

  const toggleDepartment = async (deptId) => {
    if (expandedDept === deptId) {
      setExpandedDept(null);
      return;
    }

    setExpandedDept(deptId);

    const dept = departments.find((d) => d.id === deptId);

    if (dept && dept.courses === null) {
      const courses = await fetchDepartmentCourses(deptId);

      setDepartments((prev) =>
        prev.map((d) =>
          d.id === deptId
            ? {
                ...d,
                courses,
              }
            : d
        )
      );
    }
  };

  const handleOpenModal = (dept = null) => {
    setEditingDept(dept);

    setFormData(
      dept
        ? {
            name: dept.name || '',
            code: dept.code || '',
            description: dept.description || '',
          }
        : {
            name: '',
            code: '',
            description: '',
          }
    );

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDept(null);

    setFormData({
      name: '',
      code: '',
      description: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Department name is required');
      return;
    }

    try {
      const payload = {
        department_name: formData.name,
      };

      if (editingDept) {
        await api.put(`/departments/${editingDept.id}`, payload);
        toast.success('Department updated successfully');
      } else {
        await api.post('/departments/create', payload);
        toast.success('Department created successfully');
      }

      handleCloseModal();
      fetchDepartments();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.detail || 'Failed to save department'
      );
    }
  };

  const handleDelete = async (dept) => {
    const confirmed = window.confirm(
      `Delete "${dept.name}"?\n\nThis will remove all associated courses.`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/departments/${dept.id}`);

      toast.success('Department deleted successfully');

      fetchDepartments();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete department');
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Department Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Total Departments:{' '}
            <span className="font-semibold text-blue-600">
              {departments.length}
            </span>
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-white transition-all hover:from-blue-700 hover:to-purple-700"
        >
          <PlusIcon className="h-5 w-5" />
          Add Department
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr className="border-b border-gray-300">
                <th className="border-r border-gray-300 px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Department Name
                </th>

                <th className="border-r border-gray-300 px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Code
                </th>

                <th className="border-r border-gray-300 px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Description
                </th>

                <th className="border-r border-gray-300 px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Courses
                </th>

                <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {departments.map((dept, idx) => (
                <React.Fragment key={dept.id}>
                  <tr
                    className={`transition-all duration-200 ${
                      colorPatterns[idx % colorPatterns.length]
                    }`}
                  >
                    {/* Name */}
                    <td className="border-r border-gray-100 px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleDepartment(dept.id)}
                          className="text-gray-500 transition-colors hover:text-blue-600"
                        >
                          {expandedDept === dept.id ? (
                            <ChevronDownIcon className="h-5 w-5" />
                          ) : (
                            <ChevronRightIcon className="h-5 w-5" />
                          )}
                        </button>

                        <span className="text-sm font-semibold text-gray-900">
                          {dept.name}
                        </span>
                      </div>
                    </td>

                    {/* Code */}
                    <td className="border-r border-gray-100 px-6 py-4 text-sm font-mono text-gray-600">
                      {dept.code || 'N/A'}
                    </td>

                    {/* Description */}
                    <td className="max-w-xs truncate border-r border-gray-100 px-6 py-4 text-sm text-gray-600">
                      {dept.description || 'No description'}
                    </td>

                    {/* Courses */}
                    <td className="border-r border-gray-100 px-6 py-4">
                      <button
                        onClick={() => toggleDepartment(dept.id)}
                        className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-200"
                      >
                        <BookOpenIcon className="h-3 w-3" />

                        {dept.courses
                          ? `${dept.courses.length} courses`
                          : 'View courses'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(dept)}
                          className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-green-50 hover:text-green-600"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(dept)}
                          className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Courses */}
                  {expandedDept === dept.id && (
                    <tr className="bg-gray-50">
                      <td colSpan="5" className="px-6 py-4">
                        <div className="ml-8">
                          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <BookOpenIcon className="h-4 w-4 text-blue-600" />
                            Courses in {dept.name}
                          </h4>

                          {dept.courses?.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                              {dept.courses.map((course, courseIdx) => (
                                <div
                                  key={course.id}
                                  className={`rounded-lg border p-3 shadow-sm transition-all hover:shadow-md ${
                                    courseColorPatterns[
                                      courseIdx %
                                        courseColorPatterns.length
                                    ]
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-blue-500" />

                                    <div className="flex-1">
                                      <p className="text-sm font-semibold text-gray-700">
                                        {course.course_code}
                                      </p>

                                      <p className="text-sm text-gray-600">
                                        {course.course_name}
                                      </p>
                                    </div>

                                    <span className="rounded bg-white/50 px-2 py-1 text-xs text-gray-500">
                                      {course.credits} Credits
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="py-4 text-center text-sm text-gray-500">
                              No courses found in this department.
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {departments.length === 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <p className="text-gray-500">No departments found.</p>

          <p className="mt-1 text-sm text-gray-400">
            Click "Add Department" to create one.
          </p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={handleCloseModal}
            />

            <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b p-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingDept ? 'Edit Department' : 'Add Department'}
                </h2>

                <button
                  onClick={handleCloseModal}
                  className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-6">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                  autoFocus
                  placeholder="Department Name *"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      code: e.target.value,
                    }))
                  }
                  placeholder="Department Code"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />

                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Department Description"
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-purple-700"
                  >
                    {editingDept ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Departments;