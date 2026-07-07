import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUsers,
  FaShoppingCart,
  FaChartLine,
  FaBox,
  FaDollarSign,
  FaUserShield,
  FaShoppingBag,
  FaTag,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaSpinner
} from 'react-icons/fa';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { adminDashboardApi } from '@/services/adminApi';
import { ErrorBoundary } from 'react-error-boundary';
import { toast } from 'react-toastify';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Error Fallback Component
function DashboardErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-red-700 mb-2">Dashboard Error</h2>
          <p className="text-red-600 mb-4">{error.message}</p>
          <button
            onClick={resetErrorBoundary}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

const Dashboard = () => {
  const [stats, setStats] = useState({
    counts: {
      totalUsers: 0,
      verifiedUsers: 0,
      activeUsers: 0,
      adminUsers: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalCategories: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      monthlyOrders: 0,
      yearlyOrders: 0,
    },
    recentUsers: [],
    recentOrders: [],
    ordersByStatus: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminDashboardApi.getDashboardStats();
      
      // Safely handle response data
      const userData = data.users || { counts: {}, recentUsers: [] };
      const orderData = data.orders || { 
        totalOrders: 0, 
        monthlyOrders: 0, 
        yearlyOrders: 0, 
        totalRevenue: 0, 
        monthlyRevenue: 0,
        recentOrders: [],
        ordersByStatus: []
      };
      
      setStats({
        counts: {
          totalUsers: userData.counts?.totalUsers || 0,
          verifiedUsers: userData.counts?.verifiedUsers || 0,
          activeUsers: userData.counts?.activeUsers || 0,
          adminUsers: userData.counts?.adminUsers || 0,
          totalOrders: orderData.totalOrders || 0,
          monthlyOrders: orderData.monthlyOrders || 0,
          yearlyOrders: orderData.yearlyOrders || 0,
          totalRevenue: orderData.totalRevenue || 0,
          monthlyRevenue: orderData.monthlyRevenue || 0,
          totalProducts: 0, // You might need to fetch this separately
          totalCategories: 0, // You might need to fetch this separately
        },
        recentUsers: userData.recentUsers || [],
        recentOrders: orderData.recentOrders || [],
        ordersByStatus: orderData.ordersByStatus || [],
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate percentage changes (mock data - you can implement real logic)
  const calculateChange = (current, previous) => {
    if (!previous) return '+0%';
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  // Sales data for chart (you can fetch real data from backend)
  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Sales ($)',
        data: [12000, 19000, 15000, 25000, 22000, 30000, 28000, 35000, 32000, 40000, 38000, stats.counts.monthlyRevenue],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const ordersData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Orders',
        data: [65, 59, 80, 81, 56, stats.counts.monthlyOrders],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
      }
    ]
  };

  // Category data from order stats
  const categoryData = {
    labels: stats.ordersByStatus.map(s => s._id),
    datasets: [
      {
        data: stats.ordersByStatus.map(s => s.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
      }
    ]
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.counts.totalRevenue.toLocaleString()}`,
      icon: <FaDollarSign className="text-3xl text-green-500" />,
      color: 'bg-gradient-to-r from-green-50 to-green-100',
      textColor: 'text-green-600',
      change: '+12.5%',
      changeType: 'up'
    },
    {
      title: 'Total Orders',
      value: stats.counts.totalOrders.toLocaleString(),
      icon: <FaShoppingCart className="text-3xl text-blue-500" />,
      color: 'bg-gradient-to-r from-blue-50 to-blue-100',
      textColor: 'text-blue-600',
      change: '+8.2%',
      changeType: 'up'
    },
    {
      title: 'Total Users',
      value: stats.counts.totalUsers.toLocaleString(),
      icon: <FaUsers className="text-3xl text-purple-500" />,
      color: 'bg-gradient-to-r from-purple-50 to-purple-100',
      textColor: 'text-purple-600',
      change: '+5.7%',
      changeType: 'up'
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.counts.monthlyRevenue.toLocaleString()}`,
      icon: <FaBox className="text-3xl text-amber-500" />,
      color: 'bg-gradient-to-r from-amber-50 to-amber-100',
      textColor: 'text-amber-600',
      change: '+3.4%',
      changeType: 'up'
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Pending': return 'bg-gray-100 text-gray-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your store today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className={`${stat.color} rounded-xl p-6 shadow-sm border border-gray-200`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-2xl font-bold mt-1 ${stat.textColor}`}>
                    {stat.value}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  {stat.icon}
                </div>
              </div>
              <div className="flex items-center text-sm">
                <span className={`flex items-center ${stat.changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.changeType === 'up' ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                  {stat.change}
                </span>
                <span className="text-gray-500 ml-2">from last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Sales Overview</h2>
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>Last 12 months</option>
                <option>Last 6 months</option>
                <option>Last 3 months</option>
              </select>
            </div>
            <div className="h-64">
              <Line 
                data={salesData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        drawBorder: false
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Orders Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Monthly Orders</h2>
              <span className="text-sm text-gray-500">Last 6 months</span>
            </div>
            <div className="h-64">
              <Bar 
                data={ordersData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        drawBorder: false
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Recent Orders & Category Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.recentOrders.length > 0 ? (
                    stats.recentOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">#{order._id.slice(-6)}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.user?.name || 'Guest'}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">${order.totalPrice}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                        No recent orders
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-6 text-center">
              <Link
                to="/admin/orders"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
              >
                View all orders
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Orders by Status</h2>
            {stats.ordersByStatus.length > 0 ? (
              <div className="h-64">
                <Doughnut 
                  data={categoryData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/admin/products/new"
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4 flex flex-col items-center justify-center hover:shadow-md transition-shadow"
            >
              <FaBox className="text-2xl mb-2" />
              <span className="font-medium">Add Product</span>
            </Link>
            <Link
              to="/admin/users"
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4 flex flex-col items-center justify-center hover:shadow-md transition-shadow"
            >
              <FaUsers className="text-2xl mb-2" />
              <span className="font-medium">Manage Users</span>
            </Link>
            <Link
              to="/admin/categories"
              className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4 flex flex-col items-center justify-center hover:shadow-md transition-shadow"
            >
              <FaTag className="text-2xl mb-2" />
              <span className="font-medium">Categories</span>
            </Link>
            <Link
              to="/admin/orders"
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg p-4 flex flex-col items-center justify-center hover:shadow-md transition-shadow"
            >
              <FaShoppingBag className="text-2xl mb-2" />
              <span className="font-medium">View Orders</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export with ErrorBoundary wrapper
const DashboardWithErrorBoundary = () => (
  <ErrorBoundary
    FallbackComponent={DashboardErrorFallback}
    onReset={() => window.location.reload()}
  >
    <Dashboard />
  </ErrorBoundary>
);

export default DashboardWithErrorBoundary;