import express from 'express';
import { register, login } from '../controllers/authController';
// import { protect } from '../middleware/authMiddleware'; // To protect routes like /me

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Placeholder for logout - client-side JWT removal is typical for stateless auth
// Server-side logout might involve token blocklisting if needed.
router.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Logout successful (client should clear token)' });
});

// Example: Get current user (protected route)
// router.get('/me', protect, getMe); // Assuming getMe controller and protect middleware

// router.post('/forgot-password', forgotPasswordController);
// router.post('/reset-password', resetPasswordController);

export default router;
