import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveShippingAddress, savePaymentMethod, clearCart as clearCartAction } from '../store/slices/cartSlice.js';
import { createOrder } from '../store/slices/orderSlice.js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaShoppingCart, FaTruck, FaCreditCard, FaCheckCircle } from 'react-icons/fa';
import { analytics } from '@/utils/analytics';
import { sendOrderToWhatsApp } from '../utils/whatsappOrder';
const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems, cartTotal } = useSelector((state) => state.cart);
  
  // Guest mode - no user info required
  const [isGuest] = useState(true);

  // Shipping address for guest
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    country: 'Pakistan',
    phone: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [placing, setPlacing] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  // Calculate prices
  const itemsPrice = Number(cartTotal || 0);
  const taxPrice = 0;
  const shippingPrice = itemsPrice > 2000 ? 0 : 250;
  const totalPrice = Number((itemsPrice + taxPrice + shippingPrice).toFixed(2));

  // Helper function to construct Cloudinary image URL
  const getImageUrl = (imageData) => {
    if (!imageData) {
      return 'https://via.placeholder.com/60';
    }

    // If it's a string, check if it's already a full URL
    if (typeof imageData === 'string') {
      if (imageData.includes('http')) {
        return imageData;
      }
      // If it looks like a public_id, construct Cloudinary URL
      const cloudName = 'dr1rajqzy';
      const publicId = imageData.startsWith('/') ? imageData.substring(1) : imageData;
      return `https://res.cloudinary.com/${cloudName}/image/upload/w_60,h_60,c_fill,q_auto,f_auto/${publicId}`;
    }

    // If it's an object with url property
    if (imageData.url) {
      // If it's already a full Cloudinary URL, return it
      if (imageData.url.includes('cloudinary.com')) {
        return imageData.url;
      }
      // If it's any other URL
      if (imageData.url.includes('http')) {
        return imageData.url;
      }
      // If url is a public_id, construct URL
      const cloudName = 'dr1rajqzy';
      const publicId = imageData.url.startsWith('/') ? imageData.url.substring(1) : imageData.url;
      return `https://res.cloudinary.com/${cloudName}/image/upload/w_60,h_60,c_fill,q_auto,f_auto/${publicId}`;
    }

    // If we have a public_id but no URL, construct Cloudinary URL
    if (imageData.public_id) {
      const cloudName = 'dr1rajqzy';
      const publicId = imageData.public_id.startsWith('/') 
        ? imageData.public_id.substring(1) 
        : imageData.public_id;
      return `https://res.cloudinary.com/${cloudName}/image/upload/w_60,h_60,c_fill,q_auto,f_auto/${publicId}`;
    }

    // Fallback
    return 'https://via.placeholder.com/60';
  };

  // Get image URL from item
  const getItemImageUrl = (item) => {
    // Try different possible image locations in order of priority
    if (item.image) {
      return getImageUrl(item.image);
    }
    if (item.product?.images && item.product.images.length > 0) {
      // Use the same logic as in Products.jsx
      const firstImage = item.product.images[0];
      if (firstImage.url) {
        // Return the Cloudinary URL directly
        return firstImage.url;
      }
      if (firstImage.public_id) {
        // Construct Cloudinary URL from public_id
        return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || 'dr1rajqzy'}/image/upload/${firstImage.public_id}`;
      }
      // Fallback for any other format
      return typeof firstImage === 'string' 
        ? firstImage 
        : 'https://via.placeholder.com/60';
    }
    if (item.product?.image) {
      return getImageUrl(item.product.image);
    }
    return 'https://via.placeholder.com/60';
  };

  useEffect(() => {
    // Clear any user sessi
    // on data to ensure guest mode
    localStorage.removeItem('redirectPath');
  }, []);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const required = ['name', 'email', 'address', 'city', 'phone'];
    for (const field of required) {
      if (!shippingAddress[field]?.trim()) {
        return `Please fill in ${field}`;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingAddress.email)) {
      return 'Please enter a valid email address';
    }

    return null;
  };

  const handleNextStep = () => {
    if (activeStep === 1) {
      const error = validateForm();
      if (error) {
        toast.error(error);
        return;
      }
      setActiveStep(2);
    }
  };

  const handlePlaceOrder = async () => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    setPlacing(true);

    // Prepare order items
    const orderItems = cartItems.map(item => ({
      name: item.name || item.product?.name || 'Product',
      quantity: item.quantity || 1,
      image: item.image || item.product?.images?.[0] || '',
      price: item.price || (item.product?.discountPrice > 0 ? item.product.discountPrice : item.product?.price) || 0,
      product: item.productId || item.product?._id,
    }));

    // Prepare order data for guest
    const orderData = {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      guestUser: {
        name: shippingAddress.name,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
      }
    };

    try {
      console.log('Placing guest order:', orderData);
      
      // Save shipping address to localStorage
      dispatch(saveShippingAddress(shippingAddress));
      dispatch(savePaymentMethod(paymentMethod));
      
      // Create order
      const action = await dispatch(createOrder(orderData));
      
      if (createOrder.fulfilled.match(action)) {
        const createdOrder = action.payload;

        // Send the same order to WhatsApp so the team can confirm it directly.
        // The order is already safely saved in the database above.
        try {
          sendOrderToWhatsApp({
            orderId: createdOrder._id || createdOrder.orderNumber,
            items: orderItems.map((it) => ({
              name: it.name,
              quantity: it.quantity,
              price: it.price,
            })),
            customer: {
              name: shippingAddress.name,
              phone: shippingAddress.phone,
              email: shippingAddress.email,
              address: shippingAddress.address,
              city: shippingAddress.city,
            },
            total: totalPrice,
          });
        } catch (waError) {
          console.error('WhatsApp order message could not be opened:', waError);
        }

        // Clear cart
        dispatch(clearCartAction());
        
        toast.success('Order placed! Opening WhatsApp to confirm...');
        
        // Redirect to order confirmation
        navigate(`/order-confirmation/${createdOrder._id}`);
      } else {
        throw new Error(action.payload || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-gray-300 mb-6">
            <FaShoppingCart className="w-24 h-24 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add items to your cart before checking out.</p>
          <button
            onClick={() => navigate('/shop')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Guest Checkout Banner */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-blue-500 text-xl">👤</span>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-blue-800">Guest Checkout</h3>
              <p className="text-blue-600">
                You're checking out as a guest. No account needed!
              </p>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
        <p className="text-gray-600 mb-8">Complete your purchase in simple steps</p>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          <div className={`flex items-center ${activeStep >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${activeStep >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span>Shipping</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
          <div className={`flex items-center ${activeStep >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${activeStep >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span>Payment</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            {activeStep === 1 ? (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <FaTruck className="mr-2" />
                  Shipping Information
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={shippingAddress.name}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={shippingAddress.email}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={shippingAddress.address}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Street address"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Karachi"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={shippingAddress.country}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0300 1234567"
                      required
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleNextStep}
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-semibold"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <FaCreditCard className="mr-2" />
                  Payment Method
                </h2>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="COD"
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                        className="h-5 w-5 text-primary-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium">Cash on Delivery (COD)</div>
                        <p className="text-sm text-gray-500">Pay when you receive your order</p>
                      </div>
                      <span className="text-green-600 font-semibold">Available</span>
                    </label>

                    <label className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="JazzCash"
                        checked={paymentMethod === 'JazzCash'}
                        onChange={() => setPaymentMethod('JazzCash')}
                        className="h-5 w-5 text-primary-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium">JazzCash</div>
                        <p className="text-sm text-gray-500">Pay via JazzCash mobile wallet</p>
                      </div>
                      <span className="text-green-600 font-semibold">Available</span>
                    </label>

                    <label className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="Easypaisa"
                        checked={paymentMethod === 'Easypaisa'}
                        onChange={() => setPaymentMethod('Easypaisa')}
                        className="h-5 w-5 text-primary-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium">Easypaisa</div>
                        <p className="text-sm text-gray-500">Pay via Easypaisa mobile wallet</p>
                      </div>
                      <span className="text-green-600 font-semibold">Available</span>
                    </label>
                  </div>

                  <div className="pt-4 flex space-x-4">
                    <button
                      onClick={() => setActiveStep(1)}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50"
                    >
                      Back to Shipping
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={placing}
                      className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-semibold disabled:opacity-60 flex items-center justify-center"
                    >
                      {placing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FaCheckCircle className="mr-2" />
                          Place Order
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

              <div className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={getItemImageUrl(item)}
                          alt={item.name || item.product?.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { 
                            e.target.src = 'https://via.placeholder.com/60?text=No+Image';
                            e.target.onerror = null;
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name || item.product?.name}</p>
                        <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                        Priced on WhatsApp
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown hidden from customer */}
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                      Confirmed on WhatsApp
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;