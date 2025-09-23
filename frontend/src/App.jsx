import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import DashboardPage from './pages/DashboardPage';
import OAuthCallback from './pages/OAuthCallback';
import RedirectHandler from './components/RedirectHandler';

// Lazy load heavy components
const UserManagement = React.lazy(() => import('./pages/UserManagement'));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage'));

// Loading component
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/change-password" element={<ChangePasswordPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/auth/callback" element={<OAuthCallback />} />
                <Route path="/analytics/:id" element={<AnalyticsPage />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                {/* Handle short URL redirects - must be last before catch-all */}
                <Route path="/:slug" element={<RedirectHandler />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
