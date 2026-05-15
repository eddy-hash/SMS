// src/pages/Analytics.jsx
import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/analytics/StatCard";
import OverviewTab from "../components/analytics/OverviewTab";
import TrendsTab from "../components/analytics/TrendsTab";
import DepartmentsTab from "../components/analytics/DepartmentsTab";
import PerformanceTab from "../components/analytics/PerformanceTab";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorDisplay from "../components/analytics/ErrorDisplay";
import TabNavigation from "../components/common/TabNavigation";

const Analytics = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    totalCourses: 0,
    totalDepartments: 0,
    graduationRate: 0,
    employmentRate: 0,
    researchOutput: 0,
    internationalStudents: 0,
    studentFacultyRatio: 0,
    averageClassSize: 0,
    retentionRate: 0,
    satisfactionScore: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/analytics/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError(error.response?.data?.detail || "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { id: "students", title: "Total Students", value: stats.totalStudents, color: "blue", icon: "users" },
    { id: "staff", title: "Staff Members", value: stats.totalStaff, color: "green", icon: "academic" },
    { id: "courses", title: "Active Courses", value: stats.totalCourses, color: "purple", icon: "book" },
    { id: "departments", title: "Departments", value: stats.totalDepartments, color: "orange", icon: "building" },
    
  ];

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "trends", label: "Trends" },
    { id: "departments", label: "Departments" },
    { id: "performance", label: "Performance" }
  ];

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} onRetry={fetchStats} />;

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-600 to-purple-600 bg-clip-text text-transparent font-Georgia">
              <span className="text-blue-600"> EAU </span> Analytics
            </h1>
            <p className="text-gray-600 mt-2">
              <span className="text-blue-600 mt-2">DATA</span> analysis for  East Africa University
            </p>
          </div>
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
            <span className="text-sm text-gray-600">EAU Data information</span>
          </div>
        </div>
      </div>

      
      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

    
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat) => (
          <StatCard key={stat.id} {...stat} />
        ))}
      </div>

    
      {activeTab === "overview" && <OverviewTab stats={stats} />}
      {activeTab === "trends" && <TrendsTab stats={stats} />}
      {activeTab === "departments" && <DepartmentsTab stats={stats} />}
      {activeTab === "performance" && <PerformanceTab stats={stats} />}
    </div>
  );
};

export default Analytics;