import React, { useState, useEffect } from 'react';
import api from '../../services/api';

import {
  BookOpenIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const TeacherCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses/list');

      console.log('Courses Response:', response.data);

      setCourses(response.data || []);

    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);

    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // LOADING STATE
  // =========================================
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div>

      {/* ========================================= */}
      {/* HEADER */}
      {/* ========================================= */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
          <BookOpenIcon className="h-6 w-6 text-blue-600" />
          My Courses
        </h2>

        <p className="text-sm text-gray-500 mt-2">
          Courses related to your department
        </p>
      </div>

      {/* ========================================= */}
      {/* EMPTY STATE */}
      {/* ========================================= */}
      {courses.length === 0 ? (

        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-500 text-lg">
            No courses found
          </p>
        </div>

      ) : (

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">

          {/* ========================================= */}
          {/* TABLE */}
          {/* ========================================= */}
          <div className="overflow-x-auto">

            <table className="min-w-full divide-y divide-gray-200">

              {/* ========================================= */}
              {/* TABLE HEADER */}
              {/* ========================================= */}
              <thead className="bg-gray-50">
                <tr>

                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    #
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Course ID
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Course Name
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Department
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Department ID
                  </th>

                </tr>
              </thead>

              {/* ========================================= */}
              {/* TABLE BODY */}
              {/* ========================================= */}
              <tbody className="bg-white divide-y divide-gray-100">

                {courses.map((course, index) => (

                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >

                    {/* NUMBER */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {index + 1}
                    </td>

                    {/* EMAIL */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      {course.email}
                    </td>

                    {/* GENDER */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {course.gender}
                    </td>

                    {/* COURSE ID */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {course.course_id}
                    </td>

                    {/* COURSE NAME */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {course.course_name}
                    </td>

                    {/* DEPARTMENT */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {course.department_name}
                    </td>

                    {/* DEPARTMENT ID */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {course.department_id}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>
  );
};

export default TeacherCourses;
