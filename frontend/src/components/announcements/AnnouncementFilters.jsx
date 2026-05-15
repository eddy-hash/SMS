import React from 'react';

const AnnouncementFilters = ({ filter, setFilter, search, setSearch }) => {
  const priorities = ['all', 'urgent', 'high', 'medium', 'low'];
  return (
    <div className="px-8 py-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {priorities.map(p => <button key={p} onClick={() => setFilter(p)} className={`px-4 py-1.5 rounded-full text-sm ${filter === p ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}>{p.toUpperCase()}</button>)}
        </div>
        <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="border rounded-lg px-4 py-1.5 w-64 text-sm" />
      </div>
    </div>
  );
};
export default AnnouncementFilters;
