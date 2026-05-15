// DepartmentsTab.jsx - Fixed Tooltip
import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "../../services/api";

// Professional color coding
const COLORS = {
  students: '#eab308',  // Yellow - Students
  staff: '#3b82f6',     // Blue - Staff  
  courses: '#22c55e'    // Green - Courses
};

const DepartmentsTab = ({ stats }) => {
  const [departmentData, setDepartmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('students');
  const [chartType, setChartType] = useState('grouped');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get("/analytics/departments/performance");
      setDepartmentData(response.data.departments || []);
    } catch (error) {
      console.error("Error fetching department data:", error);
      setDepartmentData([]);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (value, metric) => {
    if (metric === 'students') {
      if (value > 300) return COLORS.students;
      if (value > 150) return '#fbbf24';
      return '#fcd34d';
    }
    if (metric === 'staff') {
      if (value > 40) return COLORS.staff;
      if (value > 25) return '#60a5fa';
      return '#93c5fd';
    }
    if (metric === 'courses') {
      if (value > 30) return COLORS.courses;
      if (value > 20) return '#4ade80';
      return '#86efac';
    }
    return '#6b7280';
  };

  const topDepartments = [...departmentData]
    .sort((a, b) => b[selectedMetric] - a[selectedMetric])
    .slice(0, 8);

  const chartData = departmentData.map(dept => ({
    name: dept.code || dept.name?.substring(0, 3)?.toUpperCase(),
    fullName: dept.name,
    students: dept.students || 0,
    staff: dept.staff || 0,
    courses: dept.courses || 0
  }));

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[200px]">
          <p className="font-semibold text-gray-800 text-sm border-b border-gray-100 pb-2 mb-2">
            {data.fullName || label}
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.students }}></div>
                <span className="text-xs text-gray-600">Students:</span>
              </div>
              <span className="text-sm font-semibold" style={{ color: COLORS.students }}>
                {data.students?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.staff }}></div>
                <span className="text-xs text-gray-600">Staff:</span>
              </div>
              <span className="text-sm font-semibold" style={{ color: COLORS.staff }}>
                {data.staff?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.courses }}></div>
                <span className="text-xs text-gray-600">Courses:</span>
              </div>
              <span className="text-sm font-semibold" style={{ color: COLORS.courses }}>
                {data.courses?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-3 text-sm">Loading department data...</p>
      </div>
    );
  }

  if (!departmentData.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-500 text-sm">No department data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Metric Selector */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setSelectedMetric('students')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md transition-all flex items-center gap-2 ${
              selectedMetric === 'students' 
                ? 'bg-yellow-500 text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>🎓</span> Students
          </button>
          <button
            onClick={() => setSelectedMetric('staff')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md transition-all flex items-center gap-2 ${
              selectedMetric === 'staff' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>👥</span> Staff
          </button>
          <button
            onClick={() => setSelectedMetric('courses')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md transition-all flex items-center gap-2 ${
              selectedMetric === 'courses' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>📚</span> Courses
          </button>
        </div>
        
        {/* Chart Type Toggle */}
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setChartType('grouped')}
            className={`px-3 py-1 text-xs rounded-md transition-all ${
              chartType === 'grouped' 
                ? 'bg-white shadow-sm text-gray-800' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Grouped
          </button>
          <button
            onClick={() => setChartType('stacked')}
            className={`px-3 py-1 text-xs rounded-md transition-all ${
              chartType === 'stacked' 
                ? 'bg-white shadow-sm text-gray-800' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Stacked
          </button>
        </div>
      </div>

      {/* Top Departments Cards - WITH BLACK HOVER EFFECT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {topDepartments.map((dept, index) => {
          const metricValue = dept[selectedMetric];
          const rank = index + 1;
          const color = getPerformanceColor(metricValue, selectedMetric);
          
          return (
            <div 
              key={dept.id} 
              className="bg-white rounded-lg shadow-sm p-3 sm:p-4 transition-all duration-300 border border-gray-200 cursor-pointer group hover:bg-black hover:shadow-xl hover:border-gray-700"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-2 sm:mb-3">
                <div className="flex items-center gap-1 sm:gap-2">
                  <span 
                    className="text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full transition-all group-hover:scale-105"
                    style={{ 
                      backgroundColor: rank <= 3 ? `${color}20` : '#f3f4f6',
                      color: rank <= 3 ? color : '#6b7280'
                    }}
                  >
                    #{rank} {rank === 1 && '🏆'}
                  </span>
                  <span className="text-xs text-gray-400 group-hover:text-gray-400 transition-colors">{dept.code}</span>
                </div>
                <div className="text-right">
                  <p className="text-xl sm:text-2xl font-bold transition-transform group-hover:scale-105" style={{ color }}>
                    {metricValue?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-gray-400 capitalize group-hover:text-gray-400 transition-colors">{selectedMetric}</p>
                </div>
              </div>

              {/* Department Name */}
              <h4 className="text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3 group-hover:text-white transition-colors">
                {dept.name}
              </h4>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 sm:pt-3 border-t border-gray-100 group-hover:border-gray-700 transition-colors">
                <div className="group-hover:translate-x-0.5 transition-transform">
                  <p className="text-xs text-gray-400 group-hover:text-gray-400 transition-colors">Staff</p>
                  <p className="text-sm font-semibold group-hover:text-white transition-colors" style={{ color: COLORS.staff }}>
                    {dept.staff || 0}
                  </p>
                </div>
                <div className="group-hover:translate-x-0.5 transition-transform delay-75">
                  <p className="text-xs text-gray-400 group-hover:text-gray-400 transition-colors">Courses</p>
                  <p className="text-sm font-semibold group-hover:text-white transition-colors" style={{ color: COLORS.courses }}>
                    {dept.courses || 0}
                  </p>
                </div>
                <div className="group-hover:translate-x-0.5 transition-transform delay-150">
                  <p className="text-xs text-gray-400 group-hover:text-gray-400 transition-colors">Students</p>
                  <p className="text-sm font-semibold group-hover:text-white transition-colors" style={{ color: COLORS.students }}>
                    {dept.students || 0}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Department Comparison Chart */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5">
        {/* Chart Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Department Distribution</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {chartType === 'grouped' ? 'Side-by-side comparison' : 'Stacked distribution'} by department
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.students }}></div>
              <span className="text-gray-600">Students</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.staff }}></div>
              <span className="text-gray-600">Staff</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.courses }}></div>
              <span className="text-gray-600">Courses</span>
            </div>
          </div>
        </div>
        
        {/* Chart Container */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[300px] sm:min-w-full">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={chartData} 
                margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                barGap={chartType === 'grouped' ? 4 : 0}
                barCategoryGap={chartType === 'grouped' ? 16 : 8}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                  label={{
                    value: chartType === 'stacked' ? 'Total Distribution' : 'Count',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: '12px', fill: '#6b7280' }
                  }}
                />
                {/* Use Custom Tooltip */}
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                <Bar 
                  dataKey="students" 
                  name="Students" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={chartType === 'grouped' ? 40 : 80}
                  stackId={chartType === 'stacked' ? 'stack' : undefined}
                  fill={COLORS.students}
                />
                <Bar 
                  dataKey="staff" 
                  name="Staff" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={chartType === 'grouped' ? 40 : 80}
                  stackId={chartType === 'stacked' ? 'stack' : undefined}
                  fill={COLORS.staff}
                />
                <Bar 
                  dataKey="courses" 
                  name="Courses" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={chartType === 'grouped' ? 40 : 80}
                  stackId={chartType === 'stacked' ? 'stack' : undefined}
                  fill={COLORS.courses}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart Insights Footer */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <span className="text-gray-500">Total Students:</span>
              <span className="font-semibold" style={{ color: COLORS.students }}>
                {departmentData.reduce((sum, d) => sum + (d.students || 0), 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <span className="text-gray-500">Total Staff:</span>
              <span className="font-semibold" style={{ color: COLORS.staff }}>
                {departmentData.reduce((sum, d) => sum + (d.staff || 0), 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <span className="text-gray-500">Total Courses:</span>
              <span className="font-semibold" style={{ color: COLORS.courses }}>
                {departmentData.reduce((sum, d) => sum + (d.courses || 0), 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  );
};

export default DepartmentsTab;