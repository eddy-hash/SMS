import React from "react";
import { RadialBarChart, RadialBar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#2563eb", "#16a34a", "#eab308", "#8b5cf6"];

const PerformanceTab = ({ stats }) => {
  const safeStats = {
    graduationRate: stats?.graduationRate || 0,
    employmentRate: stats?.employmentRate || 0,
    retentionRate: stats?.retentionRate || 0,
    satisfactionScore: stats?.satisfactionScore || 0,
    internationalStudents: stats?.internationalStudents || 0,
    researchOutput: stats?.researchOutput || 0
  };

  const radialData = [
    { name: "Graduation", value: safeStats.graduationRate, fill: COLORS[0] },
    { name: "Employment", value: safeStats.employmentRate, fill: COLORS[1] },
    { name: "Retention", value: safeStats.retentionRate, fill: COLORS[2] },
    { name: "Satisfaction", value: (safeStats.satisfactionScore / 5) * 100, fill: COLORS[3] }
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 text-center">Performance Metrics Overview</h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={radialData} startAngle={180} endAngle={0}>
            <RadialBar minAngle={15} background clockWise={true} dataKey="value" />
            <Legend iconSize={10} width={120} height={140} layout="vertical" verticalAlign="middle" align="right" />
            <Tooltip />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
          <h4 className="font-semibold text-blue-900 mb-2">International Students</h4>
          <p className="text-3xl font-bold text-blue-700">{safeStats.internationalStudents}%</p>
          <p className="text-sm text-blue-600 mt-2">of total student population</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
          <h4 className="font-semibold text-green-900 mb-2">Research Output</h4>
          <p className="text-3xl font-bold text-green-700">{safeStats.researchOutput}</p>
          <p className="text-sm text-green-600 mt-2">active research projects</p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTab;