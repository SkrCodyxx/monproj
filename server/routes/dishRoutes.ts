import express from 'express';
import {
  getAllDishes,
  getDishById,
  createDish,
  updateDish,
  deleteDish,
} from '../controllers/dishController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes (anyone can view dishes/menu items)
router.get('/', getAllDishes); // consider renaming endpoint to /menu-items for clarity
router.get('/:id', getDishById);

// Admin-only routes
router.post('/', protect, authorize(['admin']), createDish);
router.put('/:id', protect, authorize(['admin']), updateDish);
router.delete('/:id', protect, authorize(['admin']), deleteDish);

export default router;
