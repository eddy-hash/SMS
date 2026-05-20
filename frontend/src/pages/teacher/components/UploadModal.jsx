import React, { useState } from 'react';
import api from '../../../services/api';
import { XCircleIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

const UploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ academic_year: '', semester: '1', exam_type: 'Midterm' });
  const academicYears = ['2022-2023', '2023-2024', '2024-2025', '2025-2026'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('academic_year', formData.academic_year);
    data.append('semester', formData.semester);
    data.append('exam_type', formData.exam_type);
    try {
      await api.post('/upload/results/file', data);
      onSuccess();
      onClose();
      setFile(null);
      setFormData({ academic_year: '', semester: '1', exam_type: 'Midterm' });
    } catch (error) {
      console.error('Error uploading:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Bulk Upload Results</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircleIcon className="h-6 w-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <p className="text-sm text-gray-600">Upload CSV/Excel with columns: student_id, course_id, marks</p>
          <select required value={formData.academic_year} onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
            <option value="">Select Year</option>
            {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
            <option value="1">Semester 1</option><option value="2">Semester 2</option>
          </select>
          <select value={formData.exam_type} onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
            <option value="Quiz">Quiz</option><option value="Assignment">Assignment</option><option value="Midterm">Midterm</option><option value="Final">Final</option>
          </select>
          <input type="file" accept=".csv,.xlsx,.xls" onChange={(e) => setFile(e.target.files[0])} className="w-full px-3 py-2 border rounded-lg" />
          {file && <p className="text-sm text-green-600">Selected: {file.name}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{loading ? 'Uploading...' : 'Upload'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
