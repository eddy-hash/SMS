import { CalendarIcon } from "@heroicons/react/24/outline";

const DashboardHeader = ({ username }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            <span className="text-blue-600">EAU</span> Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {username || "Administrator"}! Here's your university overview.
          </p>
        </div>
        <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarIcon className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;