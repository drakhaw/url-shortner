import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthData } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      navigate('/login?error=' + encodeURIComponent(getErrorMessage(error)));
      return;
    }

    if (token) {
      // Store token and redirect to dashboard
      localStorage.setItem('token', token);
      
      // Decode the token to get user info (simple base64 decode)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userData = {
          id: payload.userId,
          email: payload.email,
          role: payload.role
        };
        
        if (setAuthData) {
          setAuthData(token, userData);
        }
        
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('Token decode error:', error);
        localStorage.removeItem('token');
        navigate('/login?error=invalid_token');
      }
    } else {
      navigate('/login?error=no_token');
    }
  }, [searchParams, navigate, setAuthData]);

  const getErrorMessage = (error) => {
    switch (error) {
      case 'oauth_failed':
        return 'Authentication failed. Please try again.';
      case 'callback_failed':
        return 'Authentication callback failed. Please try again.';
      case 'access_denied':
        return 'Access denied. You need to be invited by an administrator.';
      default:
        return 'Authentication error occurred. Please try again.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="animate-pulse">
          <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Completing sign in...
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Please wait while we complete your authentication.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;