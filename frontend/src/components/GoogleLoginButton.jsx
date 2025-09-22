import React from 'react';
import { Chrome, Loader2 } from 'lucide-react';

const GoogleLoginButton = ({ isLoading, onClick, className = '' }) => {
  const handleClick = () => {
    if (!isLoading && onClick) {
      onClick();
    } else {
      // Direct OAuth flow
      window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/auth/google`;
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        relative flex items-center justify-center w-full px-4 py-3
        bg-white dark:bg-gray-800 
        border border-gray-300 dark:border-gray-600
        rounded-lg shadow-sm
        text-gray-700 dark:text-gray-200
        hover:bg-gray-50 dark:hover:bg-gray-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        font-medium
        ${className}
      `}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <Chrome className="w-5 h-5 mr-3" />
          Sign in with Google
        </>
      )}
    </button>
  );
};

export default GoogleLoginButton;