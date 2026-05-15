import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';

const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className="relative inline-flex items-center justify-center p-2 rounded-lg transition-all duration-300 
        bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
      aria-label="Toggle dark mode"
    >
      <div className="relative w-5 h-5">
        <SunIcon 
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 transform ${
            darkMode ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          } text-yellow-500`}
        />
        <MoonIcon 
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 transform ${
            darkMode ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          } text-blue-400`}
        />
      </div>
    </button>
  );
};

export default DarkModeToggle;
