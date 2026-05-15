import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatCards from "../components/dashboard/StatCards";
import PerformanceChart from "../components/dashboard/PerformanceChart";
import KPIPanel from "../components/dashboard/KPIPanel";
import QuickInfoPanels from "../components/dashboard/QuickInfoPanels";
import CampusHighlights from "../components/dashboard/CampusHighlights";
import LoadingSpinner from "../components/dashboard/LoadingSpinner";
import ErrorDisplay from "../components/dashboard/ErrorDisplay";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    totalCourses: 0,
    totalDepartments: 0,
    activeStaff: 0,
    graduationRate: 92,
    employmentRate: 88,
    internationalStudents: 15,
    researchProjects: 45,
    studentPercentage: 0,
    staffPercentage: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchStats = async () => {
    try {
      setError(null);
      setLoading(true);

      // Use your new /dashboard/stats endpoint (includes everything)
      const statsResponse = await api.get("/dashboard/stats");
      const data = statsResponse.data;

      setStats({
        totalStudents: data.totalStudents || 0,
        totalStaff: data.totalStaff || 0,
        totalCourses: data.totalCourses || 0,
        totalDepartments: data.totalDepartments || 0,
        activeStaff: data.totalStaff || 0,
        graduationRate: data.graduationRate || 92,
        employmentRate: data.employmentRate || 88,
        internationalStudents: data.internationalStudents || 15,
        researchProjects: data.researchProjects || 45,
        studentPercentage: 0,   // Not in your backend yet – keep or remove
        staffPercentage: 0
      });

    } catch (err) {
      console.error("Error fetching stats:", err);
      const errorMessage = err.response?.data?.detail || err.message || "Failed to load dashboard data";
      setError(typeof errorMessage === "object" ? JSON.stringify(errorMessage) : errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} onRetry={fetchStats} />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <DashboardHeader username={user?.username} />
      <StatCards stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <PerformanceChart stats={stats} />
        <KPIPanel stats={stats} />
      </div>
      <QuickInfoPanels
        internationalStudents={stats.internationalStudents}
        researchProjects={stats.researchProjects}
      />
      <CampusHighlights
        researchProjects={stats.researchProjects}
        employmentRate={stats.employmentRate}
        graduationRate={stats.graduationRate}
      />
    </div>
  );
};

export default Dashboard;