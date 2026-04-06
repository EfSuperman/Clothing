import { Router } from 'express';
import { register, login, googleLogin, testEmail } from '../controllers/auth.controller';
import { validateRegistration } from '../middlewares/validate.middleware';

const router = Router();

router.post('/register', validateRegistration, register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/test-email', testEmail);

export default router;
