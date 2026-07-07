import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Create new order (Guest & User)
// @route   POST /api/orders
// @access  Public (Guest checkout allowed)
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    guestUser,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Validate stock before creating order
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product ${item.name} not found`);
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${item.name}`);
    }
  }

  const order = new Order({
    user: req.user ? req.user._id : null,
    guestUser: !req.user ? guestUser : null,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  // Update product stock
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.stock = (product.stock || 0) - item.quantity;
      product.sold = (product.sold || 0) + item.quantity;
      try {
        await product.save();
      } catch (err) {
        // Log the error but don't abort order creation
        console.error(`Failed to update stock for product ${product._id}:`, err.message || err);
      }
    }
  }

  const createdOrder = await order.save();

  // FIX: Get customer details correctly for both logged-in users and guests
  let customerEmail, customerName;
  
  if (req.user) {
    // Logged-in user
    customerEmail = req.user.email;
    customerName = req.user.name;
  } else if (guestUser && guestUser.email) {
    // Guest user with email
    customerEmail = guestUser.email;
    customerName = guestUser.name || shippingAddress.name;
  } else if (shippingAddress && shippingAddress.email) {
    // Fallback: email from shipping address
    customerEmail = shippingAddress.email;
    customerName = shippingAddress.name;
  }

  // Format shipping address for email
  const formattedAddress = `${shippingAddress.address}, ${shippingAddress.city} ${shippingAddress.postalCode}, ${shippingAddress.country}`;

  // Send email notification (only if email is available)
  if (customerEmail) {
    try {
      await sendEmail({
        email: customerEmail,
        subject: `Order Confirmation - #${createdOrder._id}`,
        template: 'orderConfirmation',
        data: {
          name: customerName,
          orderId: createdOrder._id,
          total: totalPrice,
          paymentMethod: paymentMethod,
          shippingAddress: formattedAddress,
        },
      });
      console.log(`✅ Order confirmation email sent to ${customerEmail}`);
    } catch (emailError) {
      console.error('❌ Failed to send order confirmation email:', emailError.message);
      // Don't throw error - order was created successfully
    }
  } else {
    console.log(`ℹ️ No email provided for order ${createdOrder._id} - skipping email notification`);
  }

  res.status(201).json(createdOrder);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Public (No authentication required - anyone with order ID can view)
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // Public access - anyone with order ID can view it
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'Delivered';

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber, notes } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (notes) order.notes = notes;

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;
  const status = req.query.status || null;

  const query = status ? { status } : {};

  const count = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    orders,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get guest order by email
// @route   GET /api/orders/guest/:email
// @access  Public
const getGuestOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ 'guestUser.email': req.params.email })
    .sort({ createdAt: -1 });

  res.json(orders);
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private/Guest
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check authorization
  if (
    !req.user &&
    (!req.body.guestEmail || order.guestUser?.email !== req.body.guestEmail)
  ) {
    res.status(401);
    throw new Error('Not authorized');
  }

  if (req.user && order.user && order.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  // Only allow cancellation if order is pending or processing
  if (!['Pending', 'Processing'].includes(order.status)) {
    res.status(400);
    throw new Error('Order cannot be cancelled at this stage');
  }

  // Return stock
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.stock += item.quantity;
      product.sold -= item.quantity;
      await product.save();
    }
  }

  order.status = 'Cancelled';
  const updatedOrder = await order.save();

  res.json(updatedOrder);
});

// @desc    Get sales statistics
// @route   GET /api/orders/stats
// @access  Private/Admin
const getOrderStats = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  const totalOrders = await Order.countDocuments();
  const monthlyOrders = await Order.countDocuments({
    createdAt: { $gte: startOfMonth },
  });
  const yearlyOrders = await Order.countDocuments({
    createdAt: { $gte: startOfYear },
  });

  const totalRevenue = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);

  const monthlyRevenue = await Order.aggregate([
    {
      $match: {
        isPaid: true,
        createdAt: { $gte: startOfMonth },
      },
    },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);

  const ordersByStatus = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'name email');

  res.json({
    totalOrders,
    monthlyOrders,
    yearlyOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    monthlyRevenue: monthlyRevenue[0]?.total || 0,
    ordersByStatus,
    recentOrders,
  });
});

export {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus,
  getMyOrders,
  getOrders,
  getGuestOrders,
  cancelOrder,
  getOrderStats,
};