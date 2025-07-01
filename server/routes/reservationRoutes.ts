import express from 'express';
import {
  getAllReservations,
  getReservationById,
  updateReservationStatus,
  updateReservationDetails,
} from '../controllers/reservationController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// --- Admin Reservation Management Routes ---
router.get('/', protect, authorize(['admin']), getAllReservations);
router.get('/:id', protect, authorize(['admin']), getReservationById);
router.put('/:id/status', protect, authorize(['admin']), updateReservationStatus);
router.put('/:id', protect, authorize(['admin']), updateReservationDetails); // For general detail updates by admin

// --- Client Reservation Routes (Example - Assuming client can view/create their own reservations) ---
// Placeholder: Actual implementation would require specific client-facing controllers.
// router.post('/', protect, async (req, res) => {
//   // This would call a createReservation controller function, likely different from admin update
//   res.status(201).json({ message: `Placeholder: Client creates reservation for user ${req.user?.id}` });
// });

// router.get('/my-reservations', protect, async (req, res) => {
//   // This would call a getMyReservations controller, filtering by req.user.id
//   res.status(200).json({ message: `Placeholder: Get reservations for user ${req.user?.id}` });
// });

// router.patch('/:id/cancel', protect, async (req, res) => {
//   // Client cancels their own reservation - would need logic to check ownership
//   res.status(200).json({ message: `Placeholder: Client cancels reservation ${req.params.id}` });
// });


export default router;
