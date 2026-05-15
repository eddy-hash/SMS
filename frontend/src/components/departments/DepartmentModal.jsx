import React from 'react';

import { XMarkIcon } from '@heroicons/react/24/outline';

const DepartmentModal = ({ isOpen, onClose, onSubmit, editingDept, formData, onChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {editingDept ? 'Edit Department' : 'Add New Department'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Name *
            </label>
            <input
              type="text"
              name="department_name"
              value={formData.name}
              onChange={onChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Computer Science"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Code *
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={onChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., CS"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Department description..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingDept ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentModal;