import React from 'react';

const Pagination = ({ page, totalPages, setPage }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
      <button 
        disabled={page === 1} 
        onClick={() => setPage(p => p - 1)} 
        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
      >
        Previous
      </button>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <select 
          value={page} 
          onChange={(e) => setPage(parseInt(e.target.value))}
          className="px-2 py-1 border rounded-md text-sm"
        >
          {[...Array(totalPages)].map((_, i) => (
            <option key={i} value={i+1}>Page {i+1}</option>
          ))}
        </select>
      </div>
      <button 
        disabled={page === totalPages} 
        onClick={() => setPage(p => p + 1)} 
        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;