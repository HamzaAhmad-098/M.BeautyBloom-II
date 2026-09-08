import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { removeItem, updateQuantity, clearCart } from '../store/slices/cartSlice.js';
import { FaTrash, FaPlus, FaMinus, FaShoppingBag, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { analytics } from '@/utils/analytics';
import { sendOrderToWhatsApp } from '../utils/whatsappOrder';
const Cart = () => {
  const { cartItems, cartTotal, itemsCount } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [updatingId, setUpdatingId] = useState(null);

  const shippingPrice = cartTotal > 2000 ? 0 : 250;
  const taxPrice = 0;
  const totalPrice = cartTotal + shippingPrice + taxPrice;

  // Helper function to construct Cloudinary image URL
  const getImageUrl = (imageData) => {
    if (!imageData) {
      return 'https://via.placeholder.com/150';
    }

    // If it's a string, check if it's already a full URL
    if (typeof imageData === 'string') {
      if (imageData.includes('http')) {
        return imageData;
      }
      // If it looks like a public_id, construct Cloudinary URL
      const cloudName = 'dr1rajqzy';
      const publicId = imageData.startsWith('/') ? imageData.substring(1) : imageData;
      return `https://res.cloudinary.com/${cloudName}/image/upload/w_200,h_200,c_fill,q_auto,f_auto/${publicId}`;
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
      return `https://res.cloudinary.com/${cloudName}/image/upload/w_200,h_200,c_fill,q_auto,f_auto/${publicId}`;
    }

    // If we have a public_id but no URL, construct Cloudinary URL
    if (imageData.public_id) {
      const cloudName = 'dr1rajqzy';
      const publicId = imageData.public_id.startsWith('/') 
        ? imageData.public_id.substring(1) 
        : imageData.public_id;
      return `https://res.cloudinary.com/${cloudName}/image/upload/w_200,h_200,c_fill,q_auto,f_auto/${publicId}`;
    }

    // Fallback
    return 'https://via.placeholder.com/150';
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
        : 'https://via.placeholder.com/150';
    }
    if (item.product?.image) {
      return getImageUrl(item.product.image);
    }
    return 'https://via.placeholder.com/150';
  };

  // Get available stock for an item
  const getAvailableStock = (item) => {
    // Check both stock and countInStock fields (as per Product model)
    const productStock = item.product?.stock || item.product?.countInStock || 0;
    const itemStock = item.stock || item.countInStock || 0;
    return Math.max(productStock, itemStock);
  };

  // Check if item is in stock
  const isInStock = (item) => {
    return getAvailableStock(item) > 0;
  };

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    
    const availableStock = getAvailableStock(item);
    
    // Check stock availability
    if (newQuantity > availableStock) {
      toast.error(`Only ${availableStock} items available in stock`);
      return;
    }
    
    setUpdatingId(item._id);
    dispatch(updateQuantity({ itemId: item._id, quantity: newQuantity }));
    
    setTimeout(() => setUpdatingId(null), 300);
  };

  const handleRemoveItem = (itemId) => {
    if (window.confirm('Remove this item from cart?')) {
      dispatch(removeItem(itemId));
    }
    analytics.trackRemoveFromCart(item);
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart());
    }
    
  };

  // Check if there are any out of stock items
  const hasOutOfStockItems = cartItems.some(item => !isInStock(item));

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <div className="text-gray-300 mb-6 animate-float">
            <FaShoppingBag className="w-24 h-24 mx-auto" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Looks like you haven't added any products to your cart yet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/shop"
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 mobile-tap-target"
            >
              Continue Shopping
            </Link>
            <Link
              to="/"
              className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors mobile-tap-target"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
      <div className="max-w-7xl mx-auto animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <FaShoppingBag className="mr-3 text-primary-500" />
          Shopping Cart ({itemsCount} {itemsCount === 1 ? 'item' : 'items'})
        </h1>

        {/* Out of Stock Warning */}
        {hasOutOfStockItems && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <FaExclamationTriangle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800 mb-1">Some items are out of stock</h3>
              <p className="text-sm text-red-700">
                Please remove out of stock items before proceeding to checkout.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const availableStock = getAvailableStock(item);
              const itemInStock = isInStock(item);
              
              return (
                <div
                  key={item._id || `${item.productId}-${Date.now()}`}
                  className={`bg-white rounded-xl shadow-sm p-4 transition-all duration-300 ${
                    !itemInStock ? 'border-2 border-red-200 bg-red-50' : 'hover:shadow-md'
                  } animate-slide-in`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <Link 
                      to={`/product/${item.productId || item.product?._id}`} 
                      className="flex-shrink-0 relative"
                    >
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={getItemImageUrl(item)}
                          alt={item.name || item.product?.name}
                          className={`w-full h-full object-cover transition-transform duration-300 ${
                            itemInStock ? 'hover:scale-110' : 'opacity-50'
                          }`}
                          onError={(e) => { 
                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                            e.target.onerror = null;
                          }}
                        />
                        {!itemInStock && (
                          <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center">
                            <span className="text-xs font-bold text-red-700 bg-white px-2 py-1 rounded">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.productId || item.product?._id}`}>
                        <h3 className="font-semibold text-gray-800 hover:text-primary-600 text-sm sm:text-base line-clamp-2">
                          {item.name || item.product?.name || 'Product'}
                        </h3>
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.brand || item.product?.brand || 'Brand'}
                      </p>

                      {/* Stock Status */}
                      {itemInStock ? (
                        <p className="text-xs text-green-600 mt-1 font-medium">
                          {availableStock > 10 
                            ? 'In Stock' 
                            : `Only ${availableStock} left in stock`}
                        </p>
                      ) : (
                        <p className="text-xs text-red-600 mt-1 font-bold">
                          Out of Stock
                        </p>
                      )}

                      <div className="mt-2">
                        <span className="font-bold text-gray-900">
                          Rs. {(
                            (item.price || 
                             (item.product?.discountPrice > 0 
                              ? item.product?.discountPrice 
                              : item.product?.price) || 0) * (item.quantity || 1)
                          ).toLocaleString()}
                        </span>
                        {item.product?.discountPrice > 0 && item.product?.price && (
                          <span className="text-xs text-gray-500 line-through ml-2">
                            Rs. {(item.product?.price * (item.quantity || 1)).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="mt-3 flex items-center space-x-3">
                        {itemInStock ? (
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => handleQuantityChange(item, (item.quantity || 1) - 1)}
                              disabled={item.quantity <= 1 || updatingId === item._id}
                              className="p-2 hover:bg-gray-100 disabled:opacity-50 mobile-tap-target"
                            >
                              <FaMinus className="text-gray-600 text-xs" />
                            </button>
                            <span className="w-12 text-center font-medium">
                              {updatingId === item._id ? '...' : item.quantity || 1}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item, (item.quantity || 1) + 1)}
                              disabled={updatingId === item._id || item.quantity >= availableStock}
                              className="p-2 hover:bg-gray-100 disabled:opacity-50 mobile-tap-target"
                            >
                              <FaPlus className="text-gray-600 text-xs" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-red-600 font-medium">
                            Not available
                          </span>
                        )}
                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center mobile-tap-target"
                        >
                          <FaTrash className="mr-1 text-xs" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Cart Actions */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <Link
                  to="/shop"
                  className="text-primary-600 hover:text-primary-700 font-medium flex items-center mobile-tap-target"
                >
                  <FaArrowLeft className="mr-2" />
                  Continue Shopping
                </Link>
                <button
                  onClick={handleClearCart}
                  className="text-red-500 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors mobile-tap-target"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24 animate-scale-in">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({itemsCount} items)</span>
                  <span className="font-medium">Rs. {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shippingPrice === 0 ? 'FREE' : `Rs. ${shippingPrice}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (0%)</span>
                  <span className="font-medium">Rs. {taxPrice.toLocaleString()}</span>
                </div>
                
                {shippingPrice > 0 && cartTotal < 2000 && (
                  <div className="p-3 bg-green-50 rounded-lg mt-3 animate-pulse">
                    <p className="text-sm text-green-700">
                      Add Rs. {(2000 - cartTotal).toLocaleString()} more for free shipping!
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between text-lg font-bold mb-2">
                  <span>Total</span>
                  <span className="text-primary-600">Rs. {totalPrice.toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-500">
                  Including all taxes and shipping
                </p>
              </div>
              <div className="mt-6 space-y-3">
                {hasOutOfStockItems ? (
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 cursor-not-allowed py-3 rounded-lg font-semibold mobile-tap-target"
                  >
                    Remove Out of Stock Items
                  </button>
                ) : (
                  // NOTE: Checkout-form flow is temporarily disabled per current
                  // WhatsApp-only ordering process. The <Link to="/checkout"> version
                  // is kept below (commented) so it can be switched back on later.
                  // <Link to="/checkout" className="...">Proceed to Checkout</Link>
                  <button
                    onClick={() => {
                      sendOrderToWhatsApp({
                        items: cartItems.map((item) => ({
                          name: item.name || item.product?.name || 'Product',
                          variant: item.variant,
                          quantity: item.quantity || 1,
                          price: item.price || (item.product?.discountPrice > 0 ? item.product.discountPrice : item.product?.price) || 0,
                        })),
                        total: totalPrice,
                      });
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:opacity-90 text-white text-center py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 mobile-tap-target"
                  >
                    <svg viewBox="0 0 32 32" width="20" height="20" fill="#fff"><path d="M16.004 3C9.375 3 4 8.373 4 15c0 2.34.65 4.53 1.78 6.4L4 29l7.78-1.75A11.9 11.9 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3z"/></svg>
                    Order via WhatsApp
                  </button>
                )}
                
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 mt-4">
                  <span className="px-2 py-1 bg-gray-100 rounded">COD</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">JazzCash</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">Easypaisa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;