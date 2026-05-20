// src/pages/teacher/TeacherTimetable.jsx
import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TeacherTimetable = () => {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = ['8:00 - 10:00', '10:00 - 12:00', '12:00 - 14:00', '14:00 - 16:00', '16:00 - 18:00'];

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const response = await api.get('/timetable/teacher');
      setTimetable(response.data.timetable || []);
    } catch (error) {
      console.error('Failed to load timetable:', error);
      // Sample data for demo
      setTimetable([
        { id: 1, day: 'Monday', time: '8:00 - 10:00', course: 'CS101', room: 'Room 201', students: 35 },
        { id: 2, day: 'Monday', time: '10:00 - 12:00', course: 'CS102', room: 'Lab 3', students: 30 },
        { id: 3, day: 'Tuesday', time: '14:00 - 16:00', course: 'CS103', room: 'Room 105', students: 28 },
        { id: 4, day: 'Wednesday', time: '8:00 - 10:00', course: 'CS101', room: 'Room 201', students: 35 },
        { id: 5, day: 'Thursday', time: '10:00 - 12:00', course: 'CS102', room: 'Lab 3', students: 30 },
        { id: 6, day: 'Friday', time: '14:00 - 16:00', course: 'CS104', room: 'Room 301', students: 25 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getTimetableForDay = (day) => {
    return timetable.filter(item => item.day === day);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Timetable</h1>
        <p className="text-gray-600 mt-1">Weekly teaching schedule</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                {days.map(day => (
                  <th key={day} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {timeSlots.map((timeSlot) => (
                <tr key={timeSlot} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      {timeSlot}
                    </div>
                  </td>
                  {days.map((day) => {
                    const classItem = timetable.find(
                      item => item.day === day && item.time === timeSlot
                    );
                    return (
                      <td key={day} className="px-6 py-4">
                        {classItem ? (
                          <div className="bg-emerald-50 rounded-lg p-2">
                            <p className="font-semibold text-gray-800">{classItem.course}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                              <MapPinIcon className="h-3 w-3" />
                              <span>{classItem.room}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                              <UserGroupIcon className="h-3 w-3" />
                              <span>{classItem.students} students</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-300 text-sm text-center">-</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-blue-600" />
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This timetable is for the current semester. Any changes will be communicated by the department.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherTimetable;