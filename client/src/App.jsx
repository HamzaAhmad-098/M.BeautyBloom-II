import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './store/slices/authSlice';
import { selectCurrentUser, selectIsAuthenticated } from './store/slices/authSlice';
import { Toaster } from 'react-hot-toast';
import GoogleAnalytics from './components/GoogleAnalytics';
// Layout
import Layout from './components/layout/Layout';
import ScrollToTop from './components/common/ScrollToTop';
import SplashScreen from './components/common/SplashScreen';

// Auth Components
import ProtectedRoute, { GuestRoute, VerifiedRoute, AdminRoute } from './components/common/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import TrackOrder from './pages/TrackOrder';
import TestConnection from './pages/TestConnection';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// User Pages
import Profile from './pages/user/Profile';
import Orders from './pages/user/Orders';
import OrderDetails from './pages/user/OrderDetails';
import Wishlist from './pages/user/Wishlist';
import Addresses from './pages/user/Addresses';
import Settings from './pages/user/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import AdminCategories from './pages/admin/Categories';

// Import Product CRUD Components
import ProductForm from './pages/admin/ProductForm';
import ProductDetail from './pages/admin/ProductDetail';

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userInfo = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [isMobile, setIsMobile] = useState(false);
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('mbb_splash_shown'));

  const handleSplashFinish = () => {
    sessionStorage.setItem('mbb_splash_shown', '1');
    setShowSplash(false);
  };

  // Check authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated) {
      dispatch(getMe());
    }
  }, [dispatch, isAuthenticated]);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Add mobile classes to body for CSS targeting
      if (mobile) {
        document.body.classList.add('mobile-scroll', 'is-mobile');
      } else {
        document.body.classList.remove('mobile-scroll', 'is-mobile');
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      document.body.classList.remove('mobile-scroll', 'is-mobile');
    };
  }, []);

  // Auto-redirect admin from homepage to admin dashboard
  useEffect(() => {
    if (isAuthenticated && userInfo?.isAdmin && window.location.pathname === '/') {
      console.log('Auto-redirecting admin from homepage to admin dashboard');
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, userInfo, navigate]);

  return (
    <>
    {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
    <GoogleAnalytics />
      {/* Scroll to top on route change */}
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout isMobile={isMobile} />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="track-order" element={<TrackOrder />} />
          <Route path="track-order/:id" element={<TrackOrder />} />
          <Route path="test-connection" element={<TestConnection />} />
          
          {/* Auth Routes (Guest only) */}
          <Route path="login" element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          } />
          <Route path="register" element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          } />
          <Route path="forgot-password" element={
            <GuestRoute>
              <ForgotPassword />
            </GuestRoute>
          } />
          <Route path="reset-password/:token" element={
            <GuestRoute>
              <ResetPassword />
            </GuestRoute>
          } />
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="verify-email/:token" element={<VerifyEmail />} />
          
          {/* Protected Routes (Requires authentication) */}
          <Route path="checkout" element={<Checkout />} />
          {/* User Routes (Regular users only) */}
          <Route path="profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="orders/:id" element={
            <ProtectedRoute>
              <OrderDetails />
            </ProtectedRoute>
          } />
          <Route path="wishlist" element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          } />
          <Route path="addresses" element={
            <ProtectedRoute>
              <Addresses />
            </ProtectedRoute>
          } />
          <Route path="settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes (Admin users only) */}
          <Route path="admin/dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          
          {/* Product Management CRUD Routes */}
          <Route path="admin/products" element={
            <AdminRoute>
              <AdminProducts />
            </AdminRoute>
          } />
          <Route path="admin/products/new" element={
            <AdminRoute>
              <ProductForm mode="create" />
            </AdminRoute>
          } />
          <Route path="admin/products/:id" element={
            <AdminRoute>
              <ProductDetail />
            </AdminRoute>
          } />
          <Route path="admin/products/edit/:id" element={
            <AdminRoute>
              <ProductForm mode="edit" />
            </AdminRoute>
          } />
          
          <Route path="admin/orders" element={
            <AdminRoute>
              <AdminOrders />
            </AdminRoute>
          } />
          <Route path="admin/users" element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          } />
          <Route path="admin/categories" element={
            <AdminRoute>
              <AdminCategories />
            </AdminRoute>
          } />
          
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      {/* Toast notifications */}
      <Toaster
        position={isMobile ? "top-center" : "top-right"}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: isMobile ? '14px' : '16px',
            maxWidth: isMobile ? '90vw' : '400px',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
    </>
  );
}

export default App;