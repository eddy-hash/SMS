
import React from "react";
import { 
  UserGroupIcon, 
  AcademicCapIcon, 
  BookOpenIcon, 
  BuildingOfficeIcon,
  ChartBarIcon,
  ShieldCheckIcon 
} from "@heroicons/react/24/outline";

const iconMap = {
  users: UserGroupIcon,
  academic: AcademicCapIcon,
  book: BookOpenIcon,
  building: BuildingOfficeIcon,
  chart: ChartBarIcon,
  shield: ShieldCheckIcon
};

const colorClasses = {
  blue: { bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-200" },
  green: { bg: "bg-green-100", text: "text-green-600", border: "border-green-200" },
  purple: { bg: "bg-purple-100", text: "text-purple-600", border: "border-purple-200" },
  orange: { bg: "bg-orange-100", text: "text-orange-600", border: "border-orange-200" },
  teal: { bg: "bg-teal-100", text: "text-teal-600", border: "border-teal-200" },
  indigo: { bg: "bg-indigo-100", text: "text-indigo-600", border: "border-indigo-200" }
};

const StatCard = ({ title, value, color, icon }) => {
  const Icon = iconMap[icon];
  const colors = colorClasses[color];

  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 border-l-4 ${colors.border} hover:shadow-md transition-all`}>
      <div className="flex items-center justify-between">
        <div className={`${colors.bg} p-2 rounded-lg`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800 mt-3">{value.toLocaleString()}</p>
      <p className="text-xs text-gray-500 mt-1">{title}</p>
    </div>
  );
};

export default StatCard;