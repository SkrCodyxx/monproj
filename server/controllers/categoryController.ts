import { Request, Response, NextFunction } from 'express';
import db from '../db'; // Knex instance
import { Category } from '../../src/types'; // Shared Category type
import * as z from 'zod';

const TABLE_NAME = `${process.env.DB_SCHEMA || 'main'}.categories`;

// Zod schema for creating/updating a category
const categorySchema = z.object({
  name: z.string().min(1, "Le nom de la catégorie est requis."),
  description: z.string().optional(),
});

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await db<Category>(TABLE_NAME).select('*').orderBy('name', 'asc');
    res.status(200).json(categories);
  } catch (error) {
    console.error("Get all categories error:", error);
    next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const category = await db<Category>(TABLE_NAME).where({ id }).first();
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée.' });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("Get category by ID error:", error);
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationResult = categorySchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: "Validation errors", errors: validationResult.error.flatten().fieldErrors });
    }

    const { name, description } = validationResult.data;

    // Check if category with the same name already exists
    const existingCategory = await db<Category>(TABLE_NAME).where({ name }).first();
    if (existingCategory) {
      return res.status(409).json({ message: `Une catégorie nommée '${name}' existe déjà.` });
    }

    const [newCategoryIdObj] = await db<Omit<Category, 'id'>>(TABLE_NAME)
      .insert({ name, description })
      .returning('id'); // For SQLite, this often returns the ID directly or an object { id: ... } depending on setup.
                        // Knex typically normalizes to an array of objects like [{ id: newId }] for PostgreSQL.
                        // For SQLite, it might just be [newId] if newId is a number.

    let newCategoryId = newCategoryIdObj;
    // Handle cases where newCategoryIdObj might be { id: val } or just val
    if (typeof newCategoryIdObj === 'object' && newCategoryIdObj !== null && 'id' in newCategoryIdObj) {
        newCategoryId = (newCategoryIdObj as { id: any }).id;
    }


    const newCategory = await db<Category>(TABLE_NAME).where({ id: newCategoryId }).first();

    res.status(201).json({ message: 'Catégorie créée avec succès!', category: newCategory });
  } catch (error) {
    console.error("Create category error:", error);
    if ((error as any).code === 'SQLITE_CONSTRAINT' && (error as any).message.includes('UNIQUE constraint failed: categories.name')) {
        return res.status(409).json({ message: `Une catégorie nommée '${req.body.name}' existe déjà.` });
    }
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validationResult = categorySchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: "Validation errors", errors: validationResult.error.flatten().fieldErrors });
    }

    const { name, description } = validationResult.data;

    // Check if another category with the new name already exists (excluding the current one)
    if (name) {
        const existingCategory = await db<Category>(TABLE_NAME)
            .where({ name })
            .andWhereNot({ id })
            .first();
        if (existingCategory) {
            return res.status(409).json({ message: `Une autre catégorie nommée '${name}' existe déjà.` });
        }
    }

    const fieldsToUpdate: Partial<Category> = {};
    if (name) fieldsToUpdate.name = name;
    if (description !== undefined) fieldsToUpdate.description = description; // Allow setting description to null/empty

    if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ message: "Aucun champ à mettre à jour fourni." });
    }
    fieldsToUpdate.updated_at = new Date().toISOString();


    const updatedRows = await db<Category>(TABLE_NAME)
      .where({ id })
      .update(fieldsToUpdate);

    if (updatedRows === 0) {
      return res.status(404).json({ message: 'Catégorie non trouvée ou aucune modification effectuée.' });
    }

    const updatedCategory = await db<Category>(TABLE_NAME).where({ id }).first();
    res.status(200).json({ message: 'Catégorie mise à jour avec succès!', category: updatedCategory });
  } catch (error) {
    console.error("Update category error:", error);
     if ((error as any).code === 'SQLITE_CONSTRAINT' && (error as any).message.includes('UNIQUE constraint failed: categories.name')) {
        return res.status(409).json({ message: `Une autre catégorie nommée '${req.body.name}' existe déjà.` });
    }
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // IMPORTANT: Check if any dishes are associated with this category
    // For now, we'll assume onDelete: 'RESTRICT' on the DB or handle it here.
    const dishesInCategory = await db(`${process.env.DB_SCHEMA || 'main'}.dishes`).where({ category_id: id }).count({ count: '*' }).first();
    const dishCount = parseInt(dishesInCategory?.count?.toString() || "0");

    if (dishCount > 0) {
      return res.status(400).json({ message: `Impossible de supprimer la catégorie car ${dishCount} plat(s) y sont associés. Veuillez d'abord réassigner ou supprimer ces plats.` });
    }

    const deletedRows = await db<Category>(TABLE_NAME).where({ id }).del();

    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Catégorie non trouvée.' });
    }

    res.status(200).json({ message: 'Catégorie supprimée avec succès.' }); // Or 204 No Content
  } catch (error) {
    console.error("Delete category error:", error);
    next(error);
  }
};
