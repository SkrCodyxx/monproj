import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Route to get all settings (admin only for editable settings)
router.get('/', protect, authorize(['admin']), getSettings);

// Route to update settings (admin only)
router.put('/', protect, authorize(['admin']), updateSettings);


// Example of a public route for specific settings (if needed later)
// This would require a different controller function that fetches only designated public settings.
// router.get('/public', async (req, res, next) => {
//   try {
//     // const publicSettings = await fetchPublicSettings(); // Implement this in controller
//     // res.status(200).json(publicSettings);
//     res.status(200).json({ message: "Public settings endpoint placeholder" });
//   } catch (error) {
//     next(error);
//   }
// });

export default router;
