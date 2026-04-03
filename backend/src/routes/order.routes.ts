import { Router } from 'express';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';
import { uploadToCloudinary } from '../utils/cloudinary';
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  updatePaymentStatus,
} from '../controllers/order.controller';

const router = Router();

// Order Routes (Cloudinary handles file storage)
router.post('/', authenticate, uploadToCloudinary.single('paymentScreenshot'), createOrder);
router.get('/my-orders', authenticate, getUserOrders);

// Admin Routes
router.get('/', authenticate, authorizeAdmin, getAllOrders);
router.patch('/:id/payment-status', authenticate, authorizeAdmin, updatePaymentStatus);

export default router;
