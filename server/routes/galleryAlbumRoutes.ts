import express from 'express';
import {
  getAllAlbums,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
} from '../controllers/galleryAlbumController';
import {
  getImagesForAlbum,
  addImageToAlbum
} from '../controllers/galleryImageController'; // Import image controllers
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes (anyone can view gallery albums)
router.get('/', getAllAlbums);
router.get('/:albumId', getAlbumById);

// Admin-only routes
router.post('/', protect, authorize(['admin']), createAlbum);
router.put('/:albumId', protect, authorize(['admin']), updateAlbum);
router.delete('/:albumId', protect, authorize(['admin']), deleteAlbum);

// Routes for images within a specific album
router.get('/:albumId/images', getImagesForAlbum); // Get images for an album (public)
router.post('/:albumId/images', protect, authorize(['admin']), addImageToAlbum); // Add image to an album (admin)


export default router;
