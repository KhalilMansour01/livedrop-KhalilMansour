import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface BusinessMetrics {
  revenue: {
    total: number;
    average: number;
    range: { min: number; max: number };
  };
  orders: {
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
  };
  customers: {
    unique: number;
    avgOrdersPerCustomer: number;
    avgSpendingPerCustomer: number;
  };
}

interface PerformanceMetrics {
  api: {
    averageResponseTime: number;
    recentErrors: number;
    uptime: number;
  };
  sse: {
    activeConnections: number;
  };
  database: {
    connectionStatus: string;
    lastQueryTime: number;
  };
}

interface AssistantStats {
  queries: {
    total: number;
    today: number;
    lastHour: number;
  };
  intents: {
    policy_question: number;
    order_status: number;
    product_search: number;
    complaint: number;
    chitchat: number;
    off_topic: number;
    violation: number;
  };
  functions: {
    getOrderStatus: number;
    searchProducts: number;
    getCustomerOrders: number;
  };
  performance: {
    averageResponseTime: number;
    successRate: number;
  };
}

const AdminDashboard: React.FC = () => {
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [assistantStats, setAssistantStats] = useState<AssistantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [business, performance, assistant] = await Promise.all([
        api.getBusinessMetrics(),
        api.getPerformanceMetrics(),
        api.getAssistantStats()
      ]);

      setBusinessMetrics(business as BusinessMetrics);
      setPerformanceMetrics(performance as PerformanceMetrics);
      setAssistantStats(assistant as AssistantStats);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading && !businessMetrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Real-time monitoring and analytics</p>
          <div className="mt-2 text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        {/* Business Metrics */}
        {businessMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(businessMetrics.revenue.total)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Avg Order: {formatCurrency(businessMetrics.revenue.average)}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Orders</h3>
              <p className="text-3xl font-bold text-blue-600">
                {businessMetrics.orders.total}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {businessMetrics.orders.completionRate}% completed
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Customers</h3>
              <p className="text-3xl font-bold text-purple-600">
                {businessMetrics.customers.unique}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {businessMetrics.customers.avgOrdersPerCustomer} avg orders
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Orders</h3>
              <p className="text-3xl font-bold text-yellow-600">
                {businessMetrics.orders.pending}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {businessMetrics.orders.completed} completed
              </p>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {performanceMetrics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">API Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Time:</span>
                  <span className="font-semibold">{performanceMetrics.api.averageResponseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uptime:</span>
                  <span className="font-semibold">{formatUptime(performanceMetrics.api.uptime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Recent Errors:</span>
                  <span className="font-semibold">{performanceMetrics.api.recentErrors}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Connections</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active SSE:</span>
                  <span className="font-semibold text-green-600">
                    {performanceMetrics.sse.activeConnections}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Database:</span>
                  <span className={`font-semibold ${
                    performanceMetrics.database.connectionStatus === 'connected' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {performanceMetrics.database.connectionStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">API Server</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Database</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-600">LLM Service</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assistant Analytics */}
        {assistantStats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assistant Activity</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Queries:</span>
                  <span className="font-semibold">{assistantStats.queries.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Today:</span>
                  <span className="font-semibold">{assistantStats.queries.today}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Hour:</span>
                  <span className="font-semibold">{assistantStats.queries.lastHour}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Response Time:</span>
                  <span className="font-semibold">{assistantStats.performance.averageResponseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-semibold">{assistantStats.performance.successRate}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Intent Distribution</h3>
              <div className="space-y-2">
                {Object.entries(assistantStats.intents).map(([intent, count]) => (
                  <div key={intent} className="flex justify-between">
                    <span className="text-gray-600 capitalize">
                      {intent.replace('_', ' ')}:
                    </span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
