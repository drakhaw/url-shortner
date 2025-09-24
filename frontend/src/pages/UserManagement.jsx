import React, { useState, useEffect } from 'react';
import { Navigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  UserCheck, 
  UserX,
  Calendar,
  Link as LinkIcon,
  Search,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
  Crown,
  Key,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import ConfirmationModal from '../components/ConfirmationModal';
import NotificationModal from '../components/NotificationModal';
import Pagination from '../components/Pagination';
import ItemsPerPageSelector from '../components/ItemsPerPageSelector';

const UserManagement = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    role: 'USER'
  });
  
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
    if (isAuthenticated && user && ['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
      fetchUsers();
    }
  }, [isAuthenticated, user, currentPage, itemsPerPage]);
  
  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated && user && ['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
        fetchUsers();
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.list(currentPage, itemsPerPage, searchQuery);
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.pages);
      setTotalItems(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotificationModal('Error', 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    if (!formData.email) return;

    setInviting(true);
    try {
      const response = await userApi.invite(formData.email, formData.role);
      setUsers(prev => [response.data.user, ...prev]);
      setFormData({ email: '', role: 'USER' });
      setShowInviteForm(false);
      showNotificationModal('Success', 'User invited successfully', 'success');
      // Refresh the list to get updated pagination
      fetchUsers();
    } catch (error) {
      console.error('Error inviting user:', error);
      const message = error.response?.data?.error || 'Failed to invite user';
      showNotificationModal('Error', message, 'error');
    } finally {
      setInviting(false);
    }
  };

  const handleToggleUserStatus = (userId, userEmail, isActive) => {
    const action = isActive ? 'deactivate' : 'activate';
    setConfirmationModal({
      isOpen: true,
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      message: `Are you sure you want to ${action} "${userEmail}"?`,
      type: 'warning',
      onConfirm: () => confirmToggleUserStatus(userId)
    });
  };
  
  const confirmToggleUserStatus = async (userId) => {
    try {
      const response = await userApi.toggleActive(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: response.data.user.isActive } : u));
      showNotificationModal('Success', response.data.message, 'success');
    } catch (error) {
      console.error('Error updating user status:', error);
      const message = error.response?.data?.error || 'Failed to update user status';
      showNotificationModal('Error', message, 'error');
    } finally {
      setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleDeleteUser = (userId, userEmail) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Delete User',
      message: `Are you sure you want to permanently delete user "${userEmail}"? This action cannot be undone.`,
      type: 'danger',
      onConfirm: () => confirmDeleteUser(userId)
    });
  };
  
  const confirmDeleteUser = async (userId) => {
    try {
      const response = await userApi.delete(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      showNotificationModal('Success', response.data.message, 'success');
      // If this was the last item on the page, go to previous page
      if (users.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorData = error.response?.data;
      if (errorData?.hasUrls) {
        showNotificationModal('Error', `Cannot delete user: ${errorData.error}`, 'error');
      } else {
        const message = errorData?.error || 'Failed to delete user';
        showNotificationModal('Error', message, 'error');
      }
    } finally {
      setConfirmationModal(prev => ({ ...prev, isOpen: false }));
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
  
  // Search handler
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };
  
  // Items per page change handler
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };
  

  const getRoleIcon = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'ADMIN':
        return <Shield className="w-4 h-4 text-blue-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      'SUPER_ADMIN': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'ADMIN': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'USER': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role]}`}>
        {getRoleIcon(role)}
        <span className="ml-1">{role.replace('_', ' ')}</span>
      </span>
    );
  };

  // Note: With server-side pagination, we show all users from current page
  // Search functionality would need to be implemented server-side
  const filteredUsers = users;

  // Redirect if not authenticated or not admin
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <RouterLink
                to="/dashboard"
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back
              </RouterLink>
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Welcome, {user?.name || user?.email}
              </span>
              <ThemeToggle />
              <button
                onClick={logout}
                className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <Key className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite User
            </button>
          </div>
          
          {/* Filters and Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <ItemsPerPageSelector
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            />
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {searchQuery && (
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md">
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
        </div>

        {/* Invite Form */}
        {showInviteForm && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Invite New User</h3>
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USER">User</option>
                  {user?.role === 'SUPER_ADMIN' && <option value="ADMIN">Admin</option>}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {inviting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  Invite User
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Users ({filteredUsers.length})
            </h2>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No users found</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              {filteredUsers.map((u) => (
                <div key={u.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {u.avatar ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={u.avatar}
                                alt={u.name || u.email}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                <Users className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {u.name || 'No name set'}
                              </p>
                              <div className="ml-2">
                                {getRoleBadge(u.role)}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{u.email}</p>
                            <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span>Joined {new Date(u.createdAt).toLocaleDateString()}</span>
                              {u.lastLoginAt && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>Last login {new Date(u.lastLoginAt).toLocaleDateString()}</span>
                                </>
                              )}
                              {u._count && (
                                <>
                                  <span className="mx-2">•</span>
                                  <LinkIcon className="w-3 h-3 mr-1" />
                                  <span>{u._count.shortUrls} URLs</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          u.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {u.isActive ? (
                            <>
                              <UserCheck className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <UserX className="w-3 h-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </span>
                        {u.id !== user.id && u.role !== 'SUPER_ADMIN' && (
                          <>
                            <button
                              onClick={() => handleToggleUserStatus(u.id, u.email, u.isActive)}
                              className={`text-sm px-3 py-1 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                u.isActive
                                  ? 'border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900'
                                  : 'border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900'
                              }`}
                            >
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            {(u._count?.shortUrls === 0 || !u._count) && (
                              <button
                                onClick={() => handleDeleteUser(u.id, u.email)}
                                className="ml-2 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
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

export default UserManagement;
