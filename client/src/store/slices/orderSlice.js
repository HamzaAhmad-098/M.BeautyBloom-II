import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const initialState = {
  orders: [],
  order: null,
  loading: false,
  error: null,
  success: false,
  totalPages: 1,
  currentPage: 1,
};

// Create axios instance with interceptors
const axiosInstance = axios.create();

// Add request interceptor to include token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      sessionStorage.removeItem('userInfo');
      
      // Dispatch logout if we're in a Redux context
      if (window.store) {
        window.store.dispatch({ type: 'auth/logout' });
      }
      
      toast.error('Your session has expired. Please login again.');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData, { rejectWithValue, getState, dispatch }) => {
    try {
      const { auth: { userInfo } } = getState();
      
      // Get token from multiple sources
      const token = userInfo?.token || localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
      };

      const { data } = await axiosInstance.post('/api/orders', orderData, config);
      return data;
    } catch (error) {
      console.error('Create order error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to create order';
      
      if (error.response?.status === 401) {
        // Token is invalid, clear it
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        return rejectWithValue('Your session has expired. Please login again.');
      }
      
      return rejectWithValue(message);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchById',
  async ({ id, guestEmail = '' }, { rejectWithValue, getState }) => {
    try {
      const { auth: { userInfo } } = getState();
      
      // Get token from multiple sources
      const token = userInfo?.token || localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const config = {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        },
      };

      const url = guestEmail 
        ? `/api/orders/${id}?guestEmail=${encodeURIComponent(guestEmail)}`
        : `/api/orders/${id}`;
        
      const { data } = await axiosInstance.get(url, config);
      return data;
    } catch (error) {
      console.error('Fetch order by ID error:', error);
      const message = error.response?.data?.message || error.message || 'Order not found';
      
      if (error.response?.status === 401) {
        return rejectWithValue('Please login to view this order');
      }
      
      return rejectWithValue(message);
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMyOrders',
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const { auth: { userInfo } } = getState();
      
      // Check if user is authenticated
      if (!userInfo) {
        // Try to get token from storage
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          return rejectWithValue('Please login to view your orders');
        }
        
        // If we have token but no userInfo in Redux, dispatch to get user info
        if (window.store) {
          window.store.dispatch({ type: 'auth/getMe' });
        }
        
        return rejectWithValue('Please wait while we verify your session...');
      }

      // Get token from multiple sources
      const token = userInfo.token || localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('Please login to view your orders');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      console.log('Fetching orders with token:', token.substring(0, 20) + '...');
      const { data } = await axiosInstance.get('/api/orders/myorders', config);
      console.log('Orders data received:', data);
      return data;
    } catch (error) {
      console.error('Fetch my orders error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        // Clear invalid tokens
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        sessionStorage.removeItem('userInfo');
        
        return rejectWithValue('Your session has expired. Please login again.');
      }
      
      if (error.response?.status === 403) {
        return rejectWithValue('You are not authorized to view these orders.');
      }
      
      const message = error.response?.data?.message || error.message || 'Failed to fetch orders';
      return rejectWithValue(message);
    }
  }
);

export const fetchGuestOrders = createAsyncThunk(
  'orders/fetchGuestOrders',
  async (email, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/api/orders/guest/${encodeURIComponent(email)}`);
      return data;
    } catch (error) {
      console.error('Fetch guest orders error:', error);
      const message = error.response?.data?.message || error.message || 'No orders found';
      return rejectWithValue(message);
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrder: (state) => {
      state.order = null;
      state.success = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearOrders: (state) => {
      state.orders = [];
      state.error = null;
      state.loading = false;
    },
    // Add this to manually set orders if needed
    setOrders: (state, action) => {
      state.orders = action.payload;
      state.error = null;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
        state.success = true;
        // Add the new order to orders list
        state.orders = [action.payload, ...state.orders];
        toast.success('Order placed successfully!');
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to place order');
      })
      // Fetch Order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
        state.error = null;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.order = null;
      })
      // Fetch My Orders
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.error = null;
        console.log('Orders loaded successfully:', action.payload?.length || 0, 'orders');
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.orders = [];
        console.log('Error loading orders:', action.payload);
        
        // Show toast for auth errors
        if (action.payload?.includes('session') || action.payload?.includes('login')) {
          toast.error(action.payload);
        }
      })
      // Fetch Guest Orders
      .addCase(fetchGuestOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.error = null;
      })
      .addCase(fetchGuestOrders.rejected, (state, action) => {
        state.error = action.payload;
        state.orders = [];
      });
  },
});

export const { clearOrder, clearError, clearOrders, setOrders } = orderSlice.actions;
export default orderSlice.reducer;