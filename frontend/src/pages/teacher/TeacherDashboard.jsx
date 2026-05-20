// src/pages/teacher/TeacherDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  BookOpenIcon,
  DocumentTextIcon,
  ChartBarIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentResults, setRecentResults] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchRecentResults();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/analytics/teacher-dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      // Set default stats if API fails
      setStats({
        total_students: 0,
        total_courses: 0,
        total_results: 0,
        average_marks: 0,
        pass_rate: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentResults = async () => {
    try {
      const response = await api.get('/results/recent?limit=5');
      setRecentResults(response.data.results || []);
    } catch (error) {
      console.error('Failed to load recent results:', error);
    }
  };

  const StatCard = ({ title, value, icon, color, trend }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {trend && (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <ArrowTrendingUpIcon className="h-3 w-3" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <div className={`text-${color}-600`}>{icon}</div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.full_name || 'Teacher'}!</h1>
        <p className="text-emerald-100 mt-1">Here's what's happening with your classes today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value={stats?.total_students || 0}
          icon={<UserGroupIcon className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="My Courses"
          value={stats?.total_courses || 0}
          icon={<BookOpenIcon className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          title="Results Uploaded"
          value={stats?.total_results || 0}
          icon={<DocumentTextIcon className="h-6 w-6" />}
          color="orange"
        />
        <StatCard
          title="Pass Rate"
          value={`${stats?.pass_rate || 0}%`}
          icon={<AcademicCapIcon className="h-6 w-6" />}
          color="purple"
          trend="+5% from last semester"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-emerald-600" />
            Recent Results
          </h3>
          {recentResults.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent results</p>
          ) : (
            <div className="space-y-3">
              {recentResults.map((result) => (
                <div key={result.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium text-gray-800">{result.student_name}</p>
                    <p className="text-sm text-gray-500">{result.course_code}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      result.marks >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {result.marks}%
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{result.exam_type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link
            to="/teacher/results"
            className="mt-4 text-sm text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
          >
            View all results →
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-emerald-600" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              to="/teacher/results"
              className="block w-full text-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Add New Result
            </Link>
            <Link
              to="/teacher/attendance"
              className="block w-full text-center px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              Take Attendance
            </Link>
            <Link
              to="/teacher/students"
              className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Students
            </Link>
            <Link
              to="/teacher/upload"
              className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Bulk Upload Results
            </Link>
          </div>
        </div>
      </div>

      {/* Course Progress */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5 text-emerald-600" />
          Course Performance
        </h3>
        <div className="space-y-4">
          {stats?.courses?.map((course) => (
            <div key={course.id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{course.course_code}</span>
                <span className="text-gray-500">Average: {course.average_marks}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-emerald-600 rounded-full h-2 transition-all duration-500"
                  style={{ width: `${course.average_marks}%` }}
                />
              </div>
            </div>
          ))}
          {(!stats?.courses || stats.courses.length === 0) && (
            <p className="text-gray-500 text-center py-4">No course data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;