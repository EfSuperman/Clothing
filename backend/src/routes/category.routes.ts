import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller';
import { authorizeAdmin, authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticate, authorizeAdmin, createCategory);
router.put('/:id', authenticate, authorizeAdmin, updateCategory);
router.delete('/:id', authenticate, authorizeAdmin, deleteCategory);

export default router;
