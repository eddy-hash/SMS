// CircularMetric.jsx
import React from "react";

const CircularMetric = ({ label, value, unit, color, lightColor, status, trend }) => {
  // Get status-based background color
  const getStatusBg = () => {
    if (lightColor) return { backgroundColor: lightColor };
    switch(status) {
      case "success": return { backgroundColor: "#d1fae5" };
      case "warning": return { backgroundColor: "#fed7aa" };
      case "error": return { backgroundColor: "#fee2e2" };
      default: return { backgroundColor: "#dbeafe" };
    }
  };

  return (
    <div 
      className="rounded-xl shadow-sm p-6 text-center transition-all hover:shadow-md"
      style={getStatusBg()}
    >
      <div className="relative inline-flex items-center justify-center">
        {/* SVG Circular Progress */}
        <svg className="w-32 h-32" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 52 * (value / 100)} ${2 * Math.PI * 52}`}
            strokeDashoffset={`${2 * Math.PI * 52 * 0.25}`}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />
          <text x="60" y="60" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold" fill={color}>
            {value}{unit === "/10" ? "" : unit === "%" ? "%" : ""}
          </text>
          {unit === "/10" && (
            <text x="60" y="75" textAnchor="middle" dominantBaseline="middle" className="text-xs" fill="#6b7280">
              /10
            </text>
          )}
        </svg>
      </div>
      <h3 className="mt-4 text-sm font-medium text-gray-600">{label}</h3>
      {trend && (
        <p className="text-xs mt-1" style={{ color }}>
          {trend}
        </p>
      )}
      {status && (
        <span 
          className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full capitalize"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {status}
        </span>
      )}
    </div>
  );
};

export default CircularMetric;