import React from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const PasswordRequirements = ({ password }) => {
  const requirements = [
    { label: 'At least 8 characters', test: password.length >= 8 },
    { label: 'At least 12 characters (strong)', test: password.length >= 12 },
    { label: 'Contains uppercase letter', test: /[A-Z]/.test(password) },
    { label: 'Contains number', test: /[0-9]/.test(password) },
    { label: 'Contains special character (!@#$%^&*)', test: /[^A-Za-z0-9]/.test(password) },
  ];

  if (!password) return null;

  return (
    <div className="mt-2 p-2 bg-gray-50 rounded-lg">
      <p className="text-xs font-medium text-gray-700 mb-1">Password Requirements:</p>
      <ul className="space-y-0.5">
        {requirements.map((req, idx) => (
          <li key={idx} className="flex items-center gap-1.5 text-xs">
            {req.test ? (
              <CheckCircleIcon className="h-3 w-3 text-green-500" />
            ) : (
              <XCircleIcon className="h-3 w-3 text-gray-300" />
            )}
            <span className={req.test ? 'text-green-600' : 'text-gray-400'}>
              {req.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordRequirements;