// Placeholder for User management API routes (Express) - primarily for Admins
import express from 'express';
// import { getUsers, getUser, updateUserRole, toggleUserActivation } from '../controllers/userController';
// import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// All these routes should be admin-only
// router.use(protect);
// router.use(authorize(['admin']));

// router.get('/', getUsers);
// router.get('/:id', getUser);
// router.put('/:id/role', updateUserRole);
// router.patch('/:id/activation', toggleUserActivation); // Or separate /activate and /deactivate

// Mock routes for now (assuming admin access)
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Get all users placeholder (admin)' });
});

router.get('/:id', (req, res) => {
    res.status(200).json({ message: `Get user ${req.params.id} placeholder (admin)` });
});

router.put('/:id/role', (req, res) => {
    res.status(200).json({ message: `Update user ${req.params.id} role placeholder (admin)`, data: req.body });
});

router.patch('/:id/activation', (req, res) => {
    res.status(200).json({ message: `Toggle user ${req.params.id} activation placeholder (admin)`, data: req.body });
});

// Client profile routes (might be separate or part of authRoutes)
// router.get('/profile/me', protect, getMyProfile);
// router.put('/profile/me', protect, updateMyProfile);

export default router;
