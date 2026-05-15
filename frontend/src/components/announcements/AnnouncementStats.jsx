import React from 'react';
import { MegaphoneIcon, EyeIcon, BellIcon, UsersIcon } from '@heroicons/react/24/outline';

const AnnouncementStats = ({ announcements, user }) => {
  const stats = [
    { label: 'Total', value: announcements.length, icon: MegaphoneIcon, color: 'blue' },
    { label: 'Unread', value: announcements.filter(a => !a.is_read).length, icon: EyeIcon, color: 'green' },
    { label: 'Urgent', value: announcements.filter(a => a.priority === 'urgent').length, icon: BellIcon, color: 'red' },
    { label: 'For You', value: announcements.filter(a => a.audience === 'all' || a.audience === user?.role).length, icon: UsersIcon, color: 'purple' }
  ];
  const colors = { blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600', red: 'bg-red-50 text-red-600', purple: 'bg-purple-50 text-purple-600' };
  return (
    <div className="grid grid-cols-4 gap-4 mt-6">
      {stats.map((s, i) => (
        <div key={i} className={`rounded-lg ${colors[s.color]} p-4`}>
          <div className="flex justify-between"><div><p className="text-sm">{s.label}</p><p className="text-2xl font-bold">{s.value}</p></div><s.icon className="h-8 w-8 opacity-50" /></div>
        </div>
      ))}
    </div>
  );
};
export default AnnouncementStats;
