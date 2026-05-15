export const statCardsConfig = [
  {
    id: "students",
    title: "Total Students",
    icon: "UserGroupIcon",
    color: "blue",
    subtitle: "Active Enrollment"
  },
  {
    id: "staff",
    title: "Staff Members",
    icon: "AcademicCapIcon",
    color: "green",
    subtitle: "Faculty & Administration"
  },
  {
    id: "courses",
    title: "Active Courses",
    icon: "BookOpenIcon",
    color: "purple",
    subtitle: "Across All Departments"
  },
  {
    id: "departments",
    title: "Departments",
    icon: "BuildingOfficeIcon",
    color: "orange",
    subtitle: "Academic Units"
  }
];

export const performanceMetrics = [
  { metric: "Graduation Rate", key: "graduationRate", target: 95, unit: "%" },
  { metric: "Employment Rate", key: "employmentRate", target: 90, unit: "%" },
  { metric: "International Students", key: "internationalStudents", target: 25, unit: "%" },
  { metric: "Research Projects", key: "researchProjects", target: 60, unit: "" }
];

export const colorMap = {
  blue: { bg: "bg-blue-100", text: "text-blue-600", iconBg: "bg-blue-100" },
  green: { bg: "bg-green-100", text: "text-green-600", iconBg: "bg-green-100" },
  purple: { bg: "bg-purple-100", text: "text-purple-600", iconBg: "bg-purple-100" },
  orange: { bg: "bg-orange-100", text: "text-orange-600", iconBg: "bg-orange-100" }
};
