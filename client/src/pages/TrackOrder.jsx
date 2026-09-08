import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaCheckCircle, FaTruck, FaClock, FaTimesCircle, FaClipboard } from 'react-icons/fa';

const statusSteps = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const TrackOrder = () => {
  const { id: routeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const [orderId, setOrderId] = useState(routeId || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const intervalRef = useRef(null);

  const fetchOrder = async (id) => {
    if (!id) {
      toast.error('Please provide an order id');
      return;
    }

    setLoading(true);
    try {
      const headers = {};
      if (userInfo?.token) {
        headers.Authorization = `Bearer ${userInfo.token}`;
      }

      const url = `/api/orders/${id}`;
      const { data } = await axios.get(url, { headers });

      setOrder(data);
      setLoading(false);

      // Start polling if order not in terminal state
      if (!['Delivered', 'Cancelled'].includes(data.status)) {
        startPolling(id);
      } else {
        stopPolling();
      }
    } catch (err) {
      setLoading(false);
      stopPolling();
      const message = err.response?.data?.message || err.message || 'Failed to fetch order';
      toast.error(message);
    }
  };

  const startPolling = (id) => {
    // avoid creating multiple intervals
    if (intervalRef.current) return;
    setPolling(true);
    intervalRef.current = setInterval(() => {
      (async () => {
        try {
          const headers = {};
          if (userInfo?.token) headers.Authorization = `Bearer ${userInfo.token}`;
          const url = `/api/orders/${id}`;
          const { data } = await axios.get(url, { headers });
          setOrder(data);
          if (['Delivered', 'Cancelled'].includes(data.status)) {
            stopPolling();
            toast.success(`Order status updated: ${data.status}`);
          }
        } catch (err) {
          // If unauthorized, stop retrying
          if (err.response?.status === 401 || err.response?.status === 403) {
            stopPolling();
            const msg = err.response?.data?.message || 'Not authorized to view this order';
            toast.error(msg);
          }
          // otherwise continue polling
        }
      })();
    }, 8000); // poll every 8s
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPolling(false);
  };

  // If route has id on mount, fetch immediately
  useEffect(() => {
    if (routeId) {
      fetchOrder(routeId);
      setOrderId(routeId);
    }
    // cleanup on unmount
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId, userInfo]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    if (!orderId) {
      toast.error('Enter an order id');
      return;
    }

    // Update URL for shareability
    navigate(`/track-order/${orderId}`, { replace: true });
    fetchOrder(orderId);
  };

  const getStepIndex = (status) => {
    // Map status to index in statusSteps; default to Pending
    const idx = statusSteps.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard');
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Track Your Order</h1>

        {/* Search form */}
        {!routeId && (
          <div className="mb-6 bg-white p-4 rounded shadow-sm">
            <form onSubmit={onSearchSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
              <div>
                <label className="text-sm font-medium">Order ID</label>
                <input
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. 61f2a4..."
                  className="mt-1 border p-2 rounded w-full"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded"
                >
                  Track Order
                </button>
              </div>
            </form>
            <p className="mt-2 text-sm text-gray-500">
              If you're logged in, you can also open an order from your Orders page and click "Track".
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white p-6 rounded shadow-sm">
            <p>Loading order...</p>
          </div>
        )}

        {/* Order details */}
        {order && (
          <>
            <div className="bg-white p-6 rounded shadow-sm mb-6">
              <div className="flex items-start justify-between space-x-4">
                <div>
                  <h2 className="text-lg font-semibold">Order #{order._id}</h2>
                  <p className="text-sm text-gray-600">Placed on {new Date(order.createdAt).toLocaleString()}</p>
                  <p className="text-sm">
                    Status: <strong>{order.status}</strong>
                    {order.isPaid && <span className="ml-3 text-sm text-green-600">• Paid</span>}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Order Value</p>
                  <p className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full inline-block">Confirmed on WhatsApp</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Tracking:</span>
                  {order.trackingNumber ? (
                    <>
                      <span className="px-2 py-1 bg-gray-100 rounded">{order.trackingNumber}</span>
                      <button
                        onClick={() => copyToClipboard(order.trackingNumber)}
                        className="ml-2 text-sm text-primary-600 hover:underline flex items-center gap-1"
                      >
                        <FaClipboard /> Copy
                      </button>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">Not available yet</span>
                  )}
                </div>
              </div>
            </div>

            {/* Progress timeline */}
            <div className="bg-white p-6 rounded shadow-sm mb-6">
              <h3 className="font-semibold mb-4">Order Progress</h3>
              <div className="space-y-4">
                {[
                  { key: 'Pending', icon: <FaClock className="text-xl" /> },
                  { key: 'Processing', icon: <FaTruck className="text-xl" /> },
                  { key: 'Shipped', icon: <FaTruck className="text-xl" /> },
                  { key: 'Delivered', icon: <FaCheckCircle className="text-xl" /> },
                ].map((step, idx) => {
                  const activeIndex = getStepIndex(order.status);
                  const completed = idx <= activeIndex && order.status !== 'Cancelled';
                  return (
                    <div key={step.key} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${completed ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{step.key}</div>
                          <div className="text-sm text-gray-500">
                            {(() => {
                              if (step.key === 'Pending' && order.createdAt) return new Date(order.createdAt).toLocaleString();
                              if (step.key === 'Processing' && order.updatedAt && order.status !== 'Pending' && (order.status === 'Processing' || order.status === 'Shipped' || order.status === 'Delivered')) return new Date(order.updatedAt).toLocaleString();
                              if (step.key === 'Shipped' && order.status === 'Shipped' && order.updatedAt) return new Date(order.updatedAt).toLocaleString();
                              if (step.key === 'Delivered' && order.deliveredAt) return new Date(order.deliveredAt).toLocaleString();
                              return '';
                            })()}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {step.key === 'Pending' && 'Order received and awaiting processing.'}
                          {step.key === 'Processing' && 'Preparing your items for shipment.'}
                          {step.key === 'Shipped' && 'Your order is on the way.'}
                          {step.key === 'Delivered' && 'Order delivered to recipient.'}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {order.status === 'Cancelled' && (
                  <div className="flex items-center gap-3 text-red-600">
                    <FaTimesCircle />
                    <div>Order cancelled on {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : ''}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Items list */}
            <div className="bg-white p-6 rounded shadow-sm mb-6">
              <h3 className="font-semibold mb-4">Items</h3>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.product} className="flex items-center gap-4 border-b pb-3 last:border-b-0">
                    <img src={(item.image && (typeof item.image === 'string' ? item.image : (item.image.url || item.image))) || 'https://via.placeholder.com/80'} alt={item.name} className="w-20 h-20 object-cover rounded" />
                    <div className="flex-1">
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-gray-500">Qty: {item.quantity} {item.variant ? `• ${item.variant}` : ''}</div>
                    </div>
                    <div className="text-xs text-emerald-700 font-medium">Priced on WhatsApp</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded shadow-sm">
                <h4 className="font-semibold mb-2">Shipping Address</h4>
                <div className="text-sm text-gray-700">
                  <div>{order.shippingAddress.name}</div>
                  <div>{order.shippingAddress.address}</div>
                  <div>{order.shippingAddress.city} {order.shippingAddress.postalCode}</div>
                  <div>{order.shippingAddress.country}</div>
                  <div className="mt-2">Phone: {order.shippingAddress.phone}</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded shadow-sm">
                <h4 className="font-semibold mb-2">Payment</h4>
                <div className="text-sm text-gray-700">
                  <div>Method: {order.paymentMethod}</div>
                  <div>Status: {order.isPaid ? `Paid • ${order.paidAt ? new Date(order.paidAt).toLocaleString() : ''}` : 'Not paid'}</div>
                  <div className="mt-3 font-semibold">Order Total: <span className="text-emerald-700">Confirmed on WhatsApp</span></div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => fetchOrder(order._id)} className="bg-gray-100 px-4 py-2 rounded">Refresh</button>
              {order.trackingNumber && (
                <button onClick={() => copyToClipboard(order.trackingNumber)} className="bg-primary-500 text-white px-4 py-2 rounded">Copy Tracking</button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;