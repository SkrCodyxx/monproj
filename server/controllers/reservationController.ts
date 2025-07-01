import { Request, Response, NextFunction } from 'express';
import db from '../db'; // Knex instance
import { Reservation, ReservationStatus, User } from '../../src/types'; // Shared types
import * as z from 'zod';

const RESERVATIONS_TABLE = `${process.env.DB_SCHEMA || 'main'}.reservations`;
const USERS_TABLE = `${process.env.DB_SCHEMA || 'main'}.users`;

// Zod schema for query parameters for getAllReservations
const getAllReservationsQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().positive().optional().default(10),
    status: z.string().optional(),
    user_id: z.coerce.number().int().positive().optional(),
    eventDateFrom: z.string().datetime({ message: "Format de date 'De' invalide" }).optional(),
    eventDateTo: z.string().datetime({ message: "Format de date 'À' invalide" }).optional(),
    search: z.string().optional(), // For customer name/email or reservation ID/event type
});

// Zod schema for updating reservation status
const updateReservationStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled'], {
    errorMap: () => ({ message: "Statut de réservation invalide." })
  }),
});

// Zod schema for updating reservation details (more comprehensive)
const updateReservationDetailsSchema = z.object({
  event_type: z.string().min(1, "Type d'événement requis").optional(),
  event_date: z.string().datetime("Format de date d'événement invalide").optional(),
  number_of_guests: z.coerce.number().int().positive("Nombre d'invités doit être positif").optional(),
  customer_name: z.string().min(1, "Nom du client requis").optional(),
  customer_email: z.string().email("Email client invalide").optional(),
  customer_phone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  // status can also be part of this if a single endpoint is preferred for all updates
});


export const getAllReservations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryValidation = getAllReservationsQuerySchema.safeParse(req.query);
    if (!queryValidation.success) {
        return res.status(400).json({ message: "Paramètres de requête invalides", errors: queryValidation.error.flatten().fieldErrors });
    }
    const { page, pageSize, status, user_id, eventDateFrom, eventDateTo, search } = queryValidation.data;
    const offset = (page - 1) * pageSize;

    let query = db<Reservation>(RESERVATIONS_TABLE)
      .leftJoin(USERS_TABLE, `${RESERVATIONS_TABLE}.user_id`, `${USERS_TABLE}.id`)
      .select(
        `${RESERVATIONS_TABLE}.*`,
        db.raw(`json_object('id', ${USERS_TABLE}.id, 'firstName', ${USERS_TABLE}.firstName, 'lastName', ${USERS_TABLE}.lastName, 'email', ${USERS_TABLE}.email) as user`)
      );

    if (status) {
      query = query.where(`${RESERVATIONS_TABLE}.status`, status);
    }
    if (user_id) {
      query = query.where(`${RESERVATIONS_TABLE}.user_id`, user_id);
    }
    if (eventDateFrom) {
      query = query.where(`${RESERVATIONS_TABLE}.event_date`, '>=', new Date(eventDateFrom).toISOString());
    }
    if (eventDateTo) {
      const endDate = new Date(eventDateTo);
      endDate.setHours(23, 59, 59, 999); // Include the entire day
      query = query.where(`${RESERVATIONS_TABLE}.event_date`, '<=', endDate.toISOString());
    }
     if (search) {
        query = query.where(function() {
            this.where(`${RESERVATIONS_TABLE}.customer_name`, 'like', `%${search}%`)
                .orWhere(`${RESERVATIONS_TABLE}.customer_email`, 'like', `%${search}%`)
                .orWhere(`${RESERVATIONS_TABLE}.event_type`, 'like', `%${search}%`)
                .orWhere(`${RESERVATIONS_TABLE}.id`, 'like', `%${search}%`)
                .orWhere(`${USERS_TABLE}.firstName`, 'like', `%${search}%`)
                .orWhere(`${USERS_TABLE}.lastName`, 'like', `%${search}%`)
                .orWhere(`${USERS_TABLE}.email`, 'like', `%${search}%`);
        });
    }


    const reservations = await query.clone().limit(pageSize).offset(offset).orderBy(`${RESERVATIONS_TABLE}.event_date`, 'desc');

    const processedReservations = reservations.map(r => ({
        ...r,
        user: r.user && typeof r.user === 'string' ? JSON.parse(r.user) : r.user
    }));

    const totalItemsResult = await query.clone().clearSelect().clearOrder().countDistinct(`${RESERVATIONS_TABLE}.id as count`).first();
    const totalItems = parseInt(totalItemsResult?.count?.toString() || "0");

    res.status(200).json({
        data: processedReservations,
        pagination: { page, pageSize, totalItems, totalPages: Math.ceil(totalItems / pageSize) }
    });
  } catch (error) {
    console.error("Get all reservations error:", error);
    next(error);
  }
};


export const getReservationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const reservation = await db<Reservation>(RESERVATIONS_TABLE)
      .leftJoin(USERS_TABLE, `${RESERVATIONS_TABLE}.user_id`, `${USERS_TABLE}.id`)
      .select(
        `${RESERVATIONS_TABLE}.*`,
        db.raw(`json_object('id', ${USERS_TABLE}.id, 'firstName', ${USERS_TABLE}.firstName, 'lastName', ${USERS_TABLE}.lastName, 'email', ${USERS_TABLE}.email) as user`)
      )
      .where(`${RESERVATIONS_TABLE}.id`, id)
      .first();

    if (!reservation) {
      return res.status(404).json({ message: 'Réservation non trouvée.' });
    }

    const processedReservation = {
        ...reservation,
        user: reservation.user && typeof reservation.user === 'string' ? JSON.parse(reservation.user) : reservation.user
    };

    res.status(200).json(processedReservation);
  } catch (error) {
    console.error("Get reservation by ID error:", error);
    next(error);
  }
};


export const updateReservationStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validationResult = updateReservationStatusSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({ message: "Validation errors", errors: validationResult.error.flatten().fieldErrors });
    }
    const { status } = validationResult.data;

    // Optional: Add logic here to validate status transitions

    const updatedRows = await db<Reservation>(RESERVATIONS_TABLE)
      .where({ id })
      .update({ status, updated_at: new Date().toISOString() });

    if (updatedRows === 0) {
      return res.status(404).json({ message: 'Réservation non trouvée ou statut non modifié.' });
    }

    const updatedReservation = await db<Reservation>(RESERVATIONS_TABLE).where({ id }).first();
    res.status(200).json({ message: 'Statut de la réservation mis à jour!', reservation: updatedReservation });
  } catch (error) {
    console.error("Update reservation status error:", error);
    next(error);
  }
};

export const updateReservationDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const validationResult = updateReservationDetailsSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({ message: "Validation errors", errors: validationResult.error.flatten().fieldErrors });
        }

        const fieldsToUpdate = validationResult.data;

        if (Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json({ message: "Aucun champ à mettre à jour fourni." });
        }

        // @ts-ignore - Knex typings might complain about Partial<Reservation> with Date object for updated_at
        fieldsToUpdate.updated_at = new Date().toISOString();

        const updatedRows = await db<Reservation>(RESERVATIONS_TABLE)
            .where({ id })
            .update(fieldsToUpdate);

        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Réservation non trouvée ou aucune modification effectuée.' });
        }

        const updatedReservation = await db<Reservation>(RESERVATIONS_TABLE).where({ id }).first();
        res.status(200).json({ message: 'Détails de la réservation mis à jour!', reservation: updatedReservation });

    } catch (error) {
        console.error("Update reservation details error:", error);
        next(error);
    }
};
