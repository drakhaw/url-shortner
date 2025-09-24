import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link, AlertCircle } from 'lucide-react';
import GoogleLoginButton from '../components/GoogleLoginButton';
import ThemeToggle from '../components/ThemeToggle';

const LoginPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [searchParams] = useSearchParams();
  const { isDark } = useTheme();
  const [error, setError] = useState(null);
  
  // Redirect authenticated users immediately
  React.useEffect(() => {
    if (isAuthenticated && user) {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);


  // Don't render login form if already authenticated - let useEffect handle redirect
  if (isAuthenticated && user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link className="w-12 h-12 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Sign in to LinkShort
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Sign in with Google to get started
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900 p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <div className="text-sm text-red-700 dark:text-red-200">{error}</div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <GoogleLoginButton />
          </div>

          <div className="mt-6">
            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              <p>You need to be invited by an administrator to access this application.</p>
              <p className="mt-1">Contact your admin if you don't have access.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;