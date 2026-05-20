import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ArrowPathIcon, PlusIcon, CloudArrowUpIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ResultsTable from './components/ResultsTable';
import AddResultModal from './components/AddResultModal';
import UploadModal from './components/UploadModal';
import StatCard from './components/StatCard';

const TeacherResults = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const academicYears = ['2022-2023', '2023-2024', '2024-2025', '2025-2026', '2026-2027'];

  useEffect(() => {
    fetchResults();
    fetchStats();
  }, [selectedYear, selectedSemester]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await api.get('/results/teacher/results', {
        params: { academic_year: selectedYear, semester: selectedSemester },
      });
      setResults(response.data.results || []);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/analytics/teacher-dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/delete/result/${id}`);
        fetchResults();
        fetchStats();
      } catch (error) {
        console.error('Error deleting result:', error);
      }
    }
  };

  const filteredResults = results.filter(r =>
    r.student_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Results" value={stats.total_results || 0} color="blue" />
          <StatCard title="Average Marks" value={`${stats.average_marks || 0}%`} color="green" />
          <StatCard title="Pass Rate" value={`${stats.pass_rate || 0}%`} color="orange" />
          <StatCard title="This Semester" value={stats.semester_results || 0} color="purple" />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select Year</option>
            {academicYears.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
          
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
          
          <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2">
            <PlusIcon className="h-4 w-4" /> Add Result
          </button>
          
          <button onClick={() => setShowUploadModal(true)} className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg flex items-center justify-center gap-2">
            <CloudArrowUpIcon className="h-4 w-4" /> Bulk Upload
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search results..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {/* Results Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <ResultsTable results={filteredResults} onDelete={handleDelete} />
      )}

      {/* Modals */}
      <AddResultModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchResults} />
      <UploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} onSuccess={fetchResults} />
    </div>
  );
};

export default TeacherResults;
