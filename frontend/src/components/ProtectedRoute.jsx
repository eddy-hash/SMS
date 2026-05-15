import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role || user?.user_type || 'student';

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    if (userRole === 'admin') {
      return <Navigate to="/dashboard" replace />;
    } else if (userRole === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;