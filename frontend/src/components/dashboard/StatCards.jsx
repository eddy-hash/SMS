import {
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  BuildingOfficeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";

const iconMap = {
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  BuildingOfficeIcon,
};

const colorMap = {
  blue: { iconBg: "bg-blue-100", text: "text-blue-600", trendUp: "text-green-600", trendDown: "text-red-600" },
  green: { iconBg: "bg-green-100", text: "text-green-600", trendUp: "text-green-600", trendDown: "text-red-600" },
  purple: { iconBg: "bg-purple-100", text: "text-purple-600", trendUp: "text-green-600", trendDown: "text-red-600" },
  orange: { iconBg: "bg-orange-100", text: "text-orange-600", trendUp: "text-green-600", trendDown: "text-red-600" },
};

const statCardsConfig = [
  { id: "students", title: "Total Students", icon: "UserGroupIcon", color: "blue", subtitle: "Active students", changeKey: "studentPercentage" },
  { id: "staff", title: "Total Staff", icon: "AcademicCapIcon", color: "green", subtitle: "Active staff members", changeKey: "staffPercentage" },
  { id: "courses", title: "Total Courses", icon: "BookOpenIcon", color: "purple", subtitle: "Active courses", changeKey: "coursePercentage" },
  { id: "departments", title: "Departments", icon: "BuildingOfficeIcon", color: "orange", subtitle: "Academic departments", changeKey: "departmentPercentage" },
];

const StatCard = ({ stat, value, percentage }) => {
  const Icon = iconMap[stat.icon];
  const colors = colorMap[stat.color];
  const isPositive = percentage >= 0;
  
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {value.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-1">
            {percentage !== 0 && (
              <>
                {isPositive ? (
                  <ArrowUpIcon className={`h-3 w-3 ${colors.trendUp}`} />
                ) : (
                  <ArrowDownIcon className={`h-3 w-3 ${colors.trendDown}`} />
                )}
                <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(percentage)}%
                </span>
              </>
            )}
            <span className="text-xs text-gray-400">from last month</span>
          </div>
        </div>
        <div className={`w-14 h-14 ${colors.iconBg} rounded-2xl flex items-center justify-center`}>
          <Icon className={`w-7 h-7 ${colors.text}`} />
        </div>
      </div>
    </div>
  );
};

const StatCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCardsConfig.map((stat) => (
        <StatCard 
          key={stat.id} 
          stat={stat} 
          value={stats[stat.id === 'students' ? 'totalStudents' : 
                       stat.id === 'staff' ? 'totalStaff' :
                       stat.id === 'courses' ? 'totalCourses' : 'totalDepartments'] || 0}
          percentage={stats[stat.changeKey] || 0}
        />
      ))}
    </div>
  );
};

export default StatCards;