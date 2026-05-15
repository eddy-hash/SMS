import React, { useState } from 'react';
import { TrashIcon, PencilIcon, StarIcon, EyeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../services/api';
import ConfirmationModal from '../common/ConfirmationModal';

const AnnouncementCard = ({ announcement, isAdmin, onEdit, onDelete, refresh }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleMarkAsRead = async () => {
    try {
      await api.post(`/announcements/${announcement.id}/mark-read`);
      toast.success('Marked as read', { icon: '👁️' });
      refresh();
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const getPriorityStyle = (priority) => {
    const styles = {
      urgent: 'bg-red-100 text-red-700',
      high: 'bg-orange-100 text-orange-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700'
    };
    return styles[priority] || styles.medium;
  };

  const getAudienceLabel = (audience) => {
    const labels = {
      students: '👨‍🎓 Students',
      teachers: '👨‍🏫 Teachers',
      staff: '👔 Staff',
      all: '👥 All Users'
    };
    return labels[audience] || labels.all;
  };

  return (
    <>
      <div className={`rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow ${announcement.is_pinned ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200'}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {announcement.is_pinned && <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"><StarIcon className="h-3 w-3" /> Pinned</span>}
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityStyle(announcement.priority)}`}>{announcement.priority?.toUpperCase()}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">{getAudienceLabel(announcement.audience)}</span>
              {!announcement.is_read && !isAdmin && <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">New</span>}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
            <p className="mt-2 text-gray-600">{announcement.content}</p>
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 flex-wrap">
              <span>👤 {announcement.author_name}</span>
              <span>📅 {new Date(announcement.created_at).toLocaleDateString()}</span>
              <span>👁️ {announcement.views || 0} views</span>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2 ml-4">
              <button onClick={onEdit} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600"><PencilIcon className="h-5 w-5" /></button>
              <button onClick={() => setShowConfirm(true)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"><TrashIcon className="h-5 w-5" /></button>
            </div>
          )}
        </div>
        {!isAdmin && !announcement.is_read && (
          <div className="mt-4">
            <button onClick={handleMarkAsRead} className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"><EyeIcon className="h-4 w-4" /> Mark as Read</button>
          </div>
        )}
      </div>
      <ConfirmationModal isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={() => { onDelete(announcement.id, announcement.title); setShowConfirm(false); }} title="Delete Announcement" message={`Are you sure you want to delete "${announcement.title}"?`} confirmText="Delete" type="danger" />
    </>
  );
};
export default AnnouncementCard;
