import React, { useState, useEffect } from 'react';
import { Navigate, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { urlApi } from '../services/api';
import { 
  Plus, 
  Link as LinkIcon, 
  Copy, 
  ExternalLink, 
  Edit, 
  Trash2, 
  BarChart3, 
  LogOut,
  Loader2,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';

const DashboardPage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    destination: '',
    customSlug: ''
  });
  const [notification, setNotification] = useState(null);
  const [editingUrl, setEditingUrl] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user && !user.mustUpdate) {
      fetchUrls();
    } else if (isAuthenticated && user && user.mustUpdate) {
      // User needs to update password, will be redirected
      setLoading(false);
    } else if (!isAuthenticated) {
      // Not authenticated, will be redirected
      setLoading(false);
    }
    // If isAuthenticated is true but user is null, keep loading
  }, [isAuthenticated, user]);

  const fetchUrls = async () => {
    try {
      const response = await urlApi.list(1, 20);
      setUrls(response.data.urls);
    } catch (error) {
      console.error('Failed to fetch URLs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUrl = async (e) => {
    e.preventDefault();
    if (!formData.destination) return;

    setCreating(true);
    try {
      const response = await urlApi.create(
        formData.destination, 
        formData.customSlug || undefined
      );
      
      setUrls(prev => [response.data, ...prev]);
      setFormData({ destination: '', customSlug: '' });
      setShowCreateForm(false);
      showNotification('Short URL created successfully!', 'success');
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create short URL';
      showNotification(message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyUrl = (shortUrl) => {
    navigator.clipboard.writeText(shortUrl);
    showNotification('URL copied to clipboard!', 'success');
  };

  const handleDeleteUrl = async (id) => {
    if (!confirm('Are you sure you want to delete this URL?')) return;

    try {
      await urlApi.delete(id);
      setUrls(prev => prev.filter(url => url.id !== id));
      showNotification('URL deleted successfully!', 'success');
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete URL';
      showNotification(message, 'error');
    }
  };

  const handleUpdateUrl = async (id, newDestination) => {
    try {
      const response = await urlApi.update(id, newDestination);
      setUrls(prev => prev.map(url => 
        url.id === id ? { ...url, destination: response.data.destination } : url
      ));
      setEditingUrl(null);
      showNotification('URL updated successfully!', 'success');
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update URL';
      showNotification(message, 'error');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Show loading while user data is being loaded
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (user.mustUpdate) {
    return <Navigate to="/change-password" replace />;
  }

  // Show loading while fetching URLs
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <LinkIcon className="w-8 h-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">URL Shortener</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Welcome, {user?.email}</span>
                <button
                  onClick={logout}
                  className="flex items-center text-sm text-gray-700 hover:text-gray-900"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Loading your URLs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <LinkIcon className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">URL Shortener</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, {user?.email}</span>
              <button
                onClick={logout}
                className="flex items-center text-sm text-gray-700 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4`}>
          <div className={`flex items-center p-4 rounded-md ${
            notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {notification.message}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create URL Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Create Short URL</h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New URL
              </button>
            </div>

            {showCreateForm && (
              <form onSubmit={handleCreateUrl} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination URL
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.destination}
                    onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                    placeholder="https://example.com/very/long/url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Slug (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.customSlug}
                    onChange={(e) => setFormData(prev => ({ ...prev, customSlug: e.target.value }))}
                    placeholder="my-custom-slug"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to auto-generate a slug
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                    Create Short URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* URLs List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Your Short URLs</h2>
          </div>
          
          {urls.length === 0 ? (
            <div className="text-center py-12">
              <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No short URLs created yet</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 text-blue-600 hover:text-blue-700"
              >
                Create your first short URL
              </button>
            </div>
          ) : (
            <div className="overflow-hidden">
              {urls.map((url) => (
                <div key={url.id} className="border-b border-gray-200 last:border-b-0">
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {url.shortUrl}
                          </code>
                          <button
                            onClick={() => handleCopyUrl(url.shortUrl)}
                            className="ml-2 text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <a
                            href={url.shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-gray-400 hover:text-gray-600"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                        <div className="mt-1">
                          {editingUrl === url.id ? (
                            <div className="flex items-center mt-2">
                              <input
                                type="url"
                                defaultValue={url.destination}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleUpdateUrl(url.id, e.target.value);
                                  } else if (e.key === 'Escape') {
                                    setEditingUrl(null);
                                  }
                                }}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                              />
                              <button
                                onClick={() => setEditingUrl(null)}
                                className="ml-2 text-gray-400 hover:text-gray-600"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-600 truncate">
                              → {url.destination}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <span>{url.clickCount} clicks</span>
                          <span className="mx-2">•</span>
                          <span>Created {new Date(url.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RouterLink
                          to={`/analytics/${url.id}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </RouterLink>
                        <button
                          onClick={() => setEditingUrl(url.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUrl(url.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;