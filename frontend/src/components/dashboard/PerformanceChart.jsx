import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from "recharts";
import { ChartBarIcon } from "@heroicons/react/24/outline";

const PerformanceChart = ({ stats }) => {
  const chartData = [
    { name: "Students", value: stats.totalStudents, color: "#3B82F6" },
    { name: "Staff", value: stats.totalStaff, color: "#10B981" },
    { name: "Courses", value: stats.totalCourses, color: "#F59E0B" },
    { name: "Departments", value: stats.totalDepartments, color: "#8B5CF6" }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-sm text-gray-600">
            Total: <span className="font-bold text-blue-600">{payload[0].value.toLocaleString()}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const getRemarks = () => {
    const total = stats.totalStudents + stats.totalStaff + stats.totalCourses + stats.totalDepartments;
    if (total > 500) return "Excellent growth across all departments";
    if (total > 200) return "Good progress, keep improving";
    if (total > 100) return "Moderate growth, needs attention";
    return "Low numbers, focus on expansion";
  };

  const getHighestCategory = () => {
    const categories = [
      { name: "Students", value: stats.totalStudents },
      { name: "Staff", value: stats.totalStaff },
      { name: "Courses", value: stats.totalCourses },
      { name: "Departments", value: stats.totalDepartments }
    ];
    const highest = categories.reduce((max, cat) => cat.value > max.value ? cat : max, categories[0]);
    return highest;
  };

  const highest = getHighestCategory();

  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Dashboard Overview for <span className="text-blue-600">EAU</span>
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Distribution of university resources
          </p>
        </div>
        <ChartBarIcon className="w-5 h-5 text-gray-400" />
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6' }} />
          <Legend 
            verticalAlign="top" 
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-gray-700 text-sm">{value}</span>}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ChartBarIcon className="h-4 w-4 text-blue-600" />
            <h4 className="text-sm font-semibold text-gray-700">Analysis & Remarks</h4>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Highest:</span> {highest.name} ({highest.value.toLocaleString()})
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Overall:</span> {getRemarks()}
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded-full"></span> Students</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-full"></span> Staff</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 rounded-full"></span> Courses</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-500 rounded-full"></span> Departments</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;