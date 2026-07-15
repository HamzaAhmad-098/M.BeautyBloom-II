import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Import routes
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import userRoutes from './routes/userRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Load environment variables
dotenv.config();

// ES6 module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Required on Vercel (and most serverless platforms) since requests pass
// through a proxy layer — without this, express-rate-limit and req.protocol
// checks can misbehave.
app.set('trust proxy', 1);

// Ensure DB connection is established (cached across invocations) before
// handling each request. Safe/cheap to call repeatedly since connectDB()
// returns the cached connection instantly once established.
app.use((req, res, next) => {
  connectDB()
    .then(() => next())
    .catch((err) => {
      console.error('❌ Database connection failed for request:', err.message);
      res.status(503).json({ success: false, message: 'Database unavailable, please try again shortly.' });
    });
});
app.use((req, res, next) => {
  const host = req.get('host');
  const protocol = req.protocol;
  
  // Redirect old Railway domain to new custom domain
  if (host === 'ingenious-laughter-production.up.railway.app') {
    return res.redirect(301, `https://www.mbeautybloom.shop${req.originalUrl}`);
  }
  
  next();
});
// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(mongoSanitize());

// Update the CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://www.mbeautybloom.shop',
      'https://mbeautybloom.shop',
      'https://m-beautybloom.onrender.com',
      'https://ingenious-laughter-production.up.railway.app',
      'http://localhost:3000',
      'http://localhost:5173',
      'https://res.cloudinary.com'
    ]
  : ['http://localhost:3000', 'http://localhost:5173','https://res.cloudinary.com'];
console.log('🌐 Configuring CORS for origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) {
      console.log('🔓 Allowing request without origin');
      return callback(null, true);
    }
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ Allowing CORS for: ${origin}`);
      callback(null, true);
    } else {
      console.log(`❌ Blocking CORS for: ${origin}`);
      console.log('📋 Allowed origins:', allowedOrigins);
      
      // In production, be more strict but allow your Railway domain
      if (process.env.NODE_ENV === 'production' && (origin.includes('railway.app') || origin.includes('onrender.com') || origin.includes('vercel.app'))) {
        console.log(`⚠️  Allowing Render/Railway/Vercel subdomain: ${origin}`);
        callback(null, true);
      } else {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        callback(new Error(msg), false);
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie']
}));
// Handle preflight requests
app.options('*', cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Custom XSS protection middleware (simplified)
const xssClean = (req, res, next) => {
  // Clean request body
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        // Basic XSS prevention
        req.body[key] = req.body[key]
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');
      }
    }
  }
  next();
};

// Apply XSS protection to POST, PUT, PATCH requests
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    xssClean(req, res, next);
  } else {
    next();
  }
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
// app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Cosmetics Store API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});

// API documentation route
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Cosmetics Store API',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      users: '/api/users',
      orders: '/api/orders',
      cart: '/api/cart',
      categories: '/api/categories',
      upload: '/api/upload',
      payment: '/api/payment',
      auth: '/api/auth',
    },
    documentation: 'Coming soon...',
  });
});

// Vercel serves the built frontend separately via its static builder.
// This Express app only handles /api/* routes in that deployment.
app.get("/", (req, res) => {
  res.json({ success: true, message: "Cosmetics Store API (Vercel serverless)" });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;