import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  AcademicCapIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const StudentAssessments = () => {
  const [academicInfo, setAcademicInfo] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCourses, setExpandedCourses] = useState({});

  // Fetch academic years (same as results page)
  useEffect(() => {
    fetchAcademicInfo();
  }, []);

  useEffect(() => {
    if (selectedYear) fetchAssessments();
  }, [selectedYear, selectedSemester]);

  const fetchAcademicInfo = async () => {
    try {
      const response = await api.get('/results/academic-info');
      if (response.data) {
        setAcademicInfo(response.data);
        if (response.data.academic_years?.length) {
          setSelectedYear(response.data.academic_years[0]);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Could not load academic information.');
    }
  };

  const fetchAssessments = async () => {
    if (!selectedYear) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/results/assessments', {
        params: { academic_year: selectedYear, semester: selectedSemester },
      });
      if (response.data.success) {
        setCourses(response.data.courses || []);
        // Expand all courses by default (optional)
        const expanded = {};
        response.data.courses.forEach(c => { expanded[c.id] = true; });
        setExpandedCourses(expanded);
      } else {
        setError(response.data.message || 'No assessment data available.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to load assessments.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCourse = (courseId) => {
    setExpandedCourses(prev => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  const getGradeBadge = (grade) => {
    if (!grade) return 'bg-gray-100 text-gray-600';
    const map = {
      A: 'bg-green-100 text-green-700',
      B: 'bg-blue-100 text-blue-700',
      'B+': 'bg-blue-100 text-blue-700',
      C: 'bg-yellow-100 text-yellow-700',
      D: 'bg-orange-100 text-orange-700',
      F: 'bg-red-100 text-red-700',
    };
    return map[grade.toUpperCase()] || 'bg-gray-100 text-gray-700';
  };

  if (!academicInfo && !error) {
    return (
      <div className="flex justify-center items-center h-64">
        <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error && !academicInfo) {
    return (
      <div className="text-center py-12">
        <XCircleIcon className="h-16 w-16 text-red-300 mx-auto mb-3" />
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            My Assessments (Coursework)
          </h2>
          <p className="text-sm text-gray-500">Academic Year & Semester Tabs</p>
        </div>

        {/* Academic Years Tabs */}
        <div className="border-b border-gray-200 px-4 pt-2">
          <div className="flex flex-wrap gap-1">
            {academicInfo?.academic_years.map((year) => (
              <button
                key={year}
                onClick={() => {
                  setSelectedYear(year);
                  setSelectedSemester(1);
                }}
                className={`px-5 py-2 text-sm font-medium rounded-t-lg transition-all ${
                  selectedYear === year
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {/* Semester Tabs */}
        <div className="flex border-b border-gray-200 px-6 pt-2">
          <button
            onClick={() => setSelectedSemester(1)}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              selectedSemester === 1
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Semester One
          </button>
          <button
            onClick={() => setSelectedSemester(2)}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              selectedSemester === 2
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Semester Two
          </button>
        </div>

        {/* Assessments Tree */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <ArrowPathIcon className="h-10 w-10 text-blue-500 animate-spin" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                No assessments found for {selectedYear} – Semester {selectedSemester === 1 ? 'One' : 'Two'}.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Course Header (click to expand/collapse) */}
                  <button
                    onClick={() => toggleCourse(course.id)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {expandedCourses[course.id] ? (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                      )}
                      <AcademicCapIcon className="h-5 w-5 text-blue-600" />
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">{course.name}</p>
                        <p className="text-xs text-gray-500">{course.code}</p>
                      </div>
                    </div>
                  </button>

                  {/* Assessment Table (expanded) */}
                  {expandedCourses[course.id] && (
                    <div className="p-4 bg-white">
                      {course.assessments.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No assessments for this course.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assessment</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Max Marks</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Your Marks</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Grade</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Weight</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {course.assessments.map((ass) => (
                                <tr key={ass.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 text-sm text-gray-800">{ass.name}</td>
                                  <td className="px-4 py-2 text-sm text-gray-500 capitalize">{ass.type}</td>
                                  <td className="px-4 py-2 text-sm text-gray-600 text-center">{ass.max_marks}</td>
                                  <td className="px-4 py-2 text-sm font-semibold text-center">
                                    {ass.obtained_marks !== null ? ass.obtained_marks : '-'}
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    {ass.grade ? (
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getGradeBadge(ass.grade)}`}>
                                        {ass.grade}
                                      </span>
                                    ) : '-'}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-600 text-center">{ass.weight}%</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAssessments;