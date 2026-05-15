import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

const Loader = () => (
  <div className="flex justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const colorPatterns = [
  'from-blue-500 to-blue-600',
  'from-green-500 to-green-600',
  'from-purple-500 to-purple-600',
  'from-yellow-500 to-yellow-600',
  'from-pink-500 to-pink-600',
  'from-indigo-500 to-indigo-600',
  'from-red-500 to-red-600',
  'from-teal-500 to-teal-600',
];

const getDepartmentColor = (index) => colorPatterns[index % colorPatterns.length];

const Courses = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    credits: 3,
    department_id: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments/list');
      const depts = response.data.departments || [];
      
      const deptsWithCourses = await Promise.all(
        depts.map(async (dept) => {
          const coursesRes = await api.get(`/departments/${dept.id}/courses`);
          return { ...dept, courses: coursesRes.data.courses || [] };
        })
      );
      
      setDepartments(deptsWithCourses);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const saveCourse = async () => {
    try {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse.id}`, formData);
        toast.success('Course updated successfully');
      } else {
        await api.post('/courses/create', formData);
        toast.success('Course created successfully');
      }
      closeModal();
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error saving course');
    }
  };

  const deleteCourse = async (course) => {
    if (!window.confirm(`Delete "${course.course_name}"?`)) return;
    try {
      await api.delete(`/courses/${course.id}`);
      toast.success('Course deleted successfully');
      fetchDepartments();
    } catch {
      toast.error('Delete failed');
    }
  };

  const openModal = (dept = null, course = null) => {
    setSelectedDept(dept);
    setEditingCourse(course);
    setFormData({
      course_code: course?.course_code || '',
      course_name: course?.course_name || '',
      credits: course?.credits || 3,
      department_id: dept?.id || course?.department_id || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCourse(null);
    setSelectedDept(null);
    setFormData({
      course_code: '',
      course_name: '',
      credits: 3,
      department_id: ''
    });
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Course Management</h1>
        <p className="text-sm text-gray-500 mt-1">Courses organized by department</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept, idx) => (
          <div key={dept.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className={`bg-gradient-to-r ${getDepartmentColor(idx)} p-4 text-white`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <BuildingOfficeIcon className="h-6 w-6" />
                  <div>
                    <h3 className="font-bold text-lg">{dept.name}</h3>
                    <p className="text-xs opacity-90">{dept.courses?.length || 0} courses</p>
                  </div>
                </div>
                <button
                  onClick={() => openModal(dept, null)}
                  className="bg-white/20 hover:bg-white/30 rounded-lg p-1.5 transition-all"
                  title="Add Course"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              {dept.courses?.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <BookOpenIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No courses yet</p>
                  <button
                    onClick={() => openModal(dept, null)}
                    className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add first course
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {dept.courses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                              {course.course_code}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                              {course.credits} credits
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-800">{course.course_name}</p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => openModal(dept, course)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-100 transition-all"
                            title="Edit"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteCourse(course)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-100 transition-all"
                            title="Delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
              <p className="text-xs text-gray-400 text-center">
                {dept.courses?.length || 0} course{dept.courses?.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        ))}

        {departments.length === 0 && (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <BuildingOfficeIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-400">No departments found</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingCourse ? 'Edit Course' : 'Add Course'}
            </h2>
            {!editingCourse && selectedDept && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  Department: <span className="font-semibold">{selectedDept.name}</span>
                </p>
              </div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); saveCourse(); }} className="space-y-4">
              <input
                name="course_code"
                value={formData.course_code}
                onChange={handleChange}
                placeholder="Course Code *"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                name="course_name"
                value={formData.course_name}
                onChange={handleChange}
                placeholder="Course Name *"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="number"
                name="credits"
                value={formData.credits}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min={1}
                max={6}
                placeholder="Credits"
              />
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={closeModal} type="button" className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;