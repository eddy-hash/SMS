import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

const ResultsTable = ({ results, onDelete }) => {
  const getGradeBadge = (grade, marks) => {
    if (!grade) return 'bg-gray-100 text-gray-600';
    if (marks >= 75) return 'bg-green-100 text-green-700';
    if (marks >= 60) return 'bg-blue-100 text-blue-700';
    if (marks >= 50) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  if (results.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
        <p className="text-gray-500">No results available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reg No</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {results.map((result) => (
            <tr key={result.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-sm text-gray-800">{result.student_name}</td>
              <td className="px-4 py-3 text-sm font-mono text-gray-600">{result.registration_number}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{result.course_code}</td>
              <td className="px-4 py-3 text-sm font-semibold">{result.marks}%</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getGradeBadge(result.grade, result.marks)}`}>
                  {result.grade || '-'}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{result.exam_type}</td>
              <td className="px-4 py-3">
                <button onClick={() => onDelete(result.id)} className="text-red-600 hover:text-red-800">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
