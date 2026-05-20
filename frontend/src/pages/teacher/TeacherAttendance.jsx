import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ArrowPathIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const TeacherAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => {
    if (selectedCourse) fetchAttendance();
  }, [selectedCourse, selectedDate]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await api.get('/attendance/teacher', {
        params: { course_id: selectedCourse, date: selectedDate },
      });
      setAttendance(response.data.attendance || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAttendance = async (studentId, status) => {
    try {
      await api.post('/attendance/mark', {
        student_id: studentId,
        course_id: selectedCourse,
        date: selectedDate,
        status,
      });
      fetchAttendance();
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold">Mark Attendance</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        />
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">Select Course</option>
          {/* Add courses here */}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reg Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {attendance.map((item) => (
                <tr key={item.student_id}>
                  <td className="px-6 py-4 text-sm text-gray-800">{item.student_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.registration_number}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.status || 'Not Marked'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button onClick={() => updateAttendance(item.student_id, 'present')} className="p-1 bg-green-100 rounded">
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    </button>
                    <button onClick={() => updateAttendance(item.student_id, 'absent')} className="p-1 bg-red-100 rounded">
                      <XCircleIcon className="h-5 w-5 text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendance;
