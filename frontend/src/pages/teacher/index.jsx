import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import TeacherDashboard from './TeacherDashboard';
import TeacherResults from './TeacherResults';
import TeacherStudents from './TeacherStudents';
import TeacherAttendance from './TeacherAttendance';
import TeacherCourses from './TeacherCourses';
import TeacherProfile from './TeacherProfile';
import TeacherChangePassword from './TeacherChangePassword';
import TeacherUpload from './TeacherUpload';
import TeacherPerformance from './TeacherPerformance';
import TeacherTimetable from './TeacherTimetable';
import TeacherNotifications from './TeacherNotifications';
import StudentResultView from './StudentResultView';

const Teacher = () => {
  const { user } = useAuth();

 
  if (user?.role !== 'teacher') {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<TeacherDashboard />} />
        <Route path="/dashboard" element={<Navigate to="/teacher" replace />} />
        <Route path="/results" element={<TeacherResults />} />
        <Route path="/students" element={<TeacherStudents />} />
        <Route path="/attendance" element={<TeacherAttendance />} />
        <Route path="/courses" element={<TeacherCourses />} />
        <Route path="/profile" element={<TeacherProfile />} />
        <Route path="/change-password" element={<TeacherChangePassword />} />
        <Route path="/upload" element={<TeacherUpload />} />
        <Route path="/performance" element={<TeacherPerformance />} />
        <Route path="/timetable" element={<TeacherTimetable />} />
        <Route path="/notifications" element={<TeacherNotifications />} />
        <Route path="/student-results/:studentId?" element={<StudentResultView />} />
      </Routes>
    </div>
  );
};

export default Teacher;