import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await api.get('/student/attendance');
        if (response.data.success) {
          setAttendance(response.data.attendance || []);
        }
      } catch (error) {
        console.error('Attendance error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  if (loading) return <div className="text-center py-8">Loading attendance...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Attendance</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Classes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Present</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendance.map((item, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4 text-sm">{item.course_name}</td>
                <td className="px-6 py-4 text-sm">{item.total_classes}</td>
                <td className="px-6 py-4 text-sm">{item.present}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    item.percentage >= 75 ? 'bg-green-100 text-green-800' :
                    item.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.percentage}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {attendance.length === 0 && <p className="text-center py-8 text-gray-500">No attendance records found.</p>}
      </div>
    </div>
  );
};

export default StudentAttendance;
