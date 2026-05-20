import React from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const FloatingLabelInput = ({
  name,
  label,
  type,
  value,
  field,
  handleChange,
  handleFocus,
  handleBlur,
  togglePasswordVisibility,
  showPasswords,
  focused,
  error
}) => {
  const inputType = showPasswords[field] ? 'text' : type;
  const isFocused = focused[field];
  const hasValue = value.length > 0;
  const isLabelTop = isFocused || hasValue;

  return (
    <div className="relative">
      <input
        type={inputType}
        name={name}
        value={value}
        onChange={handleChange}
        onFocus={() => handleFocus(field)}
        onBlur={(e) => handleBlur(field, e.target.value)}
        className={`w-full px-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-all text-gray-900 relative z-10 bg-transparent
          ${isLabelTop ? 'pt-5 pb-1' : 'py-3'}
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-600 focus:border-blue-600'}
          `}
        required
      />

      <label
        className={`absolute left-3 transition-all duration-200 pointer-events-none bg-white px-1 z-20
          ${
            isLabelTop
              ? 'text-xs -top-2'
              : 'text-sm text-gray-500 top-1/2 -translate-y-1/2'
          }
          ${error ? 'text-red-500' : 'text-blue-600'}`}
      >
        {label}
      </label>

      <button
        type="button"
        onClick={() => togglePasswordVisibility(field)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-20"
      >
        {showPasswords[field] ? (
          <EyeSlashIcon className="h-5 w-5" />
        ) : (
          <EyeIcon className="h-5 w-5" />
        )}
      </button>
    </div>
  );
};

export default FloatingLabelInput;