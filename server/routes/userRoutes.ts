import express from 'express';
import { updateUserProfile, updateUserPassword, getMyProfile } from '../controllers/userController';
import { protect, authorize } from '../middleware/authMiddleware'; // Assuming authorize is for roles

const router = express.Router();

// Routes for the authenticated user to manage their own profile
router.get('/profile/me', protect, getMyProfile);
router.put('/profile/me', protect, updateUserProfile);
router.put('/profile/me/password', protect, updateUserPassword);

// --- Admin User Management Routes ---
// These routes should be protected by 'protect' and 'authorize(['admin'])'
router.get('/', protect, authorize(['admin']), getAllUsers); // Get all users (admin)
router.get('/:id', protect, authorize(['admin']), getUserById); // Get a specific user by ID (admin)
router.put('/:id/role', protect, authorize(['admin']), updateUserRoleById); // Update user's role (admin)
router.patch('/:id/activation', protect, authorize(['admin']), toggleUserActivationById); // Activate/deactivate user (admin)


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
