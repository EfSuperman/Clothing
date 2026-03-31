import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  updatePaymentStatus,
} from '../controllers/order.controller';

const router = Router();

// Setup Multer for file uploads
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  },
});

// Order Routes
router.post('/', authenticate, upload.single('paymentScreenshot'), createOrder);
router.get('/my-orders', authenticate, getUserOrders);

// Admin Routes
router.get('/', authenticate, authorizeAdmin, getAllOrders);
router.patch('/:id/payment-status', authenticate, authorizeAdmin, updatePaymentStatus);

export default router;
