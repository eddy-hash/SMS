import React, { useState, useEffect, useMemo } from 'react';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, UsersIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../services/api';
import { StaffStats, StaffTable, StaffForm, StaffViewModal } from '../components/staff';

const Staff = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [viewingStaff, setViewingStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [stats, setStats] = useState({ total: 0, teachers: 0, administrative: 0, departments: 0, leadership: 0, bursars: 0 });

  const isAdmin = user?.role === 'admin' || user?.role === 'principal' || user?.is_staff;

  useEffect(() => { fetchStaff(); fetchStats(); }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get('/staff/list');
      setStaff(response.data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to load staff data');
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/staff/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSave = async (formData) => {
    const toastId = toast.loading(editingStaff ? 'Updating...' : 'Adding...');
    try {
      if (editingStaff) {
        await api.put(`/staff/${editingStaff.id}`, formData);
      } else {
        await api.post('/staff/create', formData);
      }
      toast.success(editingStaff ? 'Staff updated!' : 'Staff added!', { id: toastId });
      await fetchStaff();
      await fetchStats();
      setShowForm(false);
      setEditingStaff(null);
    } catch (error) {
      toast.error('Operation failed', { id: toastId });
    }
  };

  const handleDelete = async (id, name) => {
    const toastId = toast.loading('Deleting...');
    try {
      await api.delete(`/staff/${id}`);
      toast.success(`${name} removed`, { id: toastId });
      await fetchStaff();
      await fetchStats();
    } catch (error) {
      toast.error('Delete failed', { id: toastId });
    }
  };

  const handleView = (staffMember) => setViewingStaff(staffMember);
  const handleAddClick = () => { setEditingStaff(null); setShowForm(true); };

  const filteredStaff = useMemo(() => {
    if (!staff.length) return [];
    return staff.filter(member => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = searchTerm === '' || 
        (member.full_name || '').toLowerCase().includes(searchLower) ||
        (member.email || '').toLowerCase().includes(searchLower) ||
        (member.staff_code || '').toLowerCase().includes(searchLower);
      
      const roleMap = {
        teacher: ['TEACHER', 'LECTURER', 'TCH', 'LEC'],
        hod: ['HOD'],
        dean: ['DEAN'],
        principal: ['PRINCIPAL', 'PRN'],
        staff: ['STAFF'],
        admin: ['ADMIN', 'ADM'],
        bursar: ['BURSAR', 'BUR']
      };
      const matchRole = filterRole === 'all' || (roleMap[filterRole] || []).includes(member.role);
      
      return matchSearch && matchRole;
    });
  }, [staff, searchTerm, filterRole]);

  const getRoleDisplay = () => {
    const roles = {
      teacher: 'Teachers & Lecturers', hod: 'Head of Departments', dean: 'Deans',
      principal: 'Principals', staff: 'Staff', admin: 'Administrators', bursar: 'Bursars'
    };
    return roles[filterRole] || 'All Staff';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (staff.length === 0 && !searchTerm && filterRole === 'all') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b px-4 sm:px-6 md:px-8 py-4 sm:py-6">
          <div className="flex justify-between items-center">
            <div><h1 className="text-xl sm:text-2xl font-bold">Staff Management</h1><p className="text-xs text-gray-500 mt-1">Manage faculty and administrative staff</p></div>
            {isAdmin && <button onClick={handleAddClick} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"><PlusIcon className="h-5 w-5" />Add Staff</button>}
          </div>
        </div>
        <div className="px-4 sm:px-6 md:px-8 py-12">
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center"><UsersIcon className="h-10 w-10 text-gray-400" /></div>
            <h3 className="text-lg font-semibold mb-2">No staff members found</h3>
            <p className="text-gray-500 mb-6">Click the "Add Staff" button to get started.</p>
            {isAdmin && <button onClick={handleAddClick} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"><PlusIcon className="h-5 w-5" />Add Staff</button>}
          </div>
        </div>
        {showForm && <StaffForm staff={editingStaff} onSubmit={handleSave} onClose={() => { setShowForm(false); setEditingStaff(null); }} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 sm:px-6 md:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div><h1 className="text-xl sm:text-2xl font-bold">Staff Management</h1><p className="text-xs text-gray-500">Manage faculty, administrative staff, and leadership members</p></div>
          {isAdmin && <button onClick={handleAddClick} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"><PlusIcon className="h-5 w-5" />Add Staff</button>}
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-8 py-6">
        <StaffStats stats={stats} />

        {staff.length > 0 && (
          <>
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Search by name, email, or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm" />
              </div>
              <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">
                <option value="all">All Staff</option>
                <option value="teacher">Teachers & Lecturers</option>
                <option value="hod">Head of Departments</option>
                <option value="dean">Deans</option>
                <option value="principal">Principals</option>
                <option value="staff">Staff</option>
                <option value="admin">Administrators</option>
                <option value="bursar">Bursars</option>
              </select>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-100">
              <div className="flex justify-between items-center">
                <div><h4 className="text-sm font-semibold">Filter Results</h4><p className="text-xs text-gray-500">{searchTerm ? `Showing "${searchTerm}"` : `Showing ${getRoleDisplay().toLowerCase()}`}</p></div>
                <div className="flex items-center gap-4">
                  <div className="text-right"><p className="text-2xl font-bold text-blue-600">{filteredStaff.length}</p><p className="text-xs text-gray-500">staff found</p></div>
                  {(searchTerm || filterRole !== 'all') && <button onClick={() => { setSearchTerm(''); setFilterRole('all'); }} className="text-xs text-blue-600 hover:text-blue-700">Clear</button>}
                </div>
              </div>
            </div>

            {filteredStaff.length > 0 ? (
              <>
                <StaffTable staff={filteredStaff} onEdit={(s) => { setEditingStaff(s); setShowForm(true); }} onDelete={handleDelete} onView={handleView} isAdmin={isAdmin} />
                
                <div className="mt-4 bg-white rounded-lg border p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-semibold">Staff List Summary</h4>
                    <span className="text-xs text-gray-500">Total: {filteredStaff.length}</span>
                  </div>
                  <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                    {filteredStaff.map(member => (
                      <li key={member.id} className="py-2 flex justify-between items-center hover:bg-gray-50 px-2 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">{(member.full_name || member.first_name || 'S').charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="text-sm text-gray-700">{member.full_name || `${member.first_name} ${member.last_name}`}</span>
                        </div>
                        <span className="text-xs text-gray-400 font-mono">{member.staff_code}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl border p-12 text-center">
                <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No matching staff found</h3>
                {(searchTerm || filterRole !== 'all') && <button onClick={() => { setSearchTerm(''); setFilterRole('all'); }} className="text-blue-600 text-sm">Clear all filters</button>}
              </div>
            )}
          </>
        )}
      </div>

      {showForm && <StaffForm staff={editingStaff} onSubmit={handleSave} onClose={() => { setShowForm(false); setEditingStaff(null); }} />}
      {viewingStaff && <StaffViewModal staff={viewingStaff} onClose={() => setViewingStaff(null)} />}
    </div>
  );
};

export default Staff;