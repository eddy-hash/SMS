import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

const StudentResults = () => {
  const [academicInfo, setAcademicInfo] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ gpa: null, totalCredits: 0 });

  useEffect(() => {
    fetchAcademicInfo();
  }, []);

  useEffect(() => {
    if (selectedYear) fetchResults();
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
      console.error('Failed to load academic info:', err);
      setError('Could not load academic information. Please try again later.');
    }
  };

  const fetchResults = async () => {
    if (!selectedYear) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/results/semester-results', {
        params: { academic_year: selectedYear, semester: selectedSemester },
      });
      if (response.data.success) {
        setResults(response.data.results || []);
        setSummary({
          gpa: response.data.gpa || null,
          totalCredits: response.data.total_credits || 0,
        });
      } else {
        setError(response.data.message || 'No results available');
      }
    } catch (err) {
      console.error('Results error:', err);
      setError(err.response?.data?.detail || 'Failed to load results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getGradeBadge = (grade) => {
    if (!grade) return '';
    const map = {
      A: 'bg-green-100 text-green-700',
      B: 'bg-blue-100 text-blue-700',
      'B+': 'bg-blue-100 text-blue-700',
      C: 'bg-yellow-100 text-yellow-700',
      D: 'bg-orange-100 text-orange-700',
      F: 'bg-red-100 text-red-700',
    };
    const normalized = grade.toUpperCase().replace('+', 'plus');
    return map[normalized] || 'bg-gray-100 text-gray-700';
  };

  const calculateSemesterGPA = () => {
    if (summary.gpa) return summary.gpa.toFixed(2);
    if (results.length === 0) return null;
    let totalPoints = 0;
    let totalCredits = 0;
    results.forEach((sub) => {
      const gradePoints = {
        A: 4.0,
        B: 3.0,
        'B+': 3.3,
        C: 2.0,
        D: 1.0,
        F: 0.0,
      }[sub.grade?.toUpperCase().replace('+', 'plus')] || 0;
      totalPoints += gradePoints * (sub.credits || 3);
      totalCredits += sub.credits || 3;
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : null;
  };

  const semesterGPA = calculateSemesterGPA();

  const getRemarks = (grade) => {
    if (!grade) return 'Pending';
    const g = grade.toUpperCase();
    if (g === 'F') return 'Fail';
    if (['A', 'B', 'B+', 'C', 'D'].includes(g)) return 'Pass';
    return 'In Progress';
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
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header with program info */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4">
          <div className="flex items-center gap-2 mb-1">
            <AcademicCapIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">
              Academic Results
            </h2>
          </div>
          <p className="text-sm text-gray-500">
            Intake Year: {academicInfo?.intake_year} | {' '}
            Current Year of Study: {academicInfo?.current_year} of {academicInfo?.duration}
          </p>
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

        {/* Semester Tabs (inside selected year) */}
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-500">Total Credits</p>
            <p className="text-xl font-bold text-gray-800">{summary.totalCredits}</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-500">Total Grade Points</p>
            <p className="text-xl font-bold text-gray-800">--</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-500">GPA</p>
            <p className="text-xl font-bold text-blue-600">{semesterGPA || '--'}</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-500">Remarks</p>
            <p className="text-xl font-bold text-green-600">
              {semesterGPA ? (parseFloat(semesterGPA) >= 2.0 ? 'Good Standing' : 'Probation') : '--'}
            </p>
          </div>
        </div>

        {/* Results Table */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <ArrowPathIcon className="h-10 w-10 text-blue-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <XCircleIcon className="h-16 w-16 text-red-300 mx-auto mb-3" />
              <p className="text-gray-500">{error}</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                No results available for {selectedYear} – Semester {selectedSemester === 1 ? 'One' : 'Two'}.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.map((subject, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono text-gray-700">{subject.code}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{subject.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{subject.course_type}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{subject.credits}</td>
                      <td className="px-4 py-3">
                        {subject.grade && subject.grade !== '-' ? (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getGradeBadge(subject.grade)}`}>
                            {subject.grade}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${getRemarks(subject.grade) === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>
                          {getRemarks(subject.grade) === 'Pass' ? <CheckCircleIcon className="h-3 w-3" /> : <XCircleIcon className="h-3 w-3" />}
                          {getRemarks(subject.grade)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentResults;