import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  const handleClick = (e) => {
    e.preventDefault();
    toggleTheme();
  };

  return (
    <button
      onClick={handleClick}
      className={`
        relative inline-flex items-center justify-center
        w-10 h-10 rounded-lg
        bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
        text-gray-600 dark:text-gray-400
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
        ${className}
      `}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={`
            absolute inset-0 w-5 h-5 
            transform transition-all duration-300
            ${isDark ? 'scale-0 rotate-180 opacity-0' : 'scale-100 rotate-0 opacity-100'}
          `} 
        />
        <Moon 
          className={`
            absolute inset-0 w-5 h-5
            transform transition-all duration-300
            ${isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-180 opacity-0'}
          `} 
        />
      </div>
    </button>
  );
};

export default ThemeToggle;