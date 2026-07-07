// Enhanced e-commerce tracking for GA4
export const analytics = {
  // Track product views
  trackProductView: (product) => {
    if (window.gtag) {
      window.gtag('event', 'view_item', {
        currency: 'PKR',
        value: product.price || product.discountPrice,
        items: [{
          item_id: product._id,
          item_name: product.name,
          item_category: product.category,
          price: product.price || product.discountPrice,
          quantity: 1
        }]
      });
    }
  },

  // Track add to cart
  trackAddToCart: (product, quantity = 1) => {
    if (window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'PKR',
        value: (product.price || product.discountPrice) * quantity,
        items: [{
          item_id: product._id || product.productId,
          item_name: product.name,
          item_category: product.category,
          price: product.price || product.discountPrice,
          quantity: quantity
        }]
      });
    }
  },

  // Track remove from cart
  trackRemoveFromCart: (product, quantity = 1) => {
    if (window.gtag) {
      window.gtag('event', 'remove_from_cart', {
        currency: 'PKR',
        value: (product.price || product.discountPrice) * quantity,
        items: [{
          item_id: product._id || product.productId,
          item_name: product.name,
          item_category: product.category,
          price: product.price || product.discountPrice,
          quantity: quantity
        }]
      });
    }
  },

  // Track purchase
  trackPurchase: (order) => {
    if (window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: order._id,
        value: order.totalPrice,
        currency: 'PKR',
        tax: order.taxPrice,
        shipping: order.shippingPrice,
        items: order.orderItems.map(item => ({
          item_id: item.product?._id || item.product,
          item_name: item.name,
          item_category: item.category,
          price: item.price,
          quantity: item.quantity
        }))
      });
    }
  },

  // Track begin checkout
  trackBeginCheckout: (cartItems, total) => {
    if (window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'PKR',
        value: total,
        items: cartItems.map(item => ({
          item_id: item.product?._id || item.productId,
          item_name: item.name,
          item_category: item.category,
          price: item.price || (item.product?.discountPrice > 0 ? item.product.discountPrice : item.product?.price),
          quantity: item.quantity || 1
        }))
      });
    }
  },

  // Track search
  trackSearch: (searchTerm) => {
    if (window.gtag) {
      window.gtag('event', 'search', {
        search_term: searchTerm
      });
    }
  },

  // Track user registration
  trackRegistration: (userType = 'registered') => {
    if (window.gtag) {
      window.gtag('event', 'sign_up', {
        method: userType
      });
    }
  },

  // Track user login
  trackLogin: (method = 'email') => {
    if (window.gtag) {
      window.gtag('event', 'login', {
        method: method
      });
    }
  },

  // Track wishlist addition
  trackAddToWishlist: (product) => {
    if (window.gtag) {
      window.gtag('event', 'add_to_wishlist', {
        currency: 'PKR',
        value: product.price || product.discountPrice,
        items: [{
          item_id: product._id,
          item_name: product.name,
          item_category: product.category,
          price: product.price || product.discountPrice,
          quantity: 1
        }]
      });
    }
  },

  // Track product share
  trackShare: (product, method = 'direct') => {
    if (window.gtag) {
      window.gtag('event', 'share', {
        method: method,
        content_type: 'product',
        content_id: product._id
      });
    }
  }
};