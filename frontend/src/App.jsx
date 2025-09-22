import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import RedirectHandler from './components/RedirectHandler';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analytics/:id" element={<AnalyticsPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            {/* Handle short URL redirects - must be last before catch-all */}
            <Route path="/:slug" element={<RedirectHandler />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
