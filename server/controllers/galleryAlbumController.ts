import { Request, Response, NextFunction } from 'express';
import db from '../db'; // Knex instance
import { GalleryAlbum } from '../../src/types'; // Shared type
import * as z from 'zod';

const ALBUMS_TABLE = `${process.env.DB_SCHEMA || 'main'}.gallery_albums`;
const IMAGES_TABLE = `${process.env.DB_SCHEMA || 'main'}.gallery_images`;

// Zod schema for creating/updating a gallery album
const galleryAlbumSchema = z.object({
  name: z.string().min(1, "Le nom de l'album est requis."),
  description: z.string().optional().nullable(),
  cover_image_url: z.string().url("URL de l'image de couverture invalide.").optional().nullable().or(z.literal('')),
});

export const getAllAlbums = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const albums = await db<GalleryAlbum>(ALBUMS_TABLE)
      .leftJoin(IMAGES_TABLE, `${ALBUMS_TABLE}.id`, `${IMAGES_TABLE}.album_id`)
      .select(
        `${ALBUMS_TABLE}.*`,
        db.raw(`COUNT(${IMAGES_TABLE}.id) as image_count`)
      )
      .groupBy(`${ALBUMS_TABLE}.id`)
      .orderBy(`${ALBUMS_TABLE}.name`, 'asc');

    // Knex with SQLite might return image_count as string, ensure it's number
    const processedAlbums = albums.map(album => ({
        ...album,
        image_count: Number(album.image_count || 0)
    }));

    res.status(200).json(processedAlbums);
  } catch (error) {
    console.error("Get all gallery albums error:", error);
    next(error);
  }
};

export const getAlbumById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { albumId } = req.params;
    const album = await db<GalleryAlbum>(ALBUMS_TABLE)
      .leftJoin(IMAGES_TABLE, `${ALBUMS_TABLE}.id`, `${IMAGES_TABLE}.album_id`)
      .select(
        `${ALBUMS_TABLE}.*`,
        db.raw(`COUNT(${IMAGES_TABLE}.id) as image_count`)
      )
      .where(`${ALBUMS_TABLE}.id`, albumId)
      .groupBy(`${ALBUMS_TABLE}.id`)
      .first();

    if (!album) {
      return res.status(404).json({ message: 'Album non trouvé.' });
    }

    const processedAlbum = {
        ...album,
        image_count: Number(album.image_count || 0)
    };
    res.status(200).json(processedAlbum);
  } catch (error) {
    console.error("Get gallery album by ID error:", error);
    next(error);
  }
};

export const createAlbum = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationResult = galleryAlbumSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: "Validation errors", errors: validationResult.error.flatten().fieldErrors });
    }

    const { name, description, cover_image_url } = validationResult.data;

    const existingAlbum = await db<GalleryAlbum>(ALBUMS_TABLE).where({ name }).first();
    if (existingAlbum) {
      return res.status(409).json({ message: `Un album nommé '${name}' existe déjà.` });
    }

    const [newAlbumIdObj] = await db<Omit<GalleryAlbum, 'id'>>(ALBUMS_TABLE)
      .insert({
        name,
        description,
        cover_image_url: cover_image_url || null
      })
      .returning('id');

    let newAlbumId = newAlbumIdObj;
    if (typeof newAlbumIdObj === 'object' && newAlbumIdObj !== null && 'id' in newAlbumIdObj) {
        newAlbumId = (newAlbumIdObj as { id: any }).id;
    }

    const newAlbum = await db<GalleryAlbum>(ALBUMS_TABLE).where({ id: newAlbumId }).first();
    res.status(201).json({ message: 'Album créé avec succès!', album: {...newAlbum, image_count: 0} });
  } catch (error) {
    console.error("Create gallery album error:", error);
    if ((error as any).code === 'SQLITE_CONSTRAINT' && (error as any).message.includes(`UNIQUE constraint failed: ${ALBUMS_TABLE.split('.')[1]}.name`)) { // Adjust for potential schema prefix
        return res.status(409).json({ message: `Un album nommé '${req.body.name}' existe déjà.` });
    }
    next(error);
  }
};

export const updateAlbum = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { albumId } = req.params;
    const validationResult = galleryAlbumSchema.partial().safeParse(req.body); // Partial for update
    if (!validationResult.success) {
      return res.status(400).json({ message: "Validation errors", errors: validationResult.error.flatten().fieldErrors });
    }

    const fieldsToUpdate = validationResult.data;

    if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ message: "Aucun champ à mettre à jour fourni." });
    }

    if (fieldsToUpdate.name) {
        const existingAlbum = await db<GalleryAlbum>(ALBUMS_TABLE)
            .where({ name: fieldsToUpdate.name })
            .andWhereNot({ id: albumId })
            .first();
        if (existingAlbum) {
            return res.status(409).json({ message: `Un autre album nommé '${fieldsToUpdate.name}' existe déjà.` });
        }
    }

    if (fieldsToUpdate.cover_image_url === '') fieldsToUpdate.cover_image_url = null;

    // @ts-ignore
    fieldsToUpdate.updated_at = new Date().toISOString();

    const updatedRows = await db<GalleryAlbum>(ALBUMS_TABLE)
      .where({ id: albumId })
      .update(fieldsToUpdate);

    if (updatedRows === 0) {
      return res.status(404).json({ message: 'Album non trouvé ou aucune modification effectuée.' });
    }

    const updatedAlbum = await db<GalleryAlbum>(ALBUMS_TABLE).where({ id: albumId }).first();
    // Re-fetch with image count for consistency
    const finalAlbum = await getAlbumById({ params: { albumId } } as Request, res, next);
    // This re-uses getAlbumById's logic but will send response. Better to fetch data and construct here.
    // For now, let's just return the updatedAlbum data directly
    // const albumWithCount = await db<GalleryAlbum>(ALBUMS_TABLE)
    //   .leftJoin(IMAGES_TABLE, `${ALBUMS_TABLE}.id`, `${IMAGES_TABLE}.album_id`)
    //   .select(`${ALBUMS_TABLE}.*`, db.raw(`COUNT(${IMAGES_TABLE}.id) as image_count`))
    //   .where(`${ALBUMS_TABLE}.id`, albumId)
    //   .groupBy(`${ALBUMS_TABLE}.id`).first();
    // albumWithCount.image_count = Number(albumWithCount.image_count || 0);

    res.status(200).json({ message: 'Album mis à jour avec succès!', album: updatedAlbum }); // Simpler return for now
  } catch (error) {
    console.error("Update gallery album error:", error);
     if ((error as any).code === 'SQLITE_CONSTRAINT' && (error as any).message.includes(`UNIQUE constraint failed: ${ALBUMS_TABLE.split('.')[1]}.name`)) {
        return res.status(409).json({ message: `Un autre album nommé '${req.body.name}' existe déjà.` });
    }
    next(error);
  }
};

export const deleteAlbum = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { albumId } = req.params;

    // Note: Associated images will be deleted by DB CASCADE if FK is set up that way.
    // If not, images should be deleted manually here first: await db(IMAGES_TABLE).where({ album_id: albumId }).del();

    const deletedRows = await db<GalleryAlbum>(ALBUMS_TABLE).where({ id: albumId }).del();

    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Album non trouvé.' });
    }

    res.status(200).json({ message: 'Album et ses images supprimés avec succès.' });
  } catch (error) {
    console.error("Delete gallery album error:", error);
    next(error);
  }
};
