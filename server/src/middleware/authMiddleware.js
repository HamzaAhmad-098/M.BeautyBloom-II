import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // Make sure token exists
  if (!token) {
    res.status(401);
    throw new Error('Not authorized to access this route');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.userId).select('-password');

    if (!req.user) {
      res.status(401);
      throw new Error('User not found');
    }

    // Check if user is active
    if (!req.user.isActive) {
      res.status(401);
      throw new Error('Account is deactivated');
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      res.status(401);
      throw new Error('Invalid token');
    } else if (error.name === 'TokenExpiredError') {
      res.status(401);
      throw new Error('Token expired');
    } else {
      res.status(401);
      throw new Error('Not authorized');
    }
  }
});

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role) && !req.user.isAdmin) {
      res.status(403);
      throw new Error(
        `User role ${req.user.role} is not authorized to access this route`
      );
    }
    next();
  };
};

// Admin middleware
const admin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized as admin');
  }
  next();
};

// Verified email middleware
const verified = (req, res, next) => {
  if (!req.user || !req.user.isVerified) {
    res.status(403);
    throw new Error('Please verify your email to access this resource');
  }
  next();
};

// Rate limiting for auth routes
const authLimiter = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many attempts from this IP, please try again after 15 minutes',
};

// Guest middleware (for guest checkout)
const guest = async (req, res, next) => {
  // If user is logged in, attach user to req
  if (req.cookies && req.cookies.jwt) {
    try {
      const token = req.cookies.jwt;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select('-password');
    } catch (error) {
      // Invalid token, treat as guest
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};

// Token refresh middleware
const refreshToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.jwt;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next();
    }

    // Check if token is about to expire (within 1 day)
    const tokenExpiry = decoded.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (tokenExpiry - now < oneDay) {
      // Generate new token
      const newToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
      });

      // Set new cookie
      res.cookie('jwt', newToken, {
        expires: new Date(
          Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      console.log('Token refreshed for user:', user.email);
    }
  } catch (error) {
    // Token verification failed, clear cookie
    res.clearCookie('jwt');
  }

  next();
});

export {
  protect,
  authorize,
  admin,
  verified,
  authLimiter,
  guest,
  refreshToken,
};