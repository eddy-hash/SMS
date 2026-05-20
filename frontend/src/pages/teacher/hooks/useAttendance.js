import { useState, useEffect } from 'react';
import api from '../../../services/api';

export const useAttendance = (courseId, date) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (courseId && date) fetchAttendance();
  }, [courseId, date]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await api.get('/attendance/teacher', { params: { course_id: courseId, date } });
      setAttendance(response.data.attendance || []);
    } catch (err) {
      setError(err.response?.data?.detail);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (studentId, status) => {
    try {
      await api.post('/attendance/mark', { student_id: studentId, course_id: courseId, date, status });
      await fetchAttendance();
    } catch (err) {
      setError(err.response?.data?.detail);
      throw err;
    }
  };

  return { attendance, loading, error, markAttendance, refetch: fetchAttendance };
};

export default useAttendance;
