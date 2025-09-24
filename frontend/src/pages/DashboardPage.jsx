import React, { useState, useEffect } from 'react';
import { Navigate, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { urlApi } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import ConfirmationModal from '../components/ConfirmationModal';
import NotificationModal from '../components/NotificationModal';
import Pagination from '../components/Pagination';
import ItemsPerPageSelector from '../components/ItemsPerPageSelector';
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
  AlertCircle,
  Users,
  Settings,
  User,
  Search
} from 'lucide-react';

const DashboardPage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    destination: '',
    customSlug: ''
  });
  const [editingUrl, setEditingUrl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // Modal states
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'warning'
  });
  const [notificationModal, setNotificationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUrls();
    } else if (!isAuthenticated) {
      // Not authenticated, will be redirected
      setLoading(false);
    }
    // If isAuthenticated is true but user is null, keep loading
  }, [isAuthenticated, user, currentPage, itemsPerPage]);
  
  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated && user) {
        fetchUrls();
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchUrls = async () => {
    try {
      setLoading(true);
      const response = await urlApi.list(currentPage, itemsPerPage, searchQuery);
      setUrls(response.data.urls);
      setTotalPages(response.data.pagination.pages);
      setTotalItems(response.data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch URLs:', error);
      showNotificationModal('Error', 'Failed to load URLs', 'error');
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
      showNotificationModal('Success', 'Short URL created successfully!', 'success');
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create short URL';
      showNotificationModal('Error', message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyUrl = (shortUrl) => {
    navigator.clipboard.writeText(shortUrl);
    showNotificationModal('Success', 'URL copied to clipboard!', 'success');
  };

  const handleDeleteUrl = (id, shortUrl) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Delete URL',
      message: `Are you sure you want to delete "${shortUrl}"? This action cannot be undone.`,
      type: 'danger',
      onConfirm: () => confirmDeleteUrl(id)
    });
  };
  
  const confirmDeleteUrl = async (id) => {
    try {
      await urlApi.delete(id);
      setUrls(prev => prev.filter(url => url.id !== id));
      showNotificationModal('Success', 'URL deleted successfully!', 'success');
      // If this was the last item on the page, go to previous page
      if (urls.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchUrls();
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete URL';
      showNotificationModal('Error', message, 'error');
    } finally {
      setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleUpdateUrl = async (id, newDestination) => {
    try {
      const response = await urlApi.update(id, newDestination);
      setUrls(prev => prev.map(url => 
        url.id === id ? { ...url, destination: response.data.destination } : url
      ));
      setEditingUrl(null);
      showNotificationModal('Success', 'URL updated successfully!', 'success');
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update URL';
      showNotificationModal('Error', message, 'error');
    }
  };
  
  // Modal helper functions
  const showNotificationModal = (title, message, type = 'success') => {
    setNotificationModal({
      isOpen: true,
      title,
      message,
      type
    });
  };
  
  const closeNotificationModal = () => {
    setNotificationModal(prev => ({ ...prev, isOpen: false }));
  };
  
  const closeConfirmationModal = () => {
    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
  };
  
  // Pagination handler
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Items per page change handler
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };
  
  // Search handler
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Show loading while user data is being loaded
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Loading user data...</p>
        </div>
      </div>
    );
  }


  // Show loading while fetching URLs
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <LinkIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">LinkShort</h1>
              </div>
              <div className="flex items-center space-x-4">
                {user?.role === 'SUPER_ADMIN' && (
                  <RouterLink
                    to="/users"
                    className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Users
                  </RouterLink>
                )}
                <ThemeToggle />
                <span className="text-sm text-gray-500 dark:text-gray-400">Welcome, {user?.name || user?.email}</span>
                <button
                  onClick={logout}
                  className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
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
            <p className="text-gray-600 dark:text-gray-400">Loading URLs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <LinkIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">LinkShort</h1>
            </div>
            <div className="flex items-center space-x-4">
              {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
                <RouterLink
                  to="/users"
                  className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Users className="w-4 h-4 mr-1" />
                  User Management
                </RouterLink>
              )}
              <ThemeToggle />
              <span className="text-sm text-gray-500 dark:text-gray-400">Welcome, {user?.email}</span>
              <button
                onClick={logout}
                className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create URL Section */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Create Short URL</h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                New URL
              </button>
            </div>

            {showCreateForm && (
              <form onSubmit={handleCreateUrl} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Destination URL
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.destination}
                    onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                    placeholder="https://example.com/very/long/url"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Custom Slug (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.customSlug}
                    onChange={(e) => setFormData(prev => ({ ...prev, customSlug: e.target.value }))}
                    placeholder="my-custom-slug"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* URLs List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">All Short URLs</h2>
              <ItemsPerPageSelector
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                options={[5, 10, 15, 20, 50]}
              />
            </div>
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search URLs by slug or destination..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              {searchQuery && (
                <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md">
                  Searching: "{searchQuery}"
                  <button
                    onClick={() => handleSearchChange('')}
                    className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
          </div>
          
          {urls.length === 0 ? (
            <div className="text-center py-12">
              <LinkIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No short URLs found</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Create the first short URL
              </button>
            </div>
          ) : (
            <div className="overflow-hidden">
              {urls.map((url) => (
                <div key={url.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 rounded">
                            {url.shortUrl}
                          </code>
                          <button
                            onClick={() => handleCopyUrl(url.shortUrl)}
                            className="ml-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                            aria-label="Copy short URL to clipboard"
                            title="Copy short URL to clipboard"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <a
                            href={url.shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                            aria-label="Visit short URL in new tab"
                            title="Visit short URL in new tab"
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
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                              />
                              <button
                                onClick={() => setEditingUrl(null)}
                                className="ml-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              → {url.destination}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{url.clickCount} clicks</span>
                          <span className="mx-2">•</span>
                          <span>Created {new Date(url.createdAt).toLocaleDateString()}</span>
                          <span className="mx-2">•</span>
                          <div className="flex items-center">
                            {url.creator?.avatar ? (
                              <img
                                src={url.creator.avatar}
                                alt={url.creator.name || url.creator.email}
                                className="w-4 h-4 rounded-full mr-1"
                              />
                            ) : (
                              <User className="w-3 h-3 mr-1" />
                            )}
                            <span>by {url.creator?.name || url.creator?.email || 'Unknown'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RouterLink
                          to={`/analytics/${url.id}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                          title="View Analytics"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </RouterLink>
                        {(url.creator?.id === user?.id || ['SUPER_ADMIN', 'ADMIN'].includes(user?.role)) && (
                          <>
                            <button
                              onClick={() => setEditingUrl(url.id)}
                              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                              title="Edit URL"
                              aria-label="Edit URL destination"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUrl(url.id, url.shortUrl)}
                              className="text-red-400 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
                              title="Delete URL"
                              aria-label="Delete URL permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </div>
      </main>
      
      {/* Modals */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        confirmText="Delete"
        cancelText="Cancel"
      />
      
      <NotificationModal
        isOpen={notificationModal.isOpen}
        onClose={closeNotificationModal}
        title={notificationModal.title}
        message={notificationModal.message}
        type={notificationModal.type}
      />
    </div>
  );
};

export default DashboardPage;
