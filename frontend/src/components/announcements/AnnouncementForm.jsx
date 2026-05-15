import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const AnnouncementForm = ({ form, setForm, editing, onSubmit, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{editing ? 'Edit Announcement' : 'Create New Announcement'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6" /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder="Enter announcement title" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Content *</label><textarea required rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder="Enter announcement content" /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2"><option value="general">📢 General</option><option value="academic">📚 Academic</option><option value="event">🎉 Event</option><option value="administrative">📋 Administrative</option><option value="urgent">⚠️ Urgent</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Priority</label><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2"><option value="low">🟢 Low</option><option value="medium">🟡 Medium</option><option value="high">🟠 High</option><option value="urgent">🔴 Urgent</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Audience</label><select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2"><option value="all">🌍 Everyone</option><option value="students">👨‍🎓 Students</option><option value="teachers">👨‍🏫 Teachers</option><option value="staff">👔 Staff</option></select></div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editing ? 'Update' : 'Publish'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AnnouncementForm;
