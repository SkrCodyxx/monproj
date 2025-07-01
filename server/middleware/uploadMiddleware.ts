import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs'; // To ensure directory exists
import { Request } from 'express';

// Define the destination directory for gallery images
const galleryUploadDir = path.join(__dirname, '../../../public/uploads/gallery'); // Adjust path to be relative to compiled output if needed

// Ensure the upload directory exists
if (!fs.existsSync(galleryUploadDir)) {
  try {
    fs.mkdirSync(galleryUploadDir, { recursive: true });
    console.log(`Created directory: ${galleryUploadDir}`);
  } catch (err) {
    console.error(`Error creating directory ${galleryUploadDir}:`, err);
    // Depending on setup, might want to throw error here to prevent app start without upload dir
  }
} else {
  console.log(`Upload directory ${galleryUploadDir} already exists.`);
}


// Storage configuration for Multer
const storage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    cb(null, galleryUploadDir);
  },
  filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    // Create a unique filename: fieldname-timestamp.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only images
const imageFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif|webp/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Seulement les images (jpeg, jpg, png, gif, webp) sont autorisées!'));
  }
};

// Configure Multer upload instance
const uploadGalleryImage = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB file size limit
  },
  fileFilter: imageFileFilter
});

export default uploadGalleryImage;
