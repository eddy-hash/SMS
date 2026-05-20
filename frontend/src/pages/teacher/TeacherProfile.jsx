import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  UserIcon, 
  EnvelopeIcon, 
  AcademicCapIcon, 
  BriefcaseIcon, 
  ArrowPathIcon,
  BookOpenIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const TeacherProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/teacher/profile');
      console.log('Profile response:', response.data);
      setProfile(response.data.teacher);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.response?.data?.detail || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ArrowPathIcon className="h-8 w-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md mx-auto">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchProfile}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center max-w-md mx-auto">
        <p className="text-yellow-600">No profile data found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-8 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-full p-4">
              <UserIcon className="h-12 w-12" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile.full_name}</h1>
              <p className="text-emerald-100">Teacher</p>
              <p className="text-emerald-200 text-sm mt-1">{profile.email}</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <IdentificationIcon className="h-5 w-5 text-emerald-600" />
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <UserIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-gray-800 font-medium">{profile.full_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-800">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <IdentificationIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Registration Number</p>
                <p className="text-gray-800 font-mono">{profile.registration_number}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <UserIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="text-gray-800">{profile.gender || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-gray-800">
                  {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ChartBarIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Total Results Uploaded</p>
                <p className="text-gray-800 font-semibold">{profile.statistics?.total_results_uploaded || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Department Information */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BuildingOfficeIcon className="h-5 w-5 text-emerald-600" />
            Department Information
          </h2>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
            <div className="flex items-start gap-3">
              <BuildingOfficeIcon className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Assigned Department</p>
                <p className="text-lg font-semibold text-gray-800">
                  {profile.department_name || 'Not Assigned'}
                </p>
                {profile.department_id && (
                  <p className="text-sm text-gray-500 mt-1">Department ID: {profile.department_id}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Course Information */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpenIcon className="h-5 w-5 text-emerald-600" />
            Course Information
          </h2>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <BookOpenIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Teaching Course</p>
                <p className="text-lg font-semibold text-gray-800">
                  {profile.course || 'Not Assigned'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AcademicCapIcon className="h-5 w-5 text-emerald-600" />
            Account Status
          </h2>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              profile.is_active 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {profile.is_active ? 'Active' : 'Inactive'}
            </div>
            {profile.last_login && (
              <p className="text-sm text-gray-500">
                Last login: {new Date(profile.last_login).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-gray-50 flex justify-between">
          <button
            onClick={() => window.location.href = '/teacher/change-password'}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Change Password
          </button>
          <button
            onClick={fetchProfile}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;