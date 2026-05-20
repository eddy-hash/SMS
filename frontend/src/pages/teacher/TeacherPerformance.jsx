import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TeacherPerformance = () => {
  const { user } = useAuth();
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchPerformance();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      // Use the available courses/list endpoint
      const response = await api.get('/courses/list');
      setCourses(response.data.courses || []);
      if (response.data.courses?.length > 0) {
        setSelectedCourse(response.data.courses[0].id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
      setCourses([]);
      setLoading(false);
    }
  };

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/teacher/results/course/${selectedCourse}`);
      setPerformance(response.data);
    } catch (error) {
      console.error('Failed to load performance:', error);
      setPerformance({
        average_marks: 0,
        pass_rate: 0,
        highest_score: 0,
        lowest_score: 0,
        grade_distribution: { A: 0, B: 0, C: 0, D: 0, F: 0 },
        top_performers: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Class Performance</h1>
        <p className="text-gray-600 mt-1">Track and analyze student academic performance</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 w-full md:w-64"
        >
          {courses.length === 0 ? (
            <option value="">No courses available</option>
          ) : (
            courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.course_code} - {course.course_name}
              </option>
            ))
          )}
        </select>
      </div>

      {courses.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-700">No courses assigned to you yet.</p>
          <p className="text-sm text-yellow-600 mt-1">Contact your department head for course allocation.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Average Marks</p>
                  <p className="text-2xl font-bold text-gray-800">{performance?.average_marks || 0}%</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pass Rate</p>
                  <p className="text-2xl font-bold text-green-600">{performance?.pass_rate || 0}%</p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <AcademicCapIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Highest Score</p>
                  <p className="text-2xl font-bold text-purple-600">{performance?.highest_score || 0}%</p>
                </div>
                <div className="p-3 rounded-full bg-purple-100">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Lowest Score</p>
                  <p className="text-2xl font-bold text-orange-600">{performance?.lowest_score || 0}%</p>
                </div>
                <div className="p-3 rounded-full bg-orange-100">
                  <ArrowTrendingDownIcon className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Grade Distribution</h3>
              <div className="space-y-3">
                {Object.entries(performance?.grade_distribution || {}).map(([grade, count]) => (
                  <div key={grade}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Grade {grade}</span>
                      <span className="text-gray-500">{count} students</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`rounded-full h-2 ${
                          grade === 'A' ? 'bg-green-500' :
                          grade === 'B' ? 'bg-blue-500' :
                          grade === 'C' ? 'bg-yellow-500' :
                          grade === 'D' ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(count / (performance?.total_students || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Top Performers</h3>
              <div className="space-y-3">
                {performance?.top_performers?.map((student, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.registration_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">{student.marks}%</p>
                      <p className="text-xs text-gray-500">{student.grade}</p>
                    </div>
                  </div>
                ))}
                {(!performance?.top_performers || performance.top_performers.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No data available</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TeacherPerformance;