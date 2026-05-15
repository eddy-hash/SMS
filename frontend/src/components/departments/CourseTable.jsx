import React from 'react';

const colorPatterns = [
  'bg-blue-50',
  'bg-green-50',
  'bg-purple-50',
];

const CourseTable = ({ courses, departmentName }) => {
  if (!courses || courses.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400">
        No courses found in {departmentName}.
        <button className="ml-2 text-blue-600 hover:text-blue-800">
          Add Course
        </button>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr className="border-b border-gray-300">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                Course Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                Course Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                Credits
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course, index) => (
              <tr 
                key={course.id} 
                className={`${colorPatterns[index % colorPatterns.length]} border-b border-gray-200 hover:bg-opacity-80 transition-colors`}
              >
                <td className="px-6 py-3 text-sm font-mono font-medium border-r border-gray-200">
                  {course.course_code}
                </td>
                <td className="px-6 py-3 text-sm border-r border-gray-200">
                  {course.course_name}
                </td>
                <td className="px-6 py-3 text-sm border-r border-gray-200">
                  {course.credits}
                </td>
                <td className="px-6 py-3">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseTable;