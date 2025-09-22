import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';

const RedirectHandler = () => {
  const { slug } = useParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleRedirect = () => {
      if (slug) {
        // Directly redirect to backend endpoint which will handle the redirect
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/${slug}`;
      }
    };

    // Add a small delay to show the loading screen briefly
    const timeout = setTimeout(handleRedirect, 500);
    return () => clearTimeout(timeout);
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <a
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Redirecting...</h1>
        <p className="text-gray-600">Please wait while we redirect you to your destination.</p>
      </div>
    </div>
  );
};

export default RedirectHandler;