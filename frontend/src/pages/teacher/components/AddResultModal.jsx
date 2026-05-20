import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { XCircleIcon } from '@heroicons/react/24/outline';

const AddResultModal = ({ isOpen, onClose, onSuccess }) => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    academic_year: '',
    semester: '1',
    marks: '',
    exam_type: 'Midterm',
  });
  const [loading, setLoading] = useState(false);
  const academicYears = ['2022-2023', '2023-2024', '2024-2025', '2025-2026'];

  useEffect(() => {
    if (isOpen) {
      fetchStudents();
      fetchCourses();
    }
  }, [isOpen]);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses/teacher-courses');
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/upload/results/single', formData);
      onSuccess();
      onClose();
      setFormData({ student_id: '', course_id: '', academic_year: '', semester: '1', marks: '', exam_type: 'Midterm' });
    } catch (error) {
      console.error('Error adding result:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Add New Result</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <select required value={formData.student_id} onChange={(e) => setFormData({ ...formData, student_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
            <option value="">Select Student</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
          </select>
          <select required value={formData.course_id} onChange={(e) => setFormData({ ...formData, course_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
            <option value="">Select Course</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.course_code} - {c.course_name}</option>)}
          </select>
          <select required value={formData.academic_year} onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
            <option value="">Select Year</option>
            {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
          <input type="number" placeholder="Marks" required value={formData.marks} onChange={(e) => setFormData({ ...formData, marks: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
          <select value={formData.exam_type} onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
            <option value="Quiz">Quiz</option>
            <option value="Assignment">Assignment</option>
            <option value="Midterm">Midterm</option>
            <option value="Final">Final</option>
          </select>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{loading ? 'Uploading...' : 'Upload'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddResultModal;
