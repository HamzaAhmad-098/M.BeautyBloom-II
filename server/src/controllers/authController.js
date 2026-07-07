import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Set JWT Cookie
const setTokenCookie = (res, token) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('jwt', token, cookieOptions);
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
  });

  // Generate verification token
  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Create verification URL
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

  // Send verification email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Email Verification - Cosmetics Store',
      template: 'emailVerification',
      data: {
        name: user.name,
        verificationUrl,
      },
    });

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
        avatar: user.avatar,
      },
      message: 'Registration successful! Please check your email to verify your account.',
    });
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });
    
    res.status(500);
    throw new Error('Email could not be sent. Please try again later.');
  }
});

// @desc    Verify email
// @route   POST /api/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  // Get token from params
  const verificationToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken: verificationToken,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired verification token');
  }

  // Mark as verified and clear token
  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();

  // Generate new token for immediate login
  const token = generateToken(user._id);
  
  // Set cookie
  setTokenCookie(res, token);

  // Remove password from response
  user.password = undefined;

  res.status(200).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin,
      avatar: user.avatar,
    },
    message: 'Email verified successfully!',
  });
});

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
const resendVerificationEmail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error('Email is already verified');
  }

  // Check if there's a recent verification request (prevent spam)
  if (user.emailVerificationExpire && user.emailVerificationExpire > Date.now()) {
    const timeLeft = Math.ceil((user.emailVerificationExpire - Date.now()) / (1000 * 60));
    res.status(429);
    throw new Error(`Please wait ${timeLeft} minutes before requesting another verification email`);
  }

  // Generate new verification token
  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Create verification URL
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

  // Send verification email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Email Verification - Cosmetics Store',
      template: 'emailVerification',
      data: {
        name: user.name,
        verificationUrl,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully!',
    });
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });
    
    res.status(500);
    throw new Error('Email could not be sent. Please try again later.');
  }
});

// @desc    Login user - UPDATED VERIFICATION CHECK
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;

  // Validate email & password
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Check for user
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password +loginAttempts +lockUntil');

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Check if account is active
  if (!user.isActive) {
    res.status(401);
    throw new Error('Account is deactivated. Please contact support.');
  }

  // Check if account is locked
  if (user.isLocked) {
    const timeLeft = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));
    res.status(423);
    throw new Error(`Account is locked. Please try again in ${timeLeft} minutes.`);
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    // Increment login attempts
    await user.incrementLoginAttempts();
    
    const attemptsLeft = 5 - (user.loginAttempts + 1);
    
    if (attemptsLeft > 0) {
      res.status(401);
      throw new Error(`Invalid email or password. ${attemptsLeft} attempts remaining.`);
    } else {
      res.status(401);
      throw new Error('Account locked due to too many failed login attempts. Please try again in 15 minutes.');
    }
  }

  // IMPORTANT: Check if email is verified
  if (!user.isVerified) {
    // Save user info without token (for verification page)
    const tempUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin,
      avatar: user.avatar,
    };
    
    res.status(403).json({
      success: false,
      user: tempUser,
      message: 'Please verify your email before logging in.',
      requiresVerification: true,
    });
    return;
  }

  // Reset login attempts on successful login
  await user.resetLoginAttempts();

  // Update last login
  await user.updateLastLogin();

  // Generate token with longer expiry for "remember me"
  const tokenExpiry = rememberMe ? '30d' : '1d';
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: tokenExpiry,
  });

  // Set cookie
  setTokenCookie(res, token);

  // Remove password from response
  user.password = undefined;
  user.loginAttempts = undefined;
  user.lockUntil = undefined;

  res.status(200).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin,
      avatar: user.avatar,
      lastLogin: user.lastLogin,
    },
    message: 'Login successful!',
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.cookie('jwt', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('wishlist', 'name price images')
    .populate('cart.product', 'name price images stock');

  res.status(200).json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin,
      addresses: user.addresses,
      wishlist: user.wishlist,
      cart: user.cart,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    },
  });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
const updateDetails = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    name: req.body.name,
    phone: req.body.phone,
    avatar: req.body.avatar,
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(
    (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(
    req.user._id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin,
    },
    message: 'Profile updated successfully',
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isMatch = await user.matchPassword(req.body.currentPassword);
  
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  // Update password
  user.password = req.body.newPassword;
  await user.save();

  // Generate new token
  const token = generateToken(user._id);
  setTokenCookie(res, token);

  res.status(200).json({
    success: true,
    token,
    message: 'Password updated successfully',
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(404);
    throw new Error('No user found with this email');
  }

  // Check if there's a recent reset request (prevent spam)
  if (user.resetPasswordExpire && user.resetPasswordExpire > Date.now()) {
    const timeLeft = Math.ceil((user.resetPasswordExpire - Date.now()) / (1000 * 60));
    res.status(429);
    throw new Error(`Please wait ${timeLeft} minutes before requesting another password reset`);
  }

  // Get reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  // Send email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request - Cosmetics Store',
      template: 'passwordReset',
      data: {
        name: user.name,
        resetUrl,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully',
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error('Email could not be sent. Please try again later.');
  }
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.loginAttempts = 0; // Reset login attempts
  user.lockUntil = undefined;
  
  await user.save();

  // Generate new token (auto login after reset)
  const token = generateToken(user._id);
  setTokenCookie(res, token);

  res.status(200).json({
    success: true,
    token,
    message: 'Password reset successful',
  });
});

// @desc    Delete account
// @route   DELETE /api/auth/deleteaccount
// @access  Private
const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    res.status(400);
    throw new Error('Please enter your password to confirm account deletion');
  }

  const user = await User.findById(req.user._id).select('+password');

  // Verify password
  const isMatch = await user.matchPassword(password);
  
  if (!isMatch) {
    res.status(401);
    throw new Error('Password is incorrect');
  }

  // Soft delete (mark as inactive)
  user.isActive = false;
  await user.save();

  // Clear cookie
  res.cookie('jwt', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully',
  });
});

const checkEmailAvailability = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ available: false });
  }

  const user = await User.findOne({ email });

  res.status(200).json({
    available: !user, 
  });
};

export {
  register,
  verifyEmail,
  resendVerificationEmail,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  deleteAccount,
  checkEmailAvailability,
};