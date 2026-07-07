import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/slices/authSlice.js';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { analytics } from '@/utils/analytics';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Get auth state directly to debug
  const authState = useSelector((state) => state.auth);
  const { loading, error: authError, userInfo, isAuthenticated } = authState;

  const redirect = location.search ? location.search.split('=')[1] : '/';
  useEffect(() => {
  if (isAuthenticated && userInfo) {
    analytics.trackRegistration('email');
  }
}, [isAuthenticated, userInfo]);

  // Debug logging
  useEffect(() => {
    console.log('Auth State Update:', {
      loading,
      authError,
      userInfo,
      isAuthenticated,
      redirect
    });
  }, [loading, authError, userInfo, isAuthenticated, redirect]);
  useEffect(() => {
    // Check if user is unverified and redirect to verification
    const unverifiedUser = localStorage.getItem('unverifiedUser');
    if (unverifiedUser && !userInfo?.isVerified) {
      try {
        const parsedUser = JSON.parse(unverifiedUser);
        console.log('Found unverified user, redirecting to verification');
        navigate('/verify-email');
      } catch (e) {
        localStorage.removeItem('unverifiedUser');
      }
    }
  }, [userInfo, navigate]);
  // Handle login redirection
// In the useEffect that handles login redirection, add verification check:
// In Login.jsx, update the useEffect for redirection:
useEffect(() => {
  console.log('Checking authentication...');
  console.log('isAuthenticated:', isAuthenticated);
  console.log('userInfo:', userInfo);
  
  if (isAuthenticated && userInfo) {
    console.log('User is authenticated, redirecting...');
    
    // Check if there's a stored redirect path from protected routes
    const storedRedirect = localStorage.getItem('redirectPath') || redirect;
    
    // Clear stored redirect
    if (localStorage.getItem('redirectPath')) {
      localStorage.removeItem('redirectPath');
    }
    
    // Redirect based on user role and verification status
    if (userInfo.isAdmin) {
      console.log('Redirecting admin to dashboard');
      navigate('/admin/dashboard', { replace: true });
    } else {
      console.log('Redirecting regular user to:', storedRedirect);
      navigate(storedRedirect, { replace: true });
    }
  }
}, [isAuthenticated, userInfo, navigate, redirect]);

// In the handleSubmit function, add verification check
const handleSubmit = async (e) => {
  e.preventDefault();
  setLocalError('');
  
  // Validate inputs
  if (!email || !password) {
    setLocalError('Please enter both email and password');
    return;
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setLocalError('Please enter a valid email address');
    return;
  }
  
  console.log('Attempting login with:', { email, rememberMe });
  
  try {
    // Dispatch login action
    const resultAction = await dispatch(login({ email, password, rememberMe }));
    
    // Check if login was successful
    if (login.fulfilled.match(resultAction)) {
      console.log('Login successful:', resultAction.payload);
      // The useEffect will handle redirection
    } else if (login.rejected.match(resultAction)) {
      const errorMsg = resultAction.payload || resultAction.error?.message || 'Login failed';
      setLocalError(errorMsg);
      console.error('Login failed:', resultAction.error);
      
      // If error is about email verification, redirect to verification page
      if (errorMsg.includes('verify your email')) {
        // Try to get user info from localStorage
        const storedEmail = email;
        setTimeout(() => {
          navigate('/verify-email');
        }, 2000);
      }
    }
    analytics.trackLogin('email');
  } catch (error) {
    console.error('Login error:', error);
    setLocalError('An unexpected error occurred. Please try again.');
  }
};

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Signing in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">💄</span>
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-900">Cosmetics</h1>
              <p className="text-sm text-gray-500 -mt-1">Premium Beauty Store</p>
            </div>
          </Link>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600 mb-8">Sign in to your account to continue</p>

          {/* Error Messages */}
          {(localError || authError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fadeIn">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-600">
                    {localError || authError || 'Login failed. Please try again.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setLocalError('');
                  }}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLocalError('');
                  }}
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  disabled={loading}
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-primary-500"
                  disabled={loading}
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-gray-400" />
                  ) : (
                    <FaEye className="text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                  disabled={loading}
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600 cursor-pointer">
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${
                loading 
                  ? 'bg-primary-400 cursor-not-allowed' 
                  : 'bg-primary-500 hover:bg-primary-600'
              } text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 mb-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Guest Checkout */}

<div className="text-center">
  <p className="text-gray-600 mb-4">
    Want to checkout without an account?
  </p>
  <button
    onClick={() => {
      console.log('Continue as Guest clicked');
      // Clear any existing user session data for guest checkout
      localStorage.removeItem('redirectPath');
      sessionStorage.removeItem('redirectPath');
      
      // Navigate to checkout directly
      navigate('/checkout');
    }}
    className="inline-block w-full border-2 border-primary-500 text-primary-500 hover:bg-primary-50 py-3 px-4 rounded-lg font-semibold transition-colors"
  >
    Continue as Guest
  </button>
</div>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to={redirect !== '/' ? `/register?redirect=${redirect}` : '/register'}
                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            By signing in, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-gray-700">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="underline hover:text-gray-700">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;