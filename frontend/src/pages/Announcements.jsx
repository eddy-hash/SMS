import React, { useState, useEffect } from 'react';
import { PlusIcon, MegaphoneIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../services/api';
import { AnnouncementCard, AnnouncementForm, AnnouncementStats, AnnouncementFilters } from '../components/announcements';

const Announcements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ title: '', content: '', category: 'general', priority: 'medium', audience: 'all' });

  const isAdmin = ['admin', 'staff', 'teacher'].includes(user?.role);

  useEffect(() => { fetchAnnouncements(); }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/announcements/');
      setAnnouncements(res.data || []);
    } catch (error) {
      toast.error('Failed to load');
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading(editing ? 'Updating...' : 'Creating...');
    try {
      if (editing) await api.put(`/announcements/${editing.id}`, form);
      else await api.post('/announcements/', form);
      toast.success(editing ? 'Updated!' : 'Created!', { id: toastId });
      await fetchAnnouncements();
      setShowModal(false);
      setEditing(null);
      setForm({ title: '', content: '', category: 'general', priority: 'medium', audience: 'all' });
    } catch (error) {
      toast.error('Failed', { id: toastId });
    }
  };

  const handleDelete = async (id, title) => {
    const toastId = toast.loading('Deleting...');
    try {
      await api.delete(`/announcements/${id}`);
      toast.success(`"${title}" deleted`, { id: toastId });
      await fetchAnnouncements();
    } catch (error) {
      toast.error('Delete failed', { id: toastId });
    }
  };

  const filtered = announcements.filter(a => {
    const matchFilter = filter === 'all' || a.priority === filter;
    const matchSearch = a.title?.toLowerCase().includes(search.toLowerCase()) || a.content?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-6">
        <div className="flex justify-between items-center">
          <div><h1 className="text-2xl font-bold">Announcements</h1><p className="text-sm text-gray-500">{isAdmin ? 'Manage announcements' : 'Stay updated'}</p></div>
          {isAdmin && <button onClick={() => { setEditing(null); setForm({ title: '', content: '', category: 'general', priority: 'medium', audience: 'all' }); setShowModal(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"><PlusIcon className="h-4 w-4" /> New</button>}
        </div>
        <AnnouncementStats announcements={announcements} user={user} />
      </div>
      <AnnouncementFilters filter={filter} setFilter={setFilter} search={search} setSearch={setSearch} />
      <div className="px-8 py-6">
        {loading ? <div className="text-center py-12">Loading...</div> : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg"><MegaphoneIcon className="h-12 w-12 mx-auto text-gray-400" /><p className="mt-2">No announcements</p>{isAdmin && <button onClick={() => setShowModal(true)} className="mt-4 text-blue-600">Create one</button>}</div>
        ) : (
          <div className="space-y-4">{filtered.map(a => <AnnouncementCard key={a.id} announcement={a} isAdmin={isAdmin} onEdit={() => { setEditing(a); setForm({ title: a.title, content: a.content, category: a.category, priority: a.priority, audience: a.audience }); setShowModal(true); }} onDelete={handleDelete} refresh={fetchAnnouncements} />)}</div>
        )}
      </div>
      {showModal && <AnnouncementForm form={form} setForm={setForm} editing={editing} onSubmit={handleSubmit} onClose={() => { setShowModal(false); setEditing(null); }} />}
    </div>
  );
};
export default Announcements;
