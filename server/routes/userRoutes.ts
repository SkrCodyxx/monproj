import express from 'express';
import { updateUserProfile, updateUserPassword, getMyProfile } from '../controllers/userController';
import { protect, authorize } from '../middleware/authMiddleware'; // Assuming authorize is for roles

const router = express.Router();

// Routes for the authenticated user to manage their own profile
router.get('/profile/me', protect, getMyProfile); // Get current user's profile
router.put('/profile/me', protect, updateUserProfile); // Update current user's profile info
router.put('/profile/me/password', protect, updateUserPassword); // Change current user's password


// Admin-only routes for managing all users (placeholders from previous setup)
// These would typically require an additional 'authorize(['admin'])' middleware.
// router.get('/', protect, authorize(['admin']), (req, res) => {
//     res.status(200).json({ message: 'Get all users placeholder (admin)' });
// });

// router.get('/:id', protect, authorize(['admin']), (req, res) => {
//     res.status(200).json({ message: `Get user ${req.params.id} placeholder (admin)` });
// });

// router.put('/:id/role', protect, authorize(['admin']), (req, res) => {
//     res.status(200).json({ message: `Update user ${req.params.id} role placeholder (admin)`, data: req.body });
// });

// router.patch('/:id/activation', protect, authorize(['admin']), (req, res) => {
//     res.status(200).json({ message: `Toggle user ${req.params.id} activation placeholder (admin)`, data: req.body });
// });

export default router;
