import React from 'react';

const PasswordStrengthMeter = ({ password }) => {
  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return { level: 'Weak', color: 'bg-red-500', textColor: 'text-red-600', width: '25%' };
    if (score <= 3) return { level: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-600', width: '50%' };
    if (score <= 4) return { level: 'Good', color: 'bg-blue-500', textColor: 'text-blue-600', width: '75%' };
    return { level: 'Strong', color: 'bg-green-500', textColor: 'text-green-600', width: '100%' };
  };

  const strength = getStrength();

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className={strength.textColor}>Password Strength: {strength.level}</span>
        <span className="text-gray-400">{password.length}/32</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 rounded-full ${strength.color}`}
          style={{ width: strength.width }}
        />
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;