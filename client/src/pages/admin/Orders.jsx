import { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaEye, FaCheck, FaTruck, FaTimes, FaPrint, FaSpinner } from 'react-icons/fa';
import { adminOrderApi } from '@/services/adminApi.js';
import { toast } from 'react-toastify';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    cancelled: 0,
  });

  // view modal state
  const [viewOrder, setViewOrder] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  // status modal state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusOrder, setStatusOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('Processing');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const statuses = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  // Helper function to get image URL (same logic as Products.jsx)
  const getImageUrl = (imageData) => {
    if (!imageData) {
      return 'https://via.placeholder.com/80';
    }

    // If imageData is a string
    if (typeof imageData === 'string') {
      // If it's already a URL
      if (imageData.includes('http')) {
        return imageData;
      }
      // If it's a public_id, construct Cloudinary URL
      const cloudName = 'dr1rajqzy';
      return `https://res.cloudinary.com/${cloudName}/image/upload/w_150,h_150,c_fill,q_auto,f_auto/${imageData}`;
    }

    // If imageData is an object with url property
    if (imageData.url) {
      // Return the Cloudinary URL directly
      return imageData.url;
    }

    // If we have a public_id but no URL, construct Cloudinary URL
    if (imageData.public_id) {
      // Construct Cloudinary URL from public_id
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dr1rajqzy';
      return `https://res.cloudinary.com/${cloudName}/image/upload/${imageData.public_id}`;
    }

    // Fallback
    return 'https://via.placeholder.com/80';
  };

  // Get image URL for order item
  const getItemImageUrl = (item) => {
    // Try different possible image locations
    if (item.image) {
      return getImageUrl(item.image);
    }
    if (item.images && item.images.length > 0) {
      return getImageUrl(item.images[0]);
    }
    return 'https://via.placeholder.com/80';
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = { pageNumber: currentPage };
      if (statusFilter !== 'All') params.status = statusFilter;
      if (dateFilter && dateFilter !== 'All') params.date = dateFilter;

      const data = await adminOrderApi.getAllOrders(params);
      // expected shape: { orders, page, pages, total } (fall back to array)
      setOrders(data.orders || data.orders?.data || data || []);
      setTotalPages(data.pages || data.totalPages || 1);

      // Calculate stats
      const allOrders = data.orders || data || [];
      setStats({
        total: data.total || allOrders.length,
        completed: allOrders.filter(o => o.status === 'Delivered').length,
        inProgress: allOrders.filter(o => ['Processing', 'Shipped'].includes(o.status)).length,
        cancelled: allOrders.filter(o => o.status === 'Cancelled').length,
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      order._id?.toLowerCase().includes(term) ||
      order.user?.name?.toLowerCase().includes(term) ||
      order.user?.email?.toLowerCase().includes(term) ||
      order.guestUser?.name?.toLowerCase().includes(term) ||
      order.guestUser?.email?.toLowerCase().includes(term);
    return matchesSearch;
  });

  // Uses existing API method — keep unchanged
  const updateOrderStatusInline = async (id, status) => {
    try {
      await adminOrderApi.updateOrderStatus(id, { status });
      toast.success('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error?.response?.data?.message || 'Failed to update order status');
    }
  };

  // Open view modal (tries adminOrderApi.getOrder or getOrderById)
  const openViewOrder = async (id) => {
    try {
      setViewLoading(true);
      let data;
      if (adminOrderApi.getOrder) {
        data = await adminOrderApi.getOrder(id);
      } else if (adminOrderApi.getOrderById) {
        data = await adminOrderApi.getOrderById(id);
      } else {
        // fallback: getAllOrders with filter (not ideal), but try to find the order locally first
        const found = orders.find(o => o._id === id);
        if (found) data = found;
        else throw new Error('No API method to fetch single order');
      }
      setViewOrder(data);
      setViewOpen(true);
    } catch (err) {
      console.error('Failed to fetch order details', err);
      toast.error(err?.response?.data?.message || 'Failed to fetch order details');
    } finally {
      setViewLoading(false);
    }
  };

  const closeView = () => {
    setViewOpen(false);
    setViewOrder(null);
  };

  // Print order using a print window
  const printOrder = (order) => {
    if (!order) return;
    const html = `
      <html>
        <head>
          <title>Order ${order._id}</title>
          <style>
            body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; color: #111827; padding: 20px; }
            h1 { font-size: 18px; margin-bottom: 6px; }
            .items { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .items th, .items td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            .totals { margin-top: 12px; font-weight: 600; }
          </style>
        </head>
        <body>
          <h1>Order Receipt - ${order._id}</h1>
          <p><strong>Placed:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Status:</strong> ${order.status}</p>

          <h3>Shipping Address</h3>
          <div>
            ${order.shippingAddress?.name || ''}<br/>
            ${order.shippingAddress?.address || ''}<br/>
            ${order.shippingAddress?.city || ''} ${order.shippingAddress?.postalCode || ''}<br/>
            ${order.shippingAddress?.country || ''}<br/>
            Phone: ${order.shippingAddress?.phone || ''}
          </div>

          <h3>Items</h3>
          <table class="items">
            <thead>
              <tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
              ${order.orderItems?.map(i => `
                <tr>
                  <td>${i.name}</td>
                  <td>${i.quantity}</td>
                  <td>Rs. ${i.price}</td>
                  <td>Rs. ${(i.price * i.quantity).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div>Items Price: Rs. ${order.itemsPrice?.toLocaleString() || '0'}</div>
            <div>Tax: Rs. ${order.taxPrice?.toLocaleString() || '0'}</div>
            <div>Shipping: Rs. ${order.shippingPrice?.toLocaleString() || '0'}</div>
            <div style="font-size: 18px; margin-top: 6px;">Total: Rs. ${order.totalPrice?.toLocaleString() || '0'}</div>
          </div>
        </body>
      </html>
    `;
    const w = window.open('', '', 'width=800,height=600');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.print();
    }
  };

  const openStatusModal = (order) => {
    setStatusOrder(order);
    setNewStatus(order.status || 'Processing');
    setTrackingNumber('');
    setStatusNotes('');
    setStatusModalOpen(true);
  };

  const submitStatusChange = async () => {
    if (!statusOrder) return;
    try {
      setStatusSubmitting(true);
      const payload = { status: newStatus };
      if (trackingNumber.trim()) payload.trackingNumber = trackingNumber.trim();
      if (statusNotes.trim()) payload.notes = statusNotes.trim();
      await adminOrderApi.updateOrderStatus(statusOrder._id, payload);
      toast.success('Order status updated successfully');
      setStatusModalOpen(false);
      setStatusOrder(null);
      fetchOrders();
      // If we are in view modal, refresh that order
      if (viewOpen && viewOrder?._id === statusOrder._id) {
        openViewOrder(statusOrder._id);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error?.response?.data?.message || 'Failed to update order status');
    } finally {
      setStatusSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <FaSpinner className="animate-spin text-4xl text-primary-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-2">Manage and track all customer orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Orders</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Completed</div>
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">In Progress</div>
            <div className="text-3xl font-bold text-blue-600">{stats.inProgress}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Cancelled</div>
            <div className="text-3xl font-bold text-red-600">{stats.cancelled}</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by order ID, customer name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {statuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="All">All Time</option>
                  <option value="Today">Today</option>
                  <option value="Week">This Week</option>
                  <option value="Month">This Month</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">#{order._id?.slice(-6)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.user?.name || order.guestUser?.name || 'Guest'}</div>
                        <div className="text-xs text-gray-500">{order.user?.email || order.guestUser?.email || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{order.orderItems?.length || 0}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">Rs. {Number(order.totalPrice).toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {order.isPaid ? 'Paid' : order.paymentMethod || 'COD'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900" title="View Details" onClick={() => openViewOrder(order._id)}><FaEye /></button>
                          <button className="text-gray-600 hover:text-gray-900" title="Print Invoice" onClick={() => printOrder(order)}><FaPrint /></button>
                          <button className="text-yellow-600 hover:text-yellow-900" title="Change Status" onClick={() => openStatusModal(order)}><FaTruck /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">No orders found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`px-3 py-1 rounded text-sm ${currentPage === pageNum ? 'bg-primary-500 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}>{pageNum}</button>
                  );
                })}
                <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Order Modal */}
      {viewOpen && viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl shadow-lg overflow-auto max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Order {viewOrder._id}</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => printOrder(viewOrder)} className="px-3 py-1 rounded bg-white border hover:bg-gray-50 text-gray-700"><FaPrint /></button>
                <button onClick={() => { setViewOpen(false); setViewOrder(null); }} className="px-3 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700">Close</button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Shipping Address</h4>
                  <div className="text-sm text-gray-700 mt-1">
                    <div>{viewOrder.shippingAddress?.name}</div>
                    <div>{viewOrder.shippingAddress?.address}</div>
                    <div>{viewOrder.shippingAddress?.city} {viewOrder.shippingAddress?.postalCode}</div>
                    <div>{viewOrder.shippingAddress?.country}</div>
                    <div className="mt-1">Phone: {viewOrder.shippingAddress?.phone}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium">Payment</h4>
                  <div className="text-sm text-gray-700 mt-1">
                    <div>Method: {viewOrder.paymentMethod}</div>
                    <div>Status: {viewOrder.isPaid ? `Paid • ${viewOrder.paidAt ? new Date(viewOrder.paidAt).toLocaleString() : ''}` : 'Not paid'}</div>
                    <div className="mt-2 font-semibold">Total: Rs. {Number(viewOrder.totalPrice).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Items</h4>
                <div className="space-y-3">
                  {viewOrder.orderItems.map((it) => (
                    <div key={it.product} className="flex items-center justify-between border p-3 rounded">
                      <div className="flex items-center gap-3">
                        <img 
                          src={getItemImageUrl(it)} 
                          alt={it.name} 
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                            e.target.onerror = null;
                          }}
                        />
                        <div>
                          <div className="font-medium">{it.name}</div>
                          <div className="text-sm text-gray-500">Qty: {it.quantity} {it.variant ? `• ${it.variant}` : ''}</div>
                        </div>
                      </div>
                      <div className="font-semibold">Rs. {(it.price * it.quantity).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => openStatusModal(viewOrder)} className="bg-yellow-100 px-3 py-2 rounded">Change Status</button>
                <button onClick={() => {
                  (async () => {
                    try {
                      await adminOrderApi.updateOrderStatus(viewOrder._id, { status: 'Delivered' });
                      toast.success('Order marked delivered');
                      fetchOrders();
                      openViewOrder(viewOrder._id);
                    } catch (err) {
                      console.error(err);
                      toast.error('Failed to mark delivered');
                    }
                  })();
                }} className="bg-green-100 px-3 py-2 rounded">Mark Delivered</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {statusModalOpen && statusOrder && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Update Order Status</h3>
              <p className="text-sm text-gray-500 mt-1">Order #{statusOrder._id}</p>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="mt-1 block w-full border rounded p-2">
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Tracking Number (optional)</label>
                <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Enter tracking number" className="mt-1 block w-full border rounded p-2" />
              </div>

              <div>
                <label className="text-sm font-medium">Notes (optional)</label>
                <textarea value={statusNotes} onChange={(e) => setStatusNotes(e.target.value)} placeholder="Internal notes or customer message" className="mt-1 block w-full border rounded p-2" rows={3} />
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => { setStatusModalOpen(false); setStatusOrder(null); }} className="px-4 py-2 rounded bg-gray-100">Cancel</button>
                <button onClick={submitStatusChange} disabled={statusSubmitting} className="px-4 py-2 rounded bg-primary-500 text-white">
                  {statusSubmitting ? <FaSpinner className="animate-spin inline-block" /> : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;