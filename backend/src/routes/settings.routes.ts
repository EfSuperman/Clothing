import { Router } from 'express';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';
import { getSettings, updateSettings } from '../controllers/settings.controller';

const router = Router();

router.get('/', getSettings);
router.patch('/', authenticate, authorizeAdmin, updateSettings);

export default router;
