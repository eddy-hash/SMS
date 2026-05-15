import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import StudentStats from '../components/Students/StudentStats';
import StudentSearch from '../components/Students/StudentSearch';
import StudentTable from '../components/Students/StudentTable';
import StudentForm from '../components/Students/StudentForm';
import DeleteConfirmationModal from '../components/Students/DeleteConfirmationModal';
import ResetPasswordModal from '../components/Students/ResetPasswordModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    departments: 0,
    courses: 0
  });

  const itemsPerPage = 10;

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [studentsRes, deptsRes, coursesRes] = await Promise.all([
        api.get('/list'),
        api.get('/list/departments'),
        api.get('/list/courses')
      ]);
      
      let studentsData = [];
      if (studentsRes.data && Array.isArray(studentsRes.data.students)) {
        studentsData = studentsRes.data.students;
      } else if (Array.isArray(studentsRes.data)) {
        studentsData = studentsRes.data;
      } else if (studentsRes.data && Array.isArray(studentsRes.data.data)) {
        studentsData = studentsRes.data.data;
      }
      setStudents(studentsData);
      
      const departmentsData = deptsRes.data.departments || deptsRes.data || [];
      setDepartments(departmentsData);
      
      const coursesData = coursesRes.data.courses || coursesRes.data || [];
      setCourses(coursesData);
      
      setStats({
        total: studentsData.length,
        active: studentsData.filter(s => s.status === 'active').length,
        departments: departmentsData.length,
        courses: coursesData.length
      });
      
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const generateRegistrationNumber = async (departmentId, courseId) => {
    try {
      const response = await api.get('/students/generate-reg-number', {
        params: { department_id: departmentId, course_id: courseId }
      });
      return response.data.registration_number;
    } catch (err) {
      console.error('Error generating registration number:', err);
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return `EAU/${year}/${random}`;
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingStudent) {
        await api.put(`/students/${editingStudent.id}`, formData);
        toast.success('Student updated successfully');
      } else {
        let studentData = { ...formData };
        
        if (!studentData.reg_number) {
          toast.loading('Generating registration number...', { id: 'reg-gen' });
          const regNumber = await generateRegistrationNumber(
            studentData.department_id, 
            studentData.course_id
          );
          studentData.reg_number = regNumber;
          toast.dismiss('reg-gen');
        }
        
        await api.post('/students/create', studentData);
        toast.success(`Student registered! Reg Number: ${studentData.reg_number}`);
      }
      setModalOpen(false);
      setEditingStudent(null);
      fetchAllData();
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(err.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/students/${deleteTarget.id}`);
      toast.success('Student deleted successfully');
      fetchAllData();
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.response?.data?.detail || 'Failed to delete student');
    }
  };

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    try {
      await api.post(`/students/${resetTarget.id}/reset-password`);
      toast.success(`Password reset email sent to ${resetTarget.email}`);
      setResetTarget(null);
    } catch (err) {
      console.error('Reset password error:', err);
      toast.error(err.response?.data?.detail || 'Failed to reset password');
    }
  };

  const filtered = students.filter(s =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.registration_number?.toLowerCase().includes(search.toLowerCase()) ||
    s.course_name?.toLowerCase().includes(search.toLowerCase())
  );
  
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
        <p className="text-gray-600 mt-1">Manage student records, registrations, and academic information</p>
      </div>

      <StudentStats stats={stats} />

      <StudentSearch 
        search={search}
        setSearch={setSearch}
        setPage={setPage}
        onAdd={() => {
          setEditingStudent(null);
          setModalOpen(true);
        }}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {paginated.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No students found</div>
            <button 
              onClick={() => setModalOpen(true)}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Click here to add your first student
            </button>
          </div>
        ) : (
          <>
            <StudentTable 
              students={paginated}
              departments={departments}
              courses={courses}
              onEdit={(student) => {
                setEditingStudent(student);
                setModalOpen(true);
              }}
              onDelete={setDeleteTarget}
              onResetPassword={setResetTarget}
            />
            
            <Pagination 
              page={page}
              totalPages={totalPages}
              setPage={setPage}
            />
          </>
        )}
      </div>

      <StudentForm
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingStudent(null);
        }}
        onSubmit={handleSubmit}
        editingStudent={editingStudent}
      />

      <DeleteConfirmationModal 
        deleteTarget={deleteTarget}
        setDeleteTarget={setDeleteTarget}
        onDelete={handleDelete}
      />

      <ResetPasswordModal 
        resetTarget={resetTarget}
        setResetTarget={setResetTarget}
        onReset={handleResetPassword}
      />
    </div>
  );
};

export default Students;