import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { urlApi } from '../services/api';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  ArrowLeft, 
  ExternalLink, 
  Copy, 
  Calendar, 
  MousePointer, 
  Globe,
  Loader2 
} from 'lucide-react';

const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#F97316'];

const AnalyticsPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [urlData, setUrlData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user && !user.mustUpdate) {
      fetchAnalytics();
    }
  }, [id, isAuthenticated, user]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await urlApi.get(id);
      setUrlData(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setError(error.response?.data?.error || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.mustUpdate) {
    return <Navigate to="/change-password" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !urlData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'URL not found'}</p>
          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-700 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { analytics } = urlData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Link
                to="/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* URL Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">URL Details</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopyUrl(urlData.shortUrl)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Copy className="w-4 h-4" />
              </button>
              <a
                href={urlData.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Short URL
              </label>
              <code className="text-sm bg-gray-100 px-3 py-2 rounded block">
                {urlData.shortUrl}
              </code>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Destination URL
              </label>
              <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded break-all">
                {urlData.destination}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Total Clicks
              </label>
              <p className="text-2xl font-bold text-blue-600">
                {analytics.totalClicks.toLocaleString()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Created
              </label>
              <p className="text-sm text-gray-900">
                {new Date(urlData.createdAt).toLocaleDateString()} at{' '}
                {new Date(urlData.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Slug
              </label>
              <code className="text-sm text-gray-900">/{urlData.slug}</code>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <MousePointer className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalClicks.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Days Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.dailyClicks.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Globe className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Top Referrer</p>
                <p className="text-lg font-bold text-gray-900">
                  {analytics.topReferrers[0]?.referrer || 'Direct'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Clicks Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Clicks Over Time</h3>
            {analytics.dailyClicks.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.dailyClicks}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value) => [value, 'Clicks']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No click data available
              </div>
            )}
          </div>

          {/* Top Referrers Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Referrers</h3>
            {analytics.topReferrers.length > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analytics.topReferrers.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="referrer" 
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">All Referrers</h4>
                  <div className="space-y-1">
                    {analytics.topReferrers.map((referrer, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 truncate">
                          {referrer.referrer}
                        </span>
                        <span className="text-gray-900 font-medium">
                          {referrer.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No referrer data available
              </div>
            )}
          </div>
        </div>

        {/* Recent Clicks */}
        {analytics.recentClicks.length > 0 && (
          <div className="bg-white rounded-lg shadow mt-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Clicks</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referrer
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.recentClicks.map((click, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(click.clickedAt).toLocaleDateString()} at{' '}
                        {new Date(click.clickedAt).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {click.referrer}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AnalyticsPage;