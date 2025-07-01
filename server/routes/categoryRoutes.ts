import express from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes (anyone can view categories)
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Admin-only routes
router.post('/', protect, authorize(['admin']), createCategory);
router.put('/:id', protect, authorize(['admin']), updateCategory);
router.delete('/:id', protect, authorize(['admin']), deleteCategory);

export default router;
