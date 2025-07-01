import { Request, Response, NextFunction } from 'express';
import db from '../db'; // Knex instance
import { GalleryImage } from '../../src/types'; // Shared type
import * as z from 'zod';

const IMAGES_TABLE = `${process.env.DB_SCHEMA || 'main'}.gallery_images`;
const ALBUMS_TABLE = `${process.env.DB_SCHEMA || 'main'}.gallery_albums`;


// Zod schema for adding an image to an album
// image_url becomes optional if a file is uploaded. Controller will prioritize file.
const addImageSchema = z.object({
  image_url: z.string().url("URL de l'image invalide.").optional().nullable().or(z.literal('')),
  caption: z.string().optional().nullable(),
  sort_order: z.number().int().optional().default(0),
});

// Zod schema for updating image details
const updateImageDetailsSchema = z.object({
  caption: z.string().optional().nullable(),
  sort_order: z.number().int().optional(),
});

export const getImagesForAlbum = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { albumId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const offset = (page - 1) * pageSize;

    // Check if album exists first
    const albumExists = await db(ALBUMS_TABLE).where({ id: albumId }).first();
    if (!albumExists) {
        return res.status(404).json({ message: "Album non trouvé." });
    }

    const images = await db<GalleryImage>(IMAGES_TABLE)
      .where({ album_id: albumId })
      .orderBy('sort_order', 'asc')
      .orderBy('created_at', 'asc')
      .limit(pageSize)
      .offset(offset);

    const totalImagesResult = await db<GalleryImage>(IMAGES_TABLE).where({ album_id: albumId }).count({ count: '*' }).first();
    const totalItems = parseInt(totalImagesResult?.count?.toString() || "0");

    res.status(200).json({
        data: images,
        pagination: {
            page,
            pageSize,
            totalItems,
            totalPages: Math.ceil(totalItems / pageSize)
        }
    });
  } catch (error) {
    console.error("Get images for album error:", error);
    next(error);
  }
};

export const addImageToAlbum = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { albumId } = req.params;
    const validationResult = addImageSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: "Validation errors", errors: validationResult.error.flatten().fieldErrors });
    }

    let { image_url, caption, sort_order } = validationResult.data;

    // Prioritize file upload over direct URL if a file is present
    if (req.file) {
      image_url = `/uploads/gallery/${req.file.filename}`;
    } else if (!image_url) {
      // If no file and no image_url, it's an error (unless schema makes image_url truly optional without file)
      // The current schema allows image_url to be empty/null, so this case is fine if that's intended.
      // However, an image entry without a URL or file doesn't make sense.
      // Let's enforce that either a file is uploaded or a URL is provided.
      return res.status(400).json({ message: "Aucun fichier téléversé ni URL d'image fournie." });
    }


    // Check if album exists
    const albumExists = await db(ALBUMS_TABLE).where({ id: albumId }).first();
    if (!albumExists) {
        return res.status(404).json({ message: "Album non trouvé pour y ajouter l'image." });
    }

    const [newImageIdObj] = await db<Omit<GalleryImage, 'id'>>(IMAGES_TABLE)
      .insert({
        album_id: Number(albumId), // Ensure albumId is number if PK is number
        image_url,
        caption: caption || null,
        sort_order: sort_order || 0,
      })
      .returning('id');

    let newImageId = newImageIdObj;
    if (typeof newImageIdObj === 'object' && newImageIdObj !== null && 'id' in newImageIdObj) {
        newImageId = (newImageIdObj as { id: any }).id;
    }

    const newImage = await db<GalleryImage>(IMAGES_TABLE).where({ id: newImageId }).first();
    res.status(201).json({ message: 'Image ajoutée à l\'album avec succès!', image: newImage });
  } catch (error) {
    console.error("Add image to album error:", error);
    next(error);
  }
};

export const updateImageDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { imageId } = req.params;
    const validationResult = updateImageDetailsSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: "Validation errors", errors: validationResult.error.flatten().fieldErrors });
    }

    const fieldsToUpdate = validationResult.data;

    if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ message: "Aucun champ à mettre à jour fourni." });
    }

    // @ts-ignore
    fieldsToUpdate.updated_at = new Date().toISOString();


    const updatedRows = await db<GalleryImage>(IMAGES_TABLE)
      .where({ id: imageId })
      .update(fieldsToUpdate);

    if (updatedRows === 0) {
      return res.status(404).json({ message: 'Image non trouvée ou aucune modification effectuée.' });
    }

    const updatedImage = await db<GalleryImage>(IMAGES_TABLE).where({ id: imageId }).first();
    res.status(200).json({ message: 'Détails de l\'image mis à jour!', image: updatedImage });
  } catch (error) {
    console.error("Update image details error:", error);
    next(error);
  }
};

export const deleteImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { imageId } = req.params;
    const deletedRows = await db<GalleryImage>(IMAGES_TABLE).where({ id: imageId }).del();

    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Image non trouvée.' });
    }

    res.status(200).json({ message: 'Image supprimée avec succès.' });
  } catch (error) {
    console.error("Delete image error:", error);
    next(error);
  }
};
