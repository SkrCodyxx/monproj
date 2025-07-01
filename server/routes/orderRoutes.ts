import express from 'express';
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// --- Admin Order Management Routes ---
router.get('/', protect, authorize(['admin']), getAllOrders);
router.get('/:id', protect, authorize(['admin']), getOrderById);
router.put('/:id/status', protect, authorize(['admin']), updateOrderStatus);

// --- Client Order Routes (Example - Assuming client can view their own orders) ---
// Placeholder: Actual implementation would require a controller that filters by req.user.id
// router.get('/my-orders', protect, async (req, res) => {
//   // This would typically call a controller function like getMyOrders(req, res, next)
//   // which would use req.user.id to fetch orders for the authenticated client.
//   res.status(200).json({ message: `Placeholder: Get orders for user ${req.user?.id}` });
// });

// Placeholder: Client creating an order
// router.post('/', protect, async (req, res) => {
//    // This would call a createOrder controller function
//    res.status(201).json({ message: 'Placeholder: Create order' });
// });


export default router;
