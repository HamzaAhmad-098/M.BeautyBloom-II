import api from '@/services/adminApi';

export const checkoutApi = {
  // Get cart items
  getCart: () => api.get('/cart'),
  
  // Clear cart
  clearCart: () => api.delete('/cart'),
  
  // Create order
  createOrder: (orderData) => api.post('/orders', orderData),
  
  // Update order payment status
  updateOrderPayment: (orderId, paymentData) => 
    api.put(`/orders/${orderId}/pay`, paymentData),
  
  // Process card payment
  processCardPayment: (paymentData) => 
    api.post('/payment/create-payment-intent', paymentData),
  
  // Process mobile payment
  processMobilePayment: (paymentData) => {
    const { method, ...data } = paymentData;
    return api.post(`/payment/${method}`, data);
  },
  
  // Save address
  saveAddress: (addressData) => 
    api.post('/users/address', addressData),
  
  // Get user addresses
  getUserAddresses: () => 
    api.get('/users/address'),
  
  // Get order by ID
  getOrder: (orderId) => 
    api.get(`/orders/${orderId}`),
  
  // Cancel order
  cancelOrder: (orderId, reason) => 
    api.put(`/orders/${orderId}/cancel`, { reason }),
  
  // Get shipping methods
  getShippingMethods: () => 
    api.get('/shipping/methods'),
  
  // Calculate shipping cost
  calculateShipping: (address) => 
    api.post('/shipping/calculate', address),
  
  // Apply promo code
  applyPromoCode: (code) => 
    api.post('/promo/apply', { code }),
};

export default checkoutApi;