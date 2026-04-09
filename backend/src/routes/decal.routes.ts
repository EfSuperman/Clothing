import { Router } from 'express';
import { getDecals, createDecal, deleteDecal, uploadOnly } from '../controllers/decal.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';
import { uploadToCloudinary } from '../utils/cloudinary';

const router = Router();

router.get('/', getDecals);
router.post('/', authenticate, authorizeAdmin, uploadToCloudinary.single('image'), createDecal);
router.post('/upload', uploadToCloudinary.single('image'), uploadOnly);
router.delete('/:id', authenticate, authorizeAdmin, deleteDecal);

export default router;
