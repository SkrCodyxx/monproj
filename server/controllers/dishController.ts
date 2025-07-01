import { Request, Response, NextFunction } from 'express';
import db from '../db'; // Knex instance
import { Dish } from '../../src/types'; // Shared Dish type
import * as z from 'zod';

const TABLE_NAME = `${process.env.DB_SCHEMA || 'main'}.dishes`;

// Zod schema for creating/updating a dish
const dishSchema = z.object({
  name: z.string().min(1, "Le nom du plat est requis."),
  description: z.string().min(1, "La description est requise."),
  price: z.number().positive("Le prix doit être un nombre positif."),
  category_id: z.union([z.string(), z.number()]).transform(val => Number(val)).refine(val => !isNaN(val) && val > 0, "ID de catégorie invalide."), // Ensure it's a positive number
  image_url: z.string().url("URL de l'image invalide.").optional().or(z.literal('')), // Optional and can be empty string
  allergens: z.string().optional(),
  is_available: z.boolean().default(true),
});
// For updates, make all fields optional initially, then refine based on what's provided
const partialDishSchema = dishSchema.partial();


export const getAllDishes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category_id, page: queryPage, pageSize: queryPageSize, is_available } = req.query;

    const page = parseInt(queryPage as string) || 1;
    const pageSize = parseInt(queryPageSize as string) || 10;
    const offset = (page - 1) * pageSize;

    let query = db<Dish>(TABLE_NAME)
      .select(`${TABLE_NAME}.*`, `${process.env.DB_SCHEMA || 'main'}.categories.name as category_name`)
      .leftJoin(`${process.env.DB_SCHEMA || 'main'}.categories`, `${TABLE_NAME}.category_id`, `${process.env.DB_SCHEMA || 'main'}.categories.id`);

    if (category_id) {
      query = query.where(`${TABLE_NAME}.category_id`, category_id as string);
    }
    if (is_available !== undefined) {
        query = query.where(`${TABLE_NAME}.is_available`, is_available === 'true');
    }

    const dishes = await query.clone().limit(pageSize).offset(offset).orderBy(`${TABLE_NAME}.name`, 'asc');

    // Count total items for pagination (considering filters)
    const totalDishesResult = await query.clone().clearSelect().clearOrder().count({ count: '*' }).first();
    const totalItems = parseInt(totalDishesResult?.count?.toString() || "0");

    res.status(200).json({
        data: dishes,
        pagination: {
            page,
            pageSize,
            totalItems,
            totalPages: Math.ceil(totalItems / pageSize)
        }
    });
  } catch (error) {
    console.error("Get all dishes error:", error);
    next(error);
  }
};

export const getDishById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const dish = await db<Dish>(TABLE_NAME)
        .select(`${TABLE_NAME}.*`, `${process.env.DB_SCHEMA || 'main'}.categories.name as category_name`)
        .leftJoin(`${process.env.DB_SCHEMA || 'main'}.categories`, `${TABLE_NAME}.category_id`, `${process.env.DB_SCHEMA || 'main'}.categories.id`)
        .where(`${TABLE_NAME}.id`, id)
        .first();

    if (!dish) {
      return res.status(404).json({ message: 'Plat non trouvé.' });
    }
    res.status(200).json(dish);
  } catch (error) {
    console.error("Get dish by ID error:", error);
    next(error);
  }
};

export const createDish = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Price might come as string from form data, ensure it's number
    const body = { ...req.body, price: parseFloat(req.body.price) };
    const validationResult = dishSchema.safeParse(body);
    if (!validationResult.success) {
      return res.status(400).json({ message: "Validation errors", errors: validationResult.error.flatten().fieldErrors });
    }

    const { name, description, price, category_id, image_url, allergens, is_available } = validationResult.data;

    // Check if category exists
    const categoryExists = await db(`${process.env.DB_SCHEMA || 'main'}.categories`).where({ id: category_id }).first();
    if (!categoryExists) {
        return res.status(400).json({ message: `La catégorie avec l'ID ${category_id} n'existe pas.`});
    }

    const [newDishIdObj] = await db<Omit<Dish, 'id'>>(TABLE_NAME)
      .insert({
        name,
        description,
        price,
        category_id,
        image_url: image_url || null, // Ensure null if empty string was intended as null
        allergens: allergens || null,
        is_available,
      })
      .returning('id');

    let newDishId = newDishIdObj;
    if (typeof newDishIdObj === 'object' && newDishIdObj !== null && 'id' in newDishIdObj) {
        newDishId = (newDishIdObj as { id: any }).id;
    }

    const newDish = await db<Dish>(TABLE_NAME).where({ id: newDishId }).first();
    res.status(201).json({ message: 'Plat créé avec succès!', dish: newDish });
  } catch (error) {
    console.error("Create dish error:", error);
    next(error);
  }
};

export const updateDish = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const body = { ...req.body, price: req.body.price !== undefined ? parseFloat(req.body.price) : undefined };

    // Use partial schema for update, only validated fields present in body will be checked
    const validationResult = partialDishSchema.safeParse(body);
    if (!validationResult.success) {
      return res.status(400).json({ message: "Validation errors", errors: validationResult.error.flatten().fieldErrors });
    }

    const fieldsToUpdate = validationResult.data;

    if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ message: "Aucun champ à mettre à jour fourni." });
    }

    // If category_id is being updated, check if the new category exists
    if (fieldsToUpdate.category_id) {
        const categoryExists = await db(`${process.env.DB_SCHEMA || 'main'}.categories`).where({ id: fieldsToUpdate.category_id }).first();
        if (!categoryExists) {
            return res.status(400).json({ message: `La catégorie avec l'ID ${fieldsToUpdate.category_id} n'existe pas.`});
        }
    }

    fieldsToUpdate.updated_at = new Date().toISOString();
    if (fieldsToUpdate.image_url === '') fieldsToUpdate.image_url = null;
    if (fieldsToUpdate.allergens === '') fieldsToUpdate.allergens = null;


    const updatedRows = await db<Dish>(TABLE_NAME)
      .where({ id })
      .update(fieldsToUpdate);

    if (updatedRows === 0) {
      return res.status(404).json({ message: 'Plat non trouvé ou aucune modification effectuée.' });
    }

    const updatedDish = await db<Dish>(TABLE_NAME).where({ id }).first();
    res.status(200).json({ message: 'Plat mis à jour avec succès!', dish: updatedDish });
  } catch (error) {
    console.error("Update dish error:", error);
    next(error);
  }
};

export const deleteDish = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deletedRows = await db<Dish>(TABLE_NAME).where({ id }).del();

    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Plat non trouvé.' });
    }

    res.status(200).json({ message: 'Plat supprimé avec succès.' });
  } catch (error) {
    console.error("Delete dish error:", error);
    next(error);
  }
};
