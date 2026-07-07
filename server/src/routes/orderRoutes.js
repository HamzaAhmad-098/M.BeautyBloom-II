import express from 'express';
import {
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
} from '../controllers/orderController.js';
import { protect, admin, guest } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(guest, addOrderItems)
  .get(protect, admin, getOrders);

router.route('/myorders')
  .get(protect, getMyOrders);

router.route('/guest/:email')
  .get(getGuestOrders);

router.route('/stats')
  .get(protect, admin, getOrderStats);

router.route('/:id')
  .get(getOrderById);

router.route('/:id/pay')
  .put(protect, updateOrderToPaid);

router.route('/:id/deliver')
  .put(protect, admin, updateOrderToDelivered);

router.route('/:id/status')
  .put(protect, admin, updateOrderStatus);

router.route('/:id/cancel')
  .put(guest, cancelOrder);

export default router;