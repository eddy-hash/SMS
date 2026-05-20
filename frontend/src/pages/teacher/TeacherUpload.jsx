// src/pages/teacher/TeacherUpload.jsx
import React, { useState, useEffect } from 'react';
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  XCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TeacherUpload = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() + '-' + (new Date().getFullYear() + 1));
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [selectedExamType, setSelectedExamType] = useState('Midterm');
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const academicYears = [
    '2022-2023', '2023-2024', '2024-2025', '2025-2026', '2026-2027'
  ];

  const examTypes = ['Quiz', 'Assignment', 'Midterm', 'Final', 'Project', 'Lab', 'Exam'];

  useEffect(() => {
    fetchUploadHistory();
  }, []);

  const fetchUploadHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/upload/logs');
      setUploadHistory(response.data.logs || []);
    } catch (error) {
      console.error('Failed to load upload history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast.error('Please upload CSV or Excel file (.csv, .xlsx, .xls)');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    
    setSelectedFile(file);
    previewFile(file);
  };

  const previewFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post('/upload/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPreviewData(response.data);
      setShowPreview(true);
    } catch (error) {
      console.error('Failed to preview file:', error);
      toast.error('Could not preview file. Please check the format.');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('academic_year', selectedYear);
    formData.append('semester', selectedSemester);
    formData.append('exam_type', selectedExamType);

    try {
      const response = await api.post('/upload/results/file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      });

      toast.success(
        `Upload complete! ${response.data.processed_records} records processed successfully.`,
        { duration: 5000 }
      );
      
      // Reset form
      setSelectedFile(null);
      setPreviewData(null);
      setShowPreview(false);
      fetchUploadHistory();
      
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error.response?.data?.detail || 'Upload failed. Please check your file format.');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `student_id,course_id,marks
STU001,CS101,85
STU002,CS101,92
STU003,MATH101,78
STU004,PHY101,88
STU005,CS101,95`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'results_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Template downloaded!');
  };

  const getStatusBadge = (status) => {
    if (status === 'completed') {
      return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Completed</span>;
    } else if (status === 'failed') {
      return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Failed</span>;
    } else if (status === 'processing') {
      return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Processing</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{status}</span>;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Bulk Upload Results</h1>
        <p className="text-gray-600 mt-1">Upload student results in bulk using CSV or Excel files</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Upload File</h3>
            
            {/* File Format Info */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">File Format Requirements:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>Supported formats: CSV, Excel (.xlsx, .xls)</li>
                    <li>Required columns: <strong>student_id, course_id, marks</strong></li>
                    <li>Maximum file size: 10MB</li>
                    <li>Marks should be between 0 and 100</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* File Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400'
              }`}
            >
              {selectedFile ? (
                <div className="space-y-3">
                  <DocumentTextIcon className="h-12 w-12 text-emerald-600 mx-auto" />
                  <p className="font-medium text-gray-800">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewData(null);
                        setShowPreview(false);
                      }}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => document.getElementById('file-input').click()}
                      className="text-emerald-600 hover:text-emerald-700 text-sm"
                    >
                      Change File
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">Drag and drop your file here, or</p>
                  <button
                    onClick={() => document.getElementById('file-input').click()}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Browse Files
                  </button>
                  <p className="text-xs text-gray-400 mt-3">Supports CSV, Excel files up to 10MB</p>
                </div>
              )}
              <input
                id="file-input"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Upload Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                {academicYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>

              <select
                value={selectedExamType}
                onChange={(e) => setSelectedExamType(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                {examTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={downloadTemplate}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Download Template
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="h-4 w-4" />
                    Upload Results
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview Section */}
          {showPreview && previewData && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
              <h3 className="font-semibold text-gray-800 mb-4">Preview</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Student ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Course ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Marks</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Grade</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {previewData.preview?.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-sm">{row.student_id}</td>
                        <td className="px-4 py-2 text-sm">{row.course_id}</td>
                        <td className="px-4 py-2 text-sm">{row.marks}</td>
                        <td className="px-4 py-2 text-sm">{row.grade}</td>
                        <td className="px-4 py-2 text-sm">
                          {row.marks >= 50 ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircleIcon className="h-4 w-4" />
                              Pass
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600">
                              <XCircleIcon className="h-4 w-4" />
                              Fail
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {previewData.summary && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Total records: {previewData.summary.total} | 
                    Valid: {previewData.summary.valid} | 
                    Invalid: {previewData.summary.invalid}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upload History Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center justify-between">
              <span>Upload History</span>
              <button onClick={fetchUploadHistory} className="text-emerald-600 hover:text-emerald-700">
                <ArrowPathIcon className="h-4 w-4" />
              </button>
            </h3>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <ArrowPathIcon className="h-6 w-6 animate-spin text-emerald-600" />
              </div>
            ) : uploadHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <DocumentTextIcon className="h-12 w-12 mx-auto mb-2" />
                <p>No upload history</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {uploadHistory.map((log) => (
                  <div key={log.upload_id} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-sm text-gray-800 truncate flex-1">
                        {log.file_name}
                      </p>
                      {getStatusBadge(log.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <p>{log.academic_year}</p>
                      <p>Semester {log.semester}</p>
                      <p>Exam: {log.exam_type}</p>
                      <p>Successful: {log.successful_records}</p>
                      <p>Failed: {log.failed_records}</p>
                      <p className="col-span-2">{new Date(log.uploaded_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Instructions Card */}
      <div className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
        <h4 className="font-semibold text-gray-800 mb-3">📋 Instructions for Bulk Upload</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p className="font-medium text-gray-700 mb-2">Step 1: Download Template</p>
            <p>Click the "Download Template" button to get a CSV template with the correct format.</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-2">Step 2: Fill Data</p>
            <p>Add student IDs, course IDs, and marks. Do not change column headers.</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-2">Step 3: Select Options</p>
            <p>Choose academic year, semester, and exam type for the results.</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-2">Step 4: Upload</p>
            <p>Drag and drop or browse to select your file, then click "Upload Results".</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-800">
            ⚠️ <strong>Note:</strong> Uploading will overwrite existing results for the same student, course, academic year, semester, and exam type.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherUpload;