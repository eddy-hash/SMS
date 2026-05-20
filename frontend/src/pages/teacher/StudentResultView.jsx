// src/pages/teacher/StudentResultView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  PrinterIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';

const StudentResultView = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ cgpa: null, totalCredits: 0, totalCourses: 0 });

  useEffect(() => {
    if (studentId) {
      fetchStudentResults();
    } else {
      setLoading(false);
      setError('No student ID provided');
    }
  }, [studentId]);

  const fetchStudentResults = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/teacher/results/student/${studentId}`);
      
      if (response.data && response.data.success) {
        setResults(response.data.results || []);
        setSummary({
          cgpa: response.data.cgpa,
          totalCredits: response.data.total_credits || 0,
          totalCourses: response.data.total_courses || 0
        });
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.detail || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const getGrade = (marks) => {
    if (!marks && marks !== 0) return '-';
    if (marks >= 90) return 'A+';
    if (marks >= 80) return 'A';
    if (marks >= 75) return 'A-';
    if (marks >= 70) return 'B+';
    if (marks >= 65) return 'B';
    if (marks >= 60) return 'B-';
    if (marks >= 55) return 'C+';
    if (marks >= 50) return 'C';
    if (marks >= 45) return 'C-';
    if (marks >= 40) return 'D';
    return 'F';
  };

  const getGradeColor = (grade) => {
    if (grade === 'F') return 'bg-red-100 text-red-700';
    if (grade?.startsWith('D')) return 'bg-orange-100 text-orange-700';
    if (grade?.startsWith('C')) return 'bg-yellow-100 text-yellow-700';
    if (grade?.startsWith('B')) return 'bg-blue-100 text-blue-700';
    if (grade?.startsWith('A')) return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mx-auto mb-3" />
        <p className="text-gray-700 font-medium mb-2">{error}</p>
        <button 
          onClick={() => navigate('/teacher/students')} 
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Back to Students
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => navigate('/teacher/students')}
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Students
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Student Results</h1>
          <p className="text-gray-500 mt-1">Student ID: {studentId}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Total Courses</p>
          <p className="text-2xl font-bold text-gray-800">{summary.totalCourses}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Total Credits</p>
          <p className="text-2xl font-bold text-gray-800">{summary.totalCredits}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">CGPA</p>
          <p className="text-2xl font-bold text-emerald-600">{summary.cgpa || 'N/A'}</p>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <td>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
              </td>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {results.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No results available for this student</p>
                    <p className="text-sm mt-1">Results will appear here once uploaded</p>
                  </td>
                </tr>
              ) : (
                results.map((result, index) => {
                  const grade = getGrade(result.marks);
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono text-gray-700">{result.course_code}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{result.course_name}</td>
                      <td className="px-6 py-4 text-sm font-semibold">{result.marks}%</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getGradeColor(grade)}`}>
                          {grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{result.credits || 3}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentResultView;