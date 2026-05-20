import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Students from './pages/Students';
import Staff from './pages/Staff';
import Courses from './pages/Courses';
import Departments from './pages/Departments';
import Announcements from './pages/Announcements';
import Register from './pages/Register';
import Forgot from './pages/Forgot';
import ResetPassword from './pages/ResetPassword';
import Unauthorized from './pages/Unauthorized';

// Student imports
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentCourses from './pages/student/StudentCourses';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentResults from './pages/student/StudentResults';
import StudentTimetable from './pages/student/StudentTimetable';
import StudentFees from './pages/student/StudentFees';
import StudentStatements from './pages/student/StudentStatements';
import StudentNotifications from './pages/student/StudentNotifications';
import StudentChangePassword from './pages/student/StudentChangePassword';
import StudentRegistrationSem1 from './pages/student/StudentRegistrationSem1';
import StudentRegistrationSem2 from './pages/student/StudentRegistrationSem2';
import StudentAssessments from './pages/student/StudentAssessments';

// Teacher imports - following same pattern as student
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherProfile from './pages/teacher/TeacherProfile';
import TeacherCourses from './pages/teacher/TeacherCourses';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherResults from './pages/teacher/TeacherResults';
import TeacherStudents from './pages/teacher/TeacherStudents';
import TeacherUpload from './pages/teacher/TeacherUpload';
import TeacherPerformance from './pages/teacher/TeacherPerformance';
import TeacherTimetable from './pages/teacher/TeacherTimetable';
import TeacherNotifications from './pages/teacher/TeacherNotifications';
import TeacherChangePassword from './pages/teacher/TeacherChangePassword';
import StudentResultView from './pages/teacher/StudentResultView';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Toaster 
            position="bottom-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<Forgot />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            <Route element={<ProtectedRoute allowedRoles={['admin', 'student', 'teacher']} />}>
              <Route element={<DashboardLayout />}>
                {/* Admin Routes */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/students" element={<Students />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/departments" element={<Departments />} />
                <Route path="/announcements" element={<Announcements />} />
                
                {/* Student Routes */}
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/profile" element={<StudentProfile />} />
                <Route path="/student/courses" element={<StudentCourses />} />
                <Route path="/student/attendance" element={<StudentAttendance />} />
                <Route path="/student/results/:semester" element={<StudentResults />} />
                <Route path="/student/results" element={<Navigate to="/student/results/1" replace />} />
                <Route path="/student/timetable" element={<StudentTimetable />} />
                <Route path="/student/fees" element={<StudentFees />} />
                <Route path="/student/statements" element={<StudentStatements />} />
                <Route path="/student/notifications" element={<StudentNotifications />} />
                <Route path="/student/change-password" element={<StudentChangePassword />} />
                <Route path="/student/registration/sem1" element={<StudentRegistrationSem1 />} />
                <Route path="/student/registration/sem2" element={<StudentRegistrationSem2 />} />
                <Route path="/student/assessments" element={<StudentAssessments />} />
                
                {/* Teacher Routes - Direct mapping like student */}
                <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                <Route path="/teacher/profile" element={<TeacherProfile />} />
                <Route path="/teacher/courses" element={<TeacherCourses />} />
                <Route path="/teacher/attendance" element={<TeacherAttendance />} />
                <Route path="/teacher/results" element={<TeacherResults />} />
                <Route path="/teacher/students" element={<TeacherStudents />} />
                <Route path="/teacher/upload" element={<TeacherUpload />} />
                <Route path="/teacher/performance" element={<TeacherPerformance />} />
                <Route path="/teacher/timetable" element={<TeacherTimetable />} />
                <Route path="/teacher/notifications" element={<TeacherNotifications />} />
                <Route path="/teacher/change-password" element={<TeacherChangePassword />} />
                <Route path="/teacher/student-results/:studentId?" element={<StudentResultView />} />
                
                <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;