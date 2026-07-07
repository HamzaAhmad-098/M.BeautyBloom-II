import React, { createContext, useState, useContext, useEffect } from 'react';
import { dashboardAPI } from '../services/api';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, admins: 0 },
    orders: { total: 0, completed: 0, pending: 0, revenue: 0 },
    products: { total: 0, categories: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getSalesData('monthly'),
      ]);

      setStats({
        users: {
          total: statsRes.data.data.counts.totalUsers || 0,
          active: statsRes.data.data.counts.activeUsers || 0,
          admins: statsRes.data.data.counts.adminUsers || 0,
        },
        orders: {
          total: ordersRes.data.totalOrders || 0,
          completed: ordersRes.data.ordersByStatus?.find(o => o._id === 'Delivered')?.count || 0,
          pending: ordersRes.data.ordersByStatus?.find(o => o._id === 'Pending')?.count || 0,
          revenue: ordersRes.data.monthlyRevenue || 0,
        },
        products: {
          total: 0, // You'll need to add product stats endpoint
          categories: 0,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const value = {
    stats,
    loading,
    error,
    refreshStats: fetchDashboardStats,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};