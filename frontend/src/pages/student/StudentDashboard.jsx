import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  BookOpenIcon,
  AcademicCapIcon,
  UserCircleIcon,
  CreditCardIcon,
  PhoneIcon,
  MapPinIcon,
  EnvelopeIcon,
  IdentificationIcon,
  CalendarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [dashboardRes, profileRes, classesRes] = await Promise.all([
          api.get("/student/dashboard"),
          api.get("/student/profile"),
          api.get("/student/classes"),
        ]);

        if (dashboardRes.data.success) {
          setStudent(dashboardRes.data.data.student);
          setWelcomeMessage(dashboardRes.data.message || "Welcome Back");
        }

        if (profileRes.data.success) {
          setProfile(profileRes.data.profile);
        }

        if (classesRes.data.success) {
          setCourses(classesRes.data.courses || []);
        }
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.detail ||
            err.message ||
            "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDashboardData();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="h-10 w-10 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-2xl shadow-md border border-red-100 p-5 w-full max-w-md">
          <h2 className="text-sm font-bold text-red-700">
            Error Loading Dashboard
          </h2>

          <p className="text-[12px] text-slate-500 mt-2">{error}</p>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-red-600 text-white text-[12px] py-2 rounded-lg hover:bg-red-700"
            >
              Retry
            </button>

            <button
              onClick={handleLogout}
              className="flex-1 bg-slate-700 text-white text-[12px] py-2 rounded-lg hover:bg-slate-800"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const fullName =
    profile?.full_name || student?.full_name || "Student";

  const email =
    profile?.email || student?.email || user?.email || "";

  const registration =
    profile?.registration_number ||
    student?.registration_number ||
    "N/A";

  const year =
    profile?.year_of_study ||
    student?.year_of_study ||
    "N/A";

  const totalCredits = courses.reduce(
    (sum, c) => sum + (c.credits || 0),
    0
  );

  const stats = [
    {
      label: "Courses",
      value: courses.length,
      icon: BookOpenIcon,
      color: "from-blue-500 to-indigo-600",
    },
    {
      label: "Credits",
      value: totalCredits,
      icon: CreditCardIcon,
      color: "from-yellow-500 to-orange-500",
    },
    {
      label: "Year",
      value: year,
      icon: AcademicCapIcon,
      color: "from-green-500 to-emerald-600",
    },
    {
      label: "Registration",
      value: registration,
      icon: IdentificationIcon,
      color: "from-purple-500 to-fuchsia-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 p-5 shadow-md">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-3 rounded-2xl">
            <UserCircleIcon className="h-10 w-10 text-white" />
          </div>

          <div>
            <h1 className="text-lg font-bold text-white">
              {welcomeMessage}
            </h1>

            <p className="text-[12px] text-blue-100 mt-1">
              {fullName}
            </p>

            <div className="flex items-center gap-1 mt-1 text-[12px] text-blue-100">
              <EnvelopeIcon className="h-3 w-3" />
              {email}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
        {stats.map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 uppercase">
                  {item.label}
                </p>

                <h2 className="text-sm font-bold text-slate-700 mt-1 break-all">
                  {item.value}
                </h2>
              </div>

              <div
                className={`bg-gradient-to-br ${item.color} p-2 rounded-xl`}
              >
                <item.icon className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

     
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-5">
       
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-slate-900 px-4 py-3">
            <h2 className="text-sm font-semibold text-white">
              Profile Information
            </h2>
          </div>

          <div className="p-4 space-y-3 text-[12px]">
            <ProfileItem label="Full Name" value={fullName} />
            <ProfileItem label="Registration" value={registration} />
            <ProfileItem label="Year" value={year} />
            <ProfileItem
              label="Phone"
              value={profile?.phone || "Not provided"}
              icon={PhoneIcon}
            />
            <ProfileItem
              label="Address"
              value={profile?.address || "Not provided"}
              icon={MapPinIcon}
            />

            {profile?.guardian_name && (
              <ProfileItem
                label="Guardian"
                value={`${profile.guardian_name} ${
                  profile.guardian_phone
                    ? `(${profile.guardian_phone})`
                    : ""
                }`}
                icon={UserGroupIcon}
              />
            )}

            {profile?.gender && (
              <ProfileItem
                label="Gender"
                value={profile.gender}
              />
            )}

            {profile?.date_of_birth && (
              <ProfileItem
                label="Date of Birth"
                value={new Date(
                  profile.date_of_birth
                ).toLocaleDateString()}
                icon={CalendarIcon}
              />
            )}
          </div>
        </div>

        
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3">
            <h2 className="text-sm font-semibold text-white">
              My Courses
            </h2>
          </div>

          <div className="p-4">
            {courses.length === 0 ? (
              <div className="text-center py-10">
                <BookOpenIcon className="h-10 w-10 text-slate-300 mx-auto" />

                <p className="text-[12px] text-slate-500 mt-3">
                  No enrolled courses found
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="min-w-full text-[12px]">
                    <thead className="bg-slate-100 text-slate-500 uppercase">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          Code
                        </th>
                        <th className="px-4 py-3 text-left">
                          Course
                        </th>
                        <th className="px-4 py-3 text-left">
                          Credits
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {courses.map((course) => (
                        <tr
                          key={course.id}
                          className="hover:bg-slate-50"
                        >
                          <td className="px-4 py-3 font-mono text-slate-700">
                            {course.code}
                          </td>

                          <td className="px-4 py-3 text-slate-700">
                            {course.name}
                          </td>

                          <td className="px-4 py-3">
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-[11px]">
                              {course.credits}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center mt-4 bg-slate-100 rounded-xl px-4 py-3">
                  <span className="text-[12px] text-slate-500">
                    Total Credits
                  </span>

                  <span className="text-sm font-bold text-emerald-600">
                    {totalCredits}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileItem = ({ label, value, icon: Icon }) => (
  <div className="border-b border-slate-100 pb-2">
    <p className="flex items-center gap-1 text-[11px] text-slate-400 uppercase">
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </p>

    <p className="text-[12px] font-medium text-slate-700 mt-1">
      {value}
    </p>
  </div>
);

export default StudentDashboard;