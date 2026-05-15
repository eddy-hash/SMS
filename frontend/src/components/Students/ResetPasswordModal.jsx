import React from 'react';

const ResetPasswordModal = ({ resetTarget, setResetTarget, onReset }) => {
  if (!resetTarget) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Reset Password</h2>
          <p className="text-gray-600 mb-6">
            Reset password for <span className="font-semibold">{resetTarget.full_name}</span>? 
            A new password will be sent to their email.
          </p>
          <div className="flex gap-3">
            <button 
              onClick={() => setResetTarget(null)} 
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onReset} 
              className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Reset Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;