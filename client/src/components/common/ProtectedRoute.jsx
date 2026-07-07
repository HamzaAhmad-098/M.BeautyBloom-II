import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '../../store/slices/authSlice';
import { useEffect } from 'react';

// Regular protected route (any authenticated user)
// Regular protected route (any authenticated user)
const ProtectedRoute = ({ children }) => {
  const userInfo = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  useEffect(() => {
    // Check for token expiration
    const token = localStorage.getItem('token');
    if (!token && isAuthenticated) {
      toast.error('Your session has expired. Please login again.');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    // Store the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Redirect to verification page if not verified (except for verification page itself)
  if (!userInfo?.isVerified && location.pathname !== '/verify-email') {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

// Guest route (only for non-authenticated users)
const GuestRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (isAuthenticated) {
    const from = location.state?.from || '/';
    return <Navigate to={from} replace />;
  }

  return children;
};

// Admin-only route
const AdminRoute = ({ children }) => {
  const userInfo = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!userInfo?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Verified email route
const VerifiedRoute = ({ children }) => {
  const userInfo = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!userInfo?.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

export default ProtectedRoute;
export { GuestRoute, AdminRoute, VerifiedRoute };