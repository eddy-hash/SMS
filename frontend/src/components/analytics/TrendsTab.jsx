
import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const TrendsTab = ({ stats, trendData }) => {

  if (!trendData || trendData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-center">
        <p className="text-gray-500">No trend data available from database</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Historical Trends</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={trendData}>
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="students" stroke="#2563eb" strokeWidth={3} name="Student Enrollment" />
            <Line type="monotone" dataKey="faculty" stroke="#16a34a" strokeWidth={3} name="Faculty Count" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendsTab;  