import express from 'express';
import rateLimit from 'express-rate-limit';
import {
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
} from '../controllers/authController.js';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import {
  protect,
  authorize,
  admin,
  verified,
  authLimiter,
  refreshToken,
} from '../middleware/authMiddleware.js';
import User from '../models/User.js'; // Add this import

const router = express.Router();

// Rate limiting for auth routes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many accounts created from this IP, please try again after an hour',
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  message: 'Too many password reset requests from this IP, please try again after 15 minutes',
});

// Public routes
router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);
router.post('/verify-email/:token', verifyEmail); // CHANGED FROM GET TO POST
router.post('/check-email', checkEmailAvailability);

// Protected routes (require authentication)
router.use(protect);
router.use(refreshToken); // Refresh token if needed

router.post('/logout', logout);
router.get('/me', getMe);
router.put('/updatedetails', updateDetails);
router.put('/updatepassword', updatePassword);
router.post('/resend-verification', resendVerificationEmail);
router.delete('/deleteaccount', deleteAccount);

// ---------- ADMIN ROUTES ----------
// All routes below this will require admin privileges
router.use(admin);

// Admin user management
router.get('/admin/users', getUsers);
router.get('/admin/users/:id', getUserById);
router.put('/admin/users/:id', updateUser);
router.delete('/admin/users/:id', deleteUser);

// Admin dashboard stats
router.get('/admin/stats', async (req, res) => {
  try {
    // Get user counts by role/status
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const adminUsers = await User.countDocuments({ isAdmin: true });
    const activeUsers = await User.countDocuments({ isActive: true });

    // Get recent registrations
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email createdAt isVerified isAdmin');

    res.status(200).json({
      success: true,
      data: {
        counts: {
          totalUsers,
          verifiedUsers,
          adminUsers,
          activeUsers,
        },
        recentUsers,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin stats',
    });
  }
});

export default router;