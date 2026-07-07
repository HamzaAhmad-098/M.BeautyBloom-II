import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// API URLs - Use environment variable or relative URL
const API_URL = process.env.REACT_APP_API_URL || '/api';

// Update getUserFromStorage function
const getUserFromStorage = () => {
  try {
    const userInfo = localStorage.getItem('userInfo');
    const parsedUser = userInfo ? JSON.parse(userInfo) : null;
    
    // Don't allow login if not verified
    if (parsedUser && !parsedUser.isVerified) {
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
      // Move to unverified storage
      localStorage.setItem('unverifiedUser', JSON.stringify(parsedUser));
      return null;
    }
    
    return parsedUser;
  } catch (error) {
    console.error('Error parsing user info:', error);
    return null;
  }
};

// Helper to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const initialState = {
  userInfo: getUserFromStorage(),
  loading: false,
  error: null,
  success: false,
  // Check both token existence and validity
  isAuthenticated: !!(localStorage.getItem('token') && !isTokenExpired(localStorage.getItem('token')) && getUserFromStorage()),
  token: localStorage.getItem('token') || null,
  verificationRequired: localStorage.getItem('unverifiedUser') ? true : false,
};

// Set auth headers globally
const setAuthHeaders = (token) => {
  if (token && !isTokenExpired(token)) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Initialize auth headers
const token = localStorage.getItem('token');
if (token && !isTokenExpired(token)) {
  setAuthHeaders(token);
} else {
  // Clear invalid token
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
}

// Async Thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/register`, userData);
      
      // Save token and user info
      localStorage.setItem('userInfo', JSON.stringify(data.user || data));
      localStorage.setItem('token', data.token);
      setAuthHeaders(data.token);
      
      return {
        user: data.user || data,
        token: data.token,
        message: data.message || 'Registration successful!'
      };
    } catch (error) {
      const message = error.response?.data?.message || 
                     error.response?.data?.error || 
                     'Registration failed. Please try again.';
      return rejectWithValue(message);
    }
  }
);

// In the login async thunk, add email verification check
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password, rememberMe = false }, { rejectWithValue }) => {
    try {
      console.log('Attempting login to:', `${API_URL}/auth/login`);
      const { data } = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      console.log('Login response:', data);
      
      // Check if verification is required
      if (data.requiresVerification) {
        // Save unverified user for verification page
        localStorage.setItem('unverifiedUser', JSON.stringify(data.user));
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        
        return rejectWithValue({
          message: 'Please verify your email before logging in.',
          requiresVerification: true,
          user: data.user
        });
      }
      
      // Ensure user object has isAdmin property
      const user = data.user || data;
      if (!user.hasOwnProperty('isAdmin')) {
        user.isAdmin = user.role === 'admin' || false;
      }
      
      // Save token and user info (only if verified)
      localStorage.setItem('userInfo', JSON.stringify(user));
      localStorage.setItem('token', data.token);
      setAuthHeaders(data.token);
      
      // Remove unverified user data if exists
      localStorage.removeItem('unverifiedUser');
      
      // Set remember me flag
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }
      
      return {
        user,
        token: data.token,
        message: data.message || 'Login successful!'
      };
    } catch (error) {
      console.error('Login error details:', error.response?.data || error.message);
      const message = error.response?.data?.message || 
                     error.response?.data?.error || 
                     error.message || 
                     'Login failed. Please check your credentials.';
      return rejectWithValue(message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (token && !isTokenExpired(token)) {
        await axios.post(`${API_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, we should still logout locally
    } finally {
      // Clear all auth data
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
      localStorage.removeItem('guestCart');
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('unverifiedUser');
      sessionStorage.removeItem('userInfo');
      sessionStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      
      return null;
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/auth/me`);
      
      // Ensure user object has isAdmin property
      const user = data.user || data;
      if (!user.hasOwnProperty('isAdmin')) {
        user.isAdmin = user.role === 'admin' || false;
      }
      
      // Update localStorage
      localStorage.setItem('userInfo', JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Get me error:', error.response?.data || error.message);
      
      // If token is invalid, logout
      if (error.response?.status === 401) {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
        localStorage.removeItem('unverifiedUser');
        delete axios.defaults.headers.common['Authorization'];
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to get user profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`${API_URL}/auth/updatedetails`, userData);
      
      // Update localStorage
      const currentUser = JSON.parse(localStorage.getItem('userInfo'));
      const updatedUser = { ...currentUser, ...data.user };
      
      // Ensure isAdmin property
      if (!updatedUser.hasOwnProperty('isAdmin')) {
        updatedUser.isAdmin = updatedUser.role === 'admin' || false;
      }
      
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      
      return {
        user: updatedUser,
        message: data.message || 'Profile updated successfully'
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      return rejectWithValue(message);
    }
  }
);

export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`${API_URL}/auth/updatepassword`, {
        currentPassword,
        newPassword,
      });
      
      // Update token if returned
      if (data.token) {
        localStorage.setItem('token', data.token);
        setAuthHeaders(data.token);
      }
      
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Password update failed';
      return rejectWithValue(message);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/forgotpassword`, { email });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      return rejectWithValue(message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`${API_URL}/auth/resetpassword/${token}`, {
        password,
      });
      
      // Auto login after password reset if token is returned
      if (data.token) {
        localStorage.setItem('token', data.token);
        setAuthHeaders(data.token);
        
        // Get user info
        const userResponse = await axios.get(`${API_URL}/auth/me`);
        const user = userResponse.data.user || userResponse.data;
        
        if (!user.hasOwnProperty('isAdmin')) {
          user.isAdmin = user.role === 'admin' || false;
        }
        
        localStorage.setItem('userInfo', JSON.stringify(user));
      }
      
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      return rejectWithValue(message);
    }
  }
);

// In authSlice.js, add these actions:

// Verify email with token
export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      const response = await axios.post(
        `${API_URL}/auth/verify-email/${token}`,
        {},
        config
      );
      
      const data = response.data;
      
      // Store token and user in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data.user));
      setAuthHeaders(data.token);
      
      // Remove unverified user
      localStorage.removeItem('unverifiedUser');
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Email verification failed'
      );
    }
  }
);

// Resend verification email
export const resendVerification = createAsyncThunk(
  'auth/resendVerification',
  async (email, { rejectWithValue }) => {
    try {
      // If email is provided (for unverified users), use that
      // Otherwise, get from state
      let userEmail = email;
      
      if (!userEmail) {
        // Try to get from unverified storage
        const unverifiedUser = localStorage.getItem('unverifiedUser');
        if (unverifiedUser) {
          const user = JSON.parse(unverifiedUser);
          userEmail = user.email;
        }
      }
      
      if (!userEmail) {
        return rejectWithValue('Email is required to resend verification');
      }
      
      const response = await axios.post(
        `${API_URL}/auth/resend-verification`,
        { email: userEmail }
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to resend verification email'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.success = false;
    },
    clearAuth: (state) => {
      state.userInfo = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.success = false;
      state.verificationRequired = false;
    },
    setUser: (state, action) => {
      state.userInfo = action.payload;
      state.isAuthenticated = true;
    },
    setVerificationRequired: (state, action) => {
      state.verificationRequired = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.success = true;
        state.verificationRequired = false;
        toast.success(action.payload.message);
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.success = true;
        state.verificationRequired = false;
        toast.success(action.payload.message);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload;
        state.isAuthenticated = false;
        
        // If verification is required, set the flag
        if (action.payload?.requiresVerification) {
          state.verificationRequired = true;
          state.userInfo = action.payload.user;
          toast.error(action.payload.message);
        } else {
          toast.error(action.payload?.message || action.payload);
        }
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.userInfo = null;
        state.token = null;
        state.isAuthenticated = false;
        state.success = false;
        state.verificationRequired = false;
        toast.success('Logged out successfully');
      })
      
      // Get Me
      .addCase(getMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.isAuthenticated = true;
        state.verificationRequired = false;
      })
      .addCase(getMe.rejected, (state) => {
        state.loading = false;
        state.userInfo = null;
        state.isAuthenticated = false;
        state.verificationRequired = false;
      })
      
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.userInfo = action.payload.user;
        toast.success(action.payload.message);
      })
      
      // Update Password
      .addCase(updatePassword.fulfilled, (state) => {
        toast.success('Password updated successfully');
      })
      
      // Forgot Password
      .addCase(forgotPassword.fulfilled, (state, action) => {
        toast.success(action.payload.message || 'Password reset email sent');
      })
      
      // Reset Password
      .addCase(resetPassword.fulfilled, (state, action) => {
        if (action.payload.token) {
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
        toast.success(action.payload.message || 'Password reset successful');
      })
      
      // Verify Email
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.success = true;
        state.verificationRequired = false;
        toast.success(action.payload.message || 'Email verified successfully');
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Resend Verification
      .addCase(resendVerification.pending, (state) => {
        state.loading = true;
      })
      .addCase(resendVerification.fulfilled, (state) => {
        state.loading = false;
        toast.success('Verification email sent');
      })
      .addCase(resendVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { clearError, clearAuth, setUser, setVerificationRequired } = authSlice.actions;

// Enhanced Selectors
export const selectCurrentUser = (state) => {
  const user = state.auth.userInfo;
  if (user && !user.hasOwnProperty('isAdmin')) {
    user.isAdmin = user.role === 'admin' || false;
  }
  return user;
};

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsAdmin = (state) => {
  const user = state.auth.userInfo;
  return user?.isAdmin || user?.role === 'admin' || false;
};
export const selectIsVerified = (state) => state.auth.userInfo?.isVerified || false;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectVerificationRequired = (state) => state.auth.verificationRequired;

export default authSlice.reducer;