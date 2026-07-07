import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchMyOrders } from '../../store/slices/orderSlice';
import { FaBox, FaShippingFast, FaCheckCircle, FaTimesCircle, FaClock, FaEye, FaTruck } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const Orders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Safely get Redux state with defaults
  const { orders = [], loading = false, error = null } = useSelector((state) => state.orders || {});
  const { userInfo = null, isAuthenticated = false } = useSelector((state) => state.auth || {});

  const [filter, setFilter] = useState('all');

  // Fetch orders on mount if authenticated
  useEffect(() => {
    if (isAuthenticated && userInfo) {
      dispatch(fetchMyOrders());
    } else {
      toast.error('Please login to view your orders');
      navigate('/login');
    }
  }, [dispatch, isAuthenticated, userInfo, navigate]);

  // Safe helpers for status
  const getStatusIcon = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'processing': return <FaClock className="text-yellow-500" />;
      case 'shipped': return <FaShippingFast className="text-blue-500" />;
      case 'delivered': return <FaCheckCircle className="text-green-500" />;
      case 'cancelled': return <FaTimesCircle className="text-red-500" />;
      default: return <FaBox className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => (order.status || '').toLowerCase() === filter.toLowerCase());

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Loading state
  if (loading) return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Error state
  if (error) return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Orders</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => dispatch(fetchMyOrders())}
              className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium hover:bg-red-200"
            >
              Retry
            </button>
            <Link
              to="/"
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {/* Filter Tabs */}
        {orders.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {['all', 'processing', 'shipped', 'delivered'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === f
                    ? f === 'all' ? 'bg-primary-500 text-white' :
                      f === 'processing' ? 'bg-yellow-500 text-white' :
                      f === 'shipped' ? 'bg-blue-500 text-white' :
                      'bg-green-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBox className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' ? 'You haven\'t placed any orders yet.' : `You don't have any ${filter} orders.`}
            </p>
            <Link
              to="/shop"
              className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div key={order._id || Math.random()} className="bg-white rounded-xl shadow hover:shadow-md transition-shadow">
                {/* Order Header */}
                <div className="p-6 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status || 'N/A'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Order #{order._id?.slice(-8)?.toUpperCase() || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        Rs. {order.totalPrice?.toLocaleString() || '0'}
                      </p>
                      <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6 space-y-4">
                  {order.orderItems?.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <img
                        src={item.image || item.product?.image || 'https://via.placeholder.com/60'}
                        alt={item.name || item.product?.name || 'Product'}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/60'; }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name || item.product?.name || 'Product'}</h4>
                        <p className="text-sm text-gray-600">Qty: {item.quantity || 0}</p>
                      </div>
                      <p className="font-medium">Rs. {(item.price || 0).toLocaleString()}</p>
                    </div>
                  ))}
                  {order.orderItems?.length > 2 && (
                    <p className="text-sm text-gray-600 text-center">+ {order.orderItems.length - 2} more items</p>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6 pt-6 border-t flex flex-wrap gap-3">
                    <Link
                      to={`/track-order/${order._id}`}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center gap-2"
                    >
                      <FaTruck /> Track Order
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
