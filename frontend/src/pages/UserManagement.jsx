import React, { useState, useEffect } from 'react';
import { Navigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  ArrowLeft
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const UserManagement = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    role: 'USER'
  });

  useEffect(() => {
    if (isAuthenticated && user && ['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
      fetchUsers();
    }
  }, [isAuthenticated, user]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/auth/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    if (!formData.email) return;

    setInviting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/auth/invite-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(prev => [data.user, ...prev]);
        setFormData({ email: '', role: 'USER' });
        setShowInviteForm(false);
        showNotification('User invited successfully', 'success');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to invite user');
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      showNotification(error.message, 'error');
    } finally {
      setInviting(false);
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/auth/users/${userId}/toggle-active`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: data.user.isActive } : u));
        showNotification(data.message, 'success');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      showNotification(error.message, 'error');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
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

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

      {/* Notification */}
      {notification && (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4`}>
          <div className={`flex items-center p-4 rounded-md ${
            notification.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200' 
              : 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200'
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
        {/* Actions Bar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            className={`text-sm px-3 py-1 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              u.isActive
                                ? 'border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900'
                                : 'border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900'
                            }`}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
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

export default UserManagement;