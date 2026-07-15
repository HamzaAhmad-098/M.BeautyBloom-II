import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Get cart from localStorage
const getGuestCart = () => {
  const guestCart = localStorage.getItem('guestCart');
  return guestCart ? JSON.parse(guestCart) : [];
};

// Calculate totals based on current cart items
const calculateCartTotals = (cartItems) => {
  const cartTotal = cartItems.reduce((acc, item) => {
    // Try multiple ways to get the price
    let price = 0;
    
    if (item.price) {
      // If item has direct price property
      price = item.price;
    } else if (item.product) {
      // If item has nested product object
      if (item.product.discountPrice > 0) {
        price = item.product.discountPrice;
      } else {
        price = item.product.price || 0;
      }
    }
    
    return acc + (price * (item.quantity || 1));
  }, 0);
  
  const itemsCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  
  return { cartTotal, itemsCount };
};

const initialState = {
  cartItems: getGuestCart(),
  cartTotal: 0,
  itemsCount: 0,
  shippingAddress: localStorage.getItem('shippingAddress')
    ? JSON.parse(localStorage.getItem('shippingAddress'))
    : {},
  paymentMethod: localStorage.getItem('paymentMethod') || 'COD',
  loading: false,
  error: null,
};

// Recalculate totals on initial load
const initialTotals = calculateCartTotals(getGuestCart());
initialState.cartTotal = initialTotals.cartTotal;
initialState.itemsCount = initialTotals.itemsCount;

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Add item to cart - handles both product object and productId
    addItem: (state, action) => {
      const { product, productId, quantity = 1 } = action.payload;
      
      console.log('Adding to cart:', { product, productId, quantity });
      
      let productToAdd = product;
      
      // If we only have productId, create a minimal product object
      if (!product && productId) {
        productToAdd = {
          _id: productId,
          name: 'Product',
          price: 0,
          images: []
        };
      }
      
      if (!productToAdd) {
        console.error('No product or productId provided');
        return;
      }
      
      // Check if item already exists in cart
      const existingItem = state.cartItems.find(
        item => {
          // Try multiple ways to match the product
          if (item.product?._id === productToAdd._id) return true;
          if (item.productId === productToAdd._id) return true;
          if (item._id === productToAdd._id) return true;
          return false;
        }
      );

      if (existingItem) {
        // Update quantity if exists
        existingItem.quantity += quantity;
        toast.success(`Updated quantity to ${existingItem.quantity}`);
      } else {
        // Add new item with proper structure
        const cartItem = {
          _id: Date.now().toString(), // Unique ID for cart item
          product: productToAdd,
          productId: productToAdd._id,
          quantity,
          name: productToAdd.name,
          price: productToAdd.discountPrice > 0 ? productToAdd.discountPrice : productToAdd.price,
          image: productToAdd.images?.[0] || productToAdd.image || '',
          brand: productToAdd.brand || '',
        };
        state.cartItems.push(cartItem);
        toast.success('Added to cart! 🛒');
      }

      // Recalculate totals
      const totals = calculateCartTotals(state.cartItems);
      state.cartTotal = totals.cartTotal;
      state.itemsCount = totals.itemsCount;
      
      // Save to localStorage for guest users
      localStorage.setItem('guestCart', JSON.stringify(state.cartItems));
      
      console.log('Updated cart:', state.cartItems);
    },
    
    // Remove item from cart
    removeItem: (state, action) => {
      const itemId = action.payload;
      state.cartItems = state.cartItems.filter(item => item._id !== itemId);
      
      // Recalculate totals
      const totals = calculateCartTotals(state.cartItems);
      state.cartTotal = totals.cartTotal;
      state.itemsCount = totals.itemsCount;
      
      localStorage.setItem('guestCart', JSON.stringify(state.cartItems));
      toast.success('Item removed from cart');
    },
    
    // Update item quantity
    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.cartItems.find(item => item._id === itemId);
      
      if (item && quantity > 0) {
        item.quantity = quantity;
        
        // Recalculate totals
        const totals = calculateCartTotals(state.cartItems);
        state.cartTotal = totals.cartTotal;
        state.itemsCount = totals.itemsCount;
        
        localStorage.setItem('guestCart', JSON.stringify(state.cartItems));
      }
    },
    
    // Clear entire cart
    clearCart: (state) => {
      state.cartItems = [];
      state.cartTotal = 0;
      state.itemsCount = 0;
      localStorage.removeItem('guestCart');
      toast.success('Cart cleared');
    },
    
    // Save shipping address
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
    },
    
    // Save payment method
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem('paymentMethod', action.payload);
    },
    
    // Sync cart with user account (when user logs in)
    syncCartWithUser: (state, action) => {
      const serverCart = action.payload || [];
      
      // Merge local cart with server cart
      const mergedCart = [...state.cartItems];
      
      serverCart.forEach(serverItem => {
        const existingIndex = mergedCart.findIndex(
          localItem => localItem.product?._id === serverItem.product?._id
        );
        
        if (existingIndex >= 0) {
          // Update quantity if item exists
          mergedCart[existingIndex].quantity += serverItem.quantity;
        } else {
          // Add new item
          mergedCart.push(serverItem);
        }
      });
      
      state.cartItems = mergedCart;
      
      // Recalculate totals
      const totals = calculateCartTotals(state.cartItems);
      state.cartTotal = totals.cartTotal;
      state.itemsCount = totals.itemsCount;
      
      localStorage.setItem('guestCart', JSON.stringify(state.cartItems));
    },
    
    // Load cart from server (for logged in users)
    loadCart: (state, action) => {
      state.cartItems = action.payload || [];
      
      // Recalculate totals
      const totals = calculateCartTotals(state.cartItems);
      state.cartTotal = totals.cartTotal;
      state.itemsCount = totals.itemsCount;
      
      localStorage.setItem('guestCart', JSON.stringify(state.cartItems));
    },
  },
});

// Thunk action creators
export const addToCart = (productData) => (dispatch, getState) => {
  console.log('addToCart thunk called with:', productData);
  
  // Handle different input formats
  if (productData.productId && !productData.product) {
    // If we only have productId, we need to get the product from state
    const { products } = getState();
    const product = products.productList?.find(p => p._id === productData.productId);
    
    if (product) {
      dispatch(addItem({ 
        product, 
        productId: productData.productId, 
        quantity: productData.quantity || 1 
      }));
    } else {
      // Product not found locally — don't fabricate a fake placeholder item.
      console.error('addToCart: product not found in state for id', productData.productId);
      toast.error('Could not add item — please refresh and try again');
    }
  } else {
    // If we have full product object
    dispatch(addItem({
      product: productData.product,
      productId: productData.product?._id || productData.productId,
      quantity: productData.quantity || 1
    }));
  }
};

// Export actions
export const {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  saveShippingAddress,
  savePaymentMethod,
  syncCartWithUser,
  loadCart,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.cartItems;
export const selectCartTotal = (state) => state.cart.cartTotal;
export const selectItemsCount = (state) => state.cart.itemsCount;
export const selectShippingAddress = (state) => state.cart.shippingAddress;
export const selectPaymentMethod = (state) => state.cart.paymentMethod;

export default cartSlice.reducer;