import React, { useState, useMemo } from "react";
import {
  PencilIcon,
  TrashIcon,
  KeyIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const StudentTable = ({
  students = [],
  departments = [],
  courses = [],
  onEdit,
  onDelete,
  onResetPassword,
}) => {
  const [expanded, setExpanded] = useState({});
  const [view, setView] = useState("grouped");
  const [selectedDept, setSelectedDept] = useState("all");

  const colorPatterns = [
    "bg-blue-50 hover:bg-blue-100",
    "bg-green-50 hover:bg-green-100",
    "bg-purple-50 hover:bg-purple-100",
    "bg-yellow-50 hover:bg-yellow-100",
    "bg-pink-50 hover:bg-pink-100",
    "bg-indigo-50 hover:bg-indigo-100",
  ];

  const departmentMap = useMemo(() => {
    const map = {};
    if (Array.isArray(departments)) {
      departments.forEach((dept) => {
        map[dept.id] = dept.name;
      });
    }
    return map;
  }, [departments]);

  const courseMap = useMemo(() => {
    const map = {};
    if (Array.isArray(courses)) {
      courses.forEach((course) => {
        map[course.id] = course.course_name;
      });
    }
    return map;
  }, [courses]);

  const getDepartmentName = (student) => {
    if (!student) return "Unassigned";
    if (student.department_name && student.department_name !== "Unassigned")
      return student.department_name;
    if (student.department_id && departmentMap[student.department_id])
      return departmentMap[student.department_id];
    return "Unassigned";
  };

  // ✅ FIX: Use student.course_name if available (from backend join)
  const getCourseName = (student) => {
    if (!student) return "No Course";
    if (student.course_name) return student.course_name;               // <-- NEW LINE
    if (student.course_id && courseMap[student.course_id])
      return courseMap[student.course_id];
    return "No Course";
  };

  const grouped = useMemo(() => {
    const map = {};
    students.forEach((s) => {
      if (!s) return;
      const deptName = getDepartmentName(s);
      const id = s.department_id || "unassigned";
      if (!map[id]) map[id] = { id, name: deptName, students: [] };
      map[id].students.push(s);
    });
    return Object.values(map).sort((a, b) =>
      String(a.id).localeCompare(String(b.id))
    );
  }, [students, departments]);

  const filtered = useMemo(() => {
    if (selectedDept === "all") return students;
    return students.filter(
      (s) => (s?.department_id || "unassigned") === selectedDept
    );
  }, [students, selectedDept]);

  const toggle = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  if (!students || students.length === 0) {
    return <div className="text-center py-10 text-gray-400">No students found</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between bg-white p-3 rounded shadow">
        <div className="space-x-2">
          <button
            onClick={() => setView("grouped")}
            className={`px-3 py-1 rounded ${
              view === "grouped" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Grouped
          </button>
          <button
            onClick={() => setView("filtered")}
            className={`px-3 py-1 rounded ${
              view === "filtered" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Filtered
          </button>
        </div>
        {view === "filtered" && (
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="all">All</option>
            {Array.isArray(departments) &&
              departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
          </select>
        )}
      </div>

      {view === "grouped" &&
        grouped.map((dept) => (
          <div key={dept.id} className="bg-white rounded shadow overflow-hidden">
            <div
              onClick={() => toggle(dept.id)}
              className="flex justify-between items-center px-4 py-2 bg-gray-100 cursor-pointer hover:bg-gray-200"
            >
              <div className="flex items-center gap-2">
                {expanded[dept.id] ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
                <span className="font-semibold">
                  {dept.name} ({dept.students.length})
                </span>
              </div>
            </div>
            {expanded[dept.id] && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-200">
                        Registration
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-200">
                        Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-200">
                        Email
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-200">
                        Phone
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-200">
                        Course
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-200">
                        Year
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-200">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dept.students.map((student, idx) => (
                      <tr
                        key={student.id}
                        className={`${colorPatterns[idx % colorPatterns.length]} transition-colors`}
                      >
                        <td className="px-4 py-2 border-r border-gray-200">
                          {student.registration_number || "N/A"}
                        </td>
                        <td className="px-4 py-2 border-r border-gray-200">
                          {student.full_name}
                        </td>
                        <td className="px-4 py-2 border-r border-gray-200">
                          {student.email}
                        </td>
                        <td className="px-4 py-2 border-r border-gray-200">
                          {student.phone || "N/A"}
                        </td>
                        <td className="px-4 py-2 border-r border-gray-200">
                          {getCourseName(student)}
                        </td>
                        <td className="px-4 py-2 border-r border-gray-200">
                          Year {student.year_of_study || 1}
                        </td>
                        <td className="px-4 py-2 border-r border-gray-200">
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              student.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100"
                            }`}
                          >
                            {student.status || "active"}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right space-x-2">
                          <button
                            onClick={() => onEdit(student)}
                            className="text-blue-600"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onResetPassword(student)}
                            className="text-green-600"
                          >
                            <KeyIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDelete(student)}
                            className="text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}

      {view === "filtered" && (
        <div className="bg-white rounded shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-200">
                    Department
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-200">
                    Registration
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-200">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-200">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-200">
                    Phone
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-200">
                    Course
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-200">
                    Year
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-200">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student, idx) => (
                  <tr
                    key={student.id}
                    className={`${colorPatterns[idx % colorPatterns.length]} transition-colors`}
                  >
                    <td className="px-4 py-2 border-r border-gray-200">
                      {getDepartmentName(student)}
                    </td>
                    <td className="px-4 py-2 border-r border-gray-200">
                      {student.registration_number || "N/A"}
                    </td>
                    <td className="px-4 py-2 border-r border-gray-200">
                      {student.full_name}
                    </td>
                    <td className="px-4 py-2 border-r border-gray-200">
                      {student.email}
                    </td>
                    <td className="px-4 py-2 border-r border-gray-200">
                      {student.phone || "N/A"}
                    </td>
                    <td className="px-4 py-2 border-r border-gray-200">
                      {getCourseName(student)}
                    </td>
                    <td className="px-4 py-2 border-r border-gray-200">
                      Year {student.year_of_study || 1}
                    </td>
                    <td className="px-4 py-2 border-r border-gray-200">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          student.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100"
                        }`}
                      >
                        {student.status || "active"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <button
                        onClick={() => onEdit(student)}
                        className="text-blue-600"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onResetPassword(student)}
                        className="text-green-600"
                      >
                        <KeyIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(student)}
                        className="text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTable;