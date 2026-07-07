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
  FaWhatsapp
} from 'react-icons/fa';
import { checkoutApi } from '../../services/checkoutApi';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
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
    const url = `https://wa.me/923214203402?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
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
        
        {/* Order Summary Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border-r border-gray-200">
              <div className="text-3xl font-bold text-primary-600">#{order._id}</div>
              <div className="text-sm text-gray-500 mt-1">Order Number</div>
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
                  <p className="text-gray-600">
                    {order.isPaid ? 'Payment Completed' : 'Payment Pending'}
                  </p>
                </div>
                
                {order.paymentResult?.id && (
                  <div className="text-sm">
                    <span className="text-gray-500">Transaction ID: </span>
                    <span className="font-mono">{order.paymentResult.id}</span>
                  </div>
                )}
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
                  <div key={index} className="flex items-center py-3 border-b border-gray-100 last:border-0">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={item.image || '/placeholder-product.jpg'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Price Breakdown */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>Rs. {order.itemsPrice?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>Rs. {order.shippingPrice?.toLocaleString()}</span>
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
          </div>
          
          {/* Next Steps Sidebar */}
          <div className="space-y-6">
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
                <li>• Email: hamzaxdevelopers1223.com</li>
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