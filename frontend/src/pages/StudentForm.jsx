import React, { useState, useEffect } from "react";
import StudentTable from "../components/StudentTable";
import StudentForm from "../components/StudentForm";
import api from "../services/api";
import toast from "react-hot-toast";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [search, setSearch] = useState("");

  /* ---------------- Fetch Students ---------------- */

  const fetchStudents = async (signal) => {
    try {
      setLoading(true);

      const res = await api.get(
        `/students/list?page=${page}&per_page=10&search=${search}`,
        { signal }
      );

      const data = res.data;

      setStudents(data.data || []);
      setTotalPages(data.pagination?.total_pages || 1);
      setTotalItems(data.pagination?.total || 0);

    } catch (error) {
      if (error.name !== "CanceledError") {
        toast.error("Failed to load students");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchStudents(controller.signal);

    return () => controller.abort();
  }, [page, search]);


  const handleAddStudent = () => {
    setEditingStudent(null);
    setIsFormOpen(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  const handleDeleteStudent = async (student) => {
    if (!window.confirm(`Delete ${student.full_name}?`)) return;

    const backup = students;

    setStudents((prev) => prev.filter((s) => s.id !== student.id));

    try {
      await api.delete(`/students/${student.id}`);
      toast.success("Student deleted");
    } catch (error) {
      setStudents(backup); 
      toast.error("Delete failed");
    }
  };

  const handleResetPassword = async (student) => {
    if (!window.confirm(`Reset password for ${student.full_name}?`)) return;

    try {
      const res = await api.put(`/students/${student.id}/reset-password`);
      toast.success(`New password: ${res.data.new_password}`);
    } catch {
      toast.error("Reset failed");
    }
  };

  const handleSubmitForm = async (formData) => {
    try {
      if (editingStudent) {
        await api.put(`/students/${editingStudent.id}`, formData);
        toast.success("Updated successfully");
      } else {
        await api.post("/students/create", formData);
        toast.success("Student created");
      }

      setIsFormOpen(false);
      fetchStudents();

    } catch (error) {
      toast.error(error.response?.data?.detail || "Save failed");
      throw error;
    }
  };

  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-2xl font-bold">Student Management</h1>
          <p className="text-sm text-gray-500">
            Total: {totalItems} students
          </p>
        </div>

        <button
          onClick={handleAddStudent}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Student
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="w-full md:w-80 px-3 py-2 border rounded-lg"
        />
      </div>

      {loading ? (
        <div className="flex justify-center h-60 items-center">
          <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full"></div>
        </div>
      ) : (
        <StudentTable
          students={students}
          onEdit={handleEditStudent}
          onDelete={handleDeleteStudent}
          onResetPassword={handleResetPassword}
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={10}
          onPageChange={setPage}
        />
      )}

      {/* Form */}
      <StudentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitForm}
        editingStudent={editingStudent}
      />
    </div>
  );
};

export default Students;