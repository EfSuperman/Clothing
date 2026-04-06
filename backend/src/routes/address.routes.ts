import { Router } from 'express';
import { getAddresses, addAddress, updateAddress, deleteAddress } from '../controllers/address.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All address routes are protected
router.use(authenticate);

router.get('/', getAddresses);
router.post('/', addAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);

export default router;
