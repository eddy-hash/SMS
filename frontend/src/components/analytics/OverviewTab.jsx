// OverviewTab.jsx
import React from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
} from "recharts";
import CircularMetric from "./CircularMetric";

const renderLabel = ({ cx, cy, midAngle, outerRadius, percent, name }) => {
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);

  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 25) * cos;
  const my = cy + (outerRadius + 25) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 18;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke="#999" fill="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 5} y={ey} textAnchor={textAnchor} fontSize={12}>
        {name} ({(percent * 100).toFixed(0)}%)
      </text>
    </g>
  );
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
          <p className="text-sm text-gray-600">
            Total: <span className="font-bold text-gray-900">{data.value.toLocaleString()}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = payload[0].payload.total || 0;
    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
          <p className="font-semibold text-gray-800">{data.name}</p>
        </div>
        <p className="text-sm text-gray-600">
          Count: <span className="font-bold text-gray-900">{data.value.toLocaleString()}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Percentage: {percentage}% of total
        </p>
      </div>
    );
  }
  return null;
};

const OverviewTab = ({ stats }) => {
  const s = {
    totalStudents: stats?.totalStudents ?? 0,
    totalStaff: stats?.totalStaff ?? 0,
    totalCourses: stats?.totalCourses ?? 0,
    totalDepartments: stats?.totalDepartments ?? 0,
  };

  const totalAll = s.totalStudents + s.totalStaff + s.totalCourses + s.totalDepartments;

  const metrics = stats?.metrics ?? [
    { label: "Graduation Rate", value: stats?.graduationRate ?? 0, unit: "%", color: { primary: "#22c55e", light: "#d1fae5", dark: "#047857", status: "success" } },
    { label: "Employment Rate", value: stats?.employmentRate ?? 0, unit: "%", color: { primary: "#0ea5e9", light: "#dbeafe", dark: "#1e40af", status: "success" } },
    { label: "Retention Rate", value: stats?.retentionRate ?? 0, unit: "%", color: { primary: "#eab308", light: "#fed7aa", dark: "#b45309", status: "warning" } },
    { label: "Satisfaction Score", value: stats?.satisfactionScore ?? 0, unit: "/10", color: { primary: "#a855f7", light: "#f3e8ff", dark: "#6b21a8", status: "info" } },
  ];

  const chartData = [
    { name: "Students", value: s.totalStudents, color: "#FF6B6B", total: totalAll },
    { name: "Staff", value: s.totalStaff, color: "#4ECDC4", total: totalAll },
    { name: "Courses", value: s.totalCourses, color: "#45B7D1", total: totalAll },
    { name: "Departments", value: s.totalDepartments, color: "#96CEB4", total: totalAll },
  ];

  return (
    <div className="space-y-8">
      <style>{`
        .recharts-pie-sector path {
          stroke: none !important;
          stroke-width: 0 !important;
          outline: none !important;
        }
        .recharts-pie-sector {
          stroke: none !important;
        }
        .recharts-sector {
          stroke: none !important;
          stroke-width: 0 !important;
        }
      `}</style>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-extrabold mb-4" style={{ color: "#2563eb" }}>
            Institutional Overview
            {stats?.summary?.overall_status && (
              <span className="ml-2 text-sm font-normal px-2 py-1 rounded" style={{ backgroundColor: stats.summary.color?.light || '#e5e7eb', color: stats.summary.color?.dark || '#374151' }}>
                Status: {stats.summary.overall_status}
              </span>
            )}
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#f3f4f6' }} />
              <Legend />
              <Bar dataKey="value" barSize={60} radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-extrabold mb-4" style={{ color: "#2563eb" }}>
            Distribution Overview
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={110}
                paddingAngle={0}
                label={renderLabel}
                labelLine={true}
                stroke="none"
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke="none"
                    strokeWidth={0}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <CircularMetric
            key={index}
            label={metric.label}
            value={metric.value}
            unit={metric.unit}
            color={metric.color?.primary || "#3b82f6"}
            lightColor={metric.color?.light}
            status={metric.color?.status}
          />
        ))}
      </div>
    </div>
  );
};

export default OverviewTab;