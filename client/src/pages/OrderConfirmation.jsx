import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  FaCheckCircle, 
  FaEnvelope, 
  FaPrint, 
  FaHome, 
  FaShoppingBag,
  FaCalendarAlt,
  FaCreditCard,
  FaPhone,
  FaMapMarkerAlt,
  FaTruck,
  FaWhatsapp,
  FaCopy
} from 'react-icons/fa';
import { checkoutApi } from '@/services/checkoutApi.js';
import { toast } from 'react-hot-toast';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Helper function to get image URL (same logic as Products.jsx)
  const getImageUrl = (imageData) => {
    if (!imageData) {
      return 'https://via.placeholder.com/100';
    }

    // If imageData is a string
    if (typeof imageData === 'string') {
      // If it's already a URL
      if (imageData.includes('http')) {
        return imageData;
      }
      // If it's a public_id, construct Cloudinary URL
      const cloudName = 'dr1rajqzy';
      return `https://res.cloudinary.com/${cloudName}/image/upload/w_200,h_200,c_fill,q_auto,f_auto/${imageData}`;
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
    return 'https://via.placeholder.com/100';
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
    return 'https://via.placeholder.com/100';
  };
  
  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);
  
  const fetchOrderDetails = async () => {
    try {
      const response = await checkoutApi.getOrder(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleWhatsAppSupport = () => {
    const message = `Hello, I need support for my order #${orderId}`;
    const url = `https://wa.me/923001234567?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    toast.success('Order ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // Function to format order ID for display (shows first 8 and last 8 characters)
  const formatOrderId = (id) => {
    if (!id) return '';
    if (id.length <= 16) return id;
    return `${id.substring(0, 8)}...${id.substring(id.length - 8)}`;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">Order Not Found</h2>
            <p className="text-red-700 mb-4">{error || 'The order you are looking for does not exist.'}</p>
            <div className="flex space-x-4">
              <Link
                to="/orders"
                className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
              >
                View My Orders
              </Link>
              <Link
                to="/"
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Order Confirmed!</h1>
          <p className="text-gray-600 mt-2">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
          <div className="mt-4 inline-flex items-center bg-green-50 text-green-800 px-4 py-2 rounded-lg">
            <FaCalendarAlt className="mr-2" />
            Order Date: {formatDate(order.createdAt)}
          </div>
        </div>
        
        {/* Order Summary Card - FIXED ORDER ID DISPLAY */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border-r border-gray-200">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-2xl md:text-3xl font-bold text-primary-600 truncate max-w-full" title={order._id}>
                    #{formatOrderId(order._id)}
                  </div>
                  <button
                    onClick={handleCopyOrderId}
                    className="text-gray-400 hover:text-primary-500 transition-colors"
                    title="Copy Order ID"
                  >
                    <FaCopy className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm text-gray-500">Order Number</div>
                {copied && (
                  <div className="text-xs text-green-600 mt-1">Copied!</div>
                )}
              </div>
            </div>
            
            <div className="text-center p-4 border-r border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                Rs. {order.totalPrice?.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 mt-1">Total Amount</div>
            </div>
            
            <div className="text-center p-4">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                'bg-green-100 text-green-800'
              }`}>
                {order.status}
              </span>
              <div className="text-sm text-gray-500 mt-1">Status</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-2" />
                Shipping Details
              </h2>
              
              <div className="space-y-3">
                <div>
                  <p className="font-semibold">{order.shippingAddress?.name}</p>
                  <p className="text-gray-600">{order.shippingAddress?.address}</p>
                  <p className="text-gray-600">
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
                  </p>
                  <p className="text-gray-600">{order.shippingAddress?.country}</p>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <FaPhone className="mr-2" />
                  {order.shippingAddress?.phone}
                </div>
                
                {order.guestUser?.email && (
                  <div className="flex items-center text-gray-600">
                    <FaEnvelope className="mr-2" />
                    {order.guestUser.email}
                  </div>
                )}
              </div>
            </div>
            
            {/* Payment Information */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FaCreditCard className="mr-2" />
                Payment Information
              </h2>
              
              <div className="space-y-3">
                <div>
                  <p className="font-semibold capitalize">
                    {order.paymentMethod?.replace(/([A-Z])/g, ' $1')}
                  </p>
                  <p className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                    order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.isPaid ? 'Paid' : 'Payment Pending'}
                  </p>
                  {order.isPaid && order.paidAt && (
                    <p className="text-sm text-gray-600 mt-2">
                      Paid on {new Date(order.paidAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FaShoppingBag className="mr-2" />
                Order Items
              </h2>
              
              <div className="space-y-4">
                {order.orderItems?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 pb-4 border-b last:border-b-0">
                    <img
                      src={getItemImageUrl(item)}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                        e.target.onerror = null;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      {item.variant && (
                        <p className="text-sm text-gray-600">Variant: {item.variant}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Rs. {item.price.toLocaleString()} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>Rs. {order.itemsPrice?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{order.shippingPrice === 0 ? 'FREE' : `Rs. ${order.shippingPrice?.toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>Rs. {order.taxPrice?.toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary-600">
                      Rs. {order.totalPrice?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* What's Next */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">What's Next?</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Order Confirmation</p>
                    <p className="text-sm text-gray-600">You'll receive an email confirmation shortly</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Order Processing</p>
                    <p className="text-sm text-gray-600">We're preparing your order for shipment</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Shipping</p>
                    <p className="text-sm text-gray-600">Your order will be shipped within 1-2 business days</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">4</span>
                  </div>
                  <div>
                    <p className="font-medium">Delivery</p>
                    <p className="text-sm text-gray-600">Expected delivery: 2-5 business days</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaPrint className="mr-2" />
                Print Invoice
              </button>
              
              <button
                onClick={handleWhatsAppSupport}
                className="w-full flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <FaWhatsapp className="mr-2" />
                WhatsApp Support
              </button>
              
              <Link
                to="/"
                className="block w-full text-center px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <FaHome className="inline mr-2" />
                Continue Shopping
              </Link>
            </div>
            
            {/* Help Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Need Help?</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Call us: 0321-4203402</li>
                <li>• Email: hamzaxdevelopers1223@gmail.com</li>
                <li>• Live chat available 24/7</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Order Timeline */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Order Timeline</h3>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            <div className="space-y-6 relative">
              {/* Order Placed */}
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center z-10 mr-4">
                  <FaCheckCircle className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Order Placed</p>
                  <p className="text-sm text-gray-600">Your order has been received</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
              
              {/* Payment Status */}
              <div className="flex items-start">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 mr-4 ${
                  order.isPaid ? 'bg-green-500' : 'bg-yellow-500'
                }`}>
                  <FaCreditCard className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Payment {order.isPaid ? 'Confirmed' : 'Pending'}</p>
                  <p className="text-sm text-gray-600">
                    {order.isPaid ? 'Payment has been received' : 'Awaiting payment confirmation'}
                  </p>
                </div>
              </div>
              
              {/* Processing */}
              <div className="flex items-start">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 mr-4 ${
                  ['Processing', 'Shipped', 'Delivered'].includes(order.status) 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
                }`}>
                  <FaTruck className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Processing</p>
                  <p className="text-sm text-gray-600">
                    {order.status === 'Pending' ? 'Will start soon' : 'Your order is being prepared'}
                  </p>
                </div>
              </div>
              
              {/* Delivery */}
              <div className="flex items-start">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 mr-4 ${
                  order.status === 'Delivered' ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  <FaCheckCircle className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Delivery</p>
                  <p className="text-sm text-gray-600">
                    {order.status === 'Delivered' 
                      ? 'Order has been delivered' 
                      : 'Expected delivery within 5 business days'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>If you have any questions about your order, please contact our customer support.</p>
          <p className="mt-1">You can track your order status in your account dashboard.</p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;