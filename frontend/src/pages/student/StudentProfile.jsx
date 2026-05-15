import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  UserGroupIcon,
  DevicePhoneMobileIcon,
  AcademicCapIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileAndCourse = async () => {
      try {
        const [profileRes, courseRes] = await Promise.all([
          api.get('/student/profile'),
          api.get('/student/classes')
        ]);
        
        if (profileRes.data.success) {
          setProfile(profileRes.data.profile);
        }
        if (courseRes.data.success && courseRes.data.courses?.length > 0) {
          setCourse(courseRes.data.courses[0]);
        }
      } catch (error) {
        console.error('Profile error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndCourse();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-gray-500 text-lg">No profile data found</p>
        </div>
      </div>
    );
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="info-card group bg-gray-50 rounded-xl p-4 transition-all duration-300 hover:bg-white hover:shadow-lg border border-transparent hover:border-gray-100">
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-blue-500 mt-0.5 transition-transform duration-200 group-hover:scale-110" />
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-gray-800 font-medium mt-1 break-words">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="profile-card bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="relative h-32 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="absolute -bottom-12 left-6 md:left-10">
              <div className="relative">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white p-1 shadow-lg">
                  {profile.profile_image ? (
                    <img
                      src={profile.profile_image}
                      alt={profile.full_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl md:text-2xl font-bold">
                      {getInitials(profile.full_name)}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            </div>
          </div>

          <div className="pt-16 pb-8 px-6 md:px-10">
            <div className="border-b border-gray-100 pb-6 mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{profile.full_name}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  {profile.role || 'Student'}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                  Year {profile.year_of_study}
                </span>
                {profile.registration_number && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                    {profile.registration_number}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <InfoItem icon={EnvelopeIcon} label="Email" value={profile.email} />
              <InfoItem icon={PhoneIcon} label="Phone" value={profile.phone || 'Not provided'} />
              <InfoItem icon={MapPinIcon} label="Address" value={profile.address || 'Not provided'} />
              <InfoItem icon={UserGroupIcon} label="Guardian Name" value={profile.guardian_name || 'Not provided'} />
              <InfoItem icon={DevicePhoneMobileIcon} label="Guardian Phone" value={profile.guardian_phone || 'Not provided'} />
              <InfoItem icon={AcademicCapIcon} label="Registration Number" value={profile.registration_number || 'Not provided'} />
              <InfoItem icon={BookOpenIcon} label="Enrolled Course" value={course ? course.name : 'Not enrolled'} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .profile-card {
          animation: fadeInUp 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
        }

        .info-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.2s;
        }

        .info-card:hover {
          transform: translateY(-4px);
          animation: bounce 0.5s ease;
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @media (max-width: 640px) {
          .profile-card {
            margin: 0 1rem;
          }
          .info-card {
            padding: 0.75rem;
          }
        }

        @media (min-width: 768px) {
          .info-card {
            padding: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentProfile;