import React from 'react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';

const StudentSearch = ({ search, setSearch, setPage, onAdd }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
      <div className="relative flex-1 max-w-md">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search by name, email, registration number or course..." 
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          value={search} 
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }} 
        />
      </div>
      <button 
        onClick={onAdd} 
        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <PlusIcon className="h-5 w-5" /> 
        Register New Student
      </button>
    </div>
  );
};

export default StudentSearch;