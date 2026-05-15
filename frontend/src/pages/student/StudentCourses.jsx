import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  BookOpenIcon,
  AcademicCapIcon,
  ClockIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(1);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/student/classes');
        if (response.data.success) {
          setCourses(response.data.courses || []);
        }
      } catch (error) {
        console.error('Courses error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const toggleExpand = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
    setSelectedSemester(1);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getGradeBadge = (grade) => {
    if (!grade) return null;
    const map = {
      'A': 'bg-green-100 text-green-700',
      'B': 'bg-blue-100 text-blue-700',
      'C': 'bg-yellow-100 text-yellow-700',
      'D': 'bg-orange-100 text-orange-700',
      'F': 'bg-red-100 text-red-700',
    };
    return map[grade.toUpperCase()] || 'bg-gray-100 text-gray-700';
  };

  const getSubjectsForSemester = (course, semester) => {
    if (!course.subjects) return [];
    return course.subjects.filter(sub => sub.semester === semester);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-xl">
              <BookOpenIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Courses</h1>
          </div>
          <p className="text-gray-500 ml-12">View your enrolled courses and subject details by semester</p>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <AcademicCapIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">No courses enrolled</h3>
            <p className="text-gray-500 text-sm">You haven't registered for any courses yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course, idx) => {
              const subjectsSem1 = getSubjectsForSemester(course, 1);
              const subjectsSem2 = getSubjectsForSemester(course, 2);
              const currentSubjects = selectedSemester === 1 ? subjectsSem1 : subjectsSem2;

              return (
                <div
                  key={course.id}
                  className="course-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div
                    className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpand(course.id)}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          <AcademicCapIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-800 truncate">{course.name}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <ClockIcon className="h-3 w-3" />
                              {course.credits || 'N/A'} Credits
                            </span>
                            <span>{course.code || course.course_code || 'No code'}</span>
                            <span>{course.department || 'General'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {course.progress !== undefined && (
                          <div className="hidden sm:flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${getProgressColor(course.progress)}`}
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-600">{course.progress}%</span>
                          </div>
                        )}
                        {expandedCourse === course.id ? (
                          <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedCourse === course.id && (
                    <div className="border-t border-gray-100 bg-gray-50 p-5">
                      {(subjectsSem1.length > 0 || subjectsSem2.length > 0) && (
                        <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 pb-2">
                          <button
                            onClick={() => setSelectedSemester(1)}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              selectedSemester === 1
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <CalendarIcon className="h-4 w-4" />
                            Semester 1
                          </button>
                          <button
                            onClick={() => setSelectedSemester(2)}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              selectedSemester === 2
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <CalendarIcon className="h-4 w-4" />
                            Semester 2
                          </button>
                        </div>
                      )}

                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <ChartBarIcon className="h-4 w-4 text-blue-500" />
                        Subjects – Semester {selectedSemester}
                      </h4>

                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-white">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {currentSubjects.length > 0 ? (
                              currentSubjects.map((subject) => (
                                <tr key={subject.id} className="hover:bg-white transition-colors">
                                  <td className="px-4 py-2 text-sm text-gray-800">{subject.name}</td>
                                  <td className="px-4 py-2 text-sm text-gray-500 font-mono">{subject.code}</td>
                                  <td className="px-4 py-2 text-sm text-gray-500">{subject.credits}</td>
                                  <td className="px-4 py-2 text-sm font-medium">
                                    {subject.grade ? (
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getGradeBadge(subject.grade)}`}>
                                        {subject.grade}
                                      </span>
                                    ) : '-'}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                                    <span className="ml-1 text-xs text-gray-500">Active</span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="5" className="px-4 py-4 text-center text-sm text-gray-400">
                                  No subjects for Semester {selectedSemester}.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .fade-in-up { animation: fadeInUp 0.5s ease forwards; }
        .course-card { animation: slideRight 0.4s ease forwards; opacity: 0; animation-fill-mode: forwards; }
        .loading-spinner { width: 48px; height: 48px; border: 4px solid #e2e8f0; border-top: 4px solid #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @media (max-width: 640px) {
          .course-card { margin: 0 0.5rem; }
          table th, table td { padding-left: 0.75rem; padding-right: 0.75rem; }
        }
      `}</style>
    </div>
  );
};

export default StudentCourses;