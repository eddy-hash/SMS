// src/components/common/ConfirmationModal.jsx
import React from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', cancelText = 'Cancel', type = 'danger' }) => {
  if (!isOpen) return null;

  const colors = {
    danger: {
      button: 'bg-red-600 hover:bg-red-700',
      icon: 'text-red-600',
      bg: 'bg-red-50'
    },
    warning: {
      button: 'bg-yellow-600 hover:bg-yellow-700',
      icon: 'text-yellow-600',
      bg: 'bg-yellow-50'
    },
    info: {
      button: 'bg-blue-600 hover:bg-blue-700',
      icon: 'text-blue-600',
      bg: 'bg-blue-50'
    }
  };

  const color = colors[type] || colors.danger;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
          <div className="absolute right-4 top-4">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${color.bg}`}>
                <ExclamationTriangleIcon className={`h-6 w-6 ${color.icon}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            
            <p className="mt-4 text-sm text-gray-600">{message}</p>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${color.button}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
