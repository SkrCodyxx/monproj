import express from 'express';
import {
  getImagesForAlbum,
  addImageToAlbum,
  updateImageDetails,
  deleteImage,
} from '../controllers/galleryImageController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Route to get images for a specific album (can be public)
// This is nested under gallery-albums conceptually but might be a separate router file for clarity
// For now, keeping it distinct:
// GET /api/gallery-albums/:albumId/images (defined in galleryAlbumRoutes.ts or here if preferred)

// Routes for managing specific images (admin only)
// These operate on individual images directly by imageId.
router.put('/:imageId', protect, authorize(['admin']), updateImageDetails);
router.delete('/:imageId', protect, authorize(['admin']), deleteImage);


// Note:
// GET /api/gallery-albums/:albumId/images - might be better placed in galleryAlbumRoutes.ts for resource hierarchy
// POST /api/gallery-albums/:albumId/images - (addImageToAlbum) also fits better in galleryAlbumRoutes.ts

// For this file, we'll focus on routes that identify images directly by imageId.
// The album-nested routes will be added to galleryAlbumRoutes.ts for better structure.

export default router;
