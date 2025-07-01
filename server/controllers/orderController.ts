import { Request, Response, NextFunction } from 'express';
import db from '../db'; // Knex instance
import { Order, OrderItem, OrderStatus, User } from '../../src/types'; // Shared types
import * as z from 'zod';

const ORDERS_TABLE = `${process.env.DB_SCHEMA || 'main'}.orders`;
const ORDER_ITEMS_TABLE = `${process.env.DB_SCHEMA || 'main'}.order_items`;
const USERS_TABLE = `${process.env.DB_SCHEMA || 'main'}.users`;

// Zod schema for updating order status
const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'], {
    errorMap: () => ({ message: "Statut invalide." })
  }),
});

// Zod schema for query parameters for getAllOrders
const getAllOrdersQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().positive().optional().default(10),
    status: z.string().optional(), // Further validation can be added if specific statuses are expected
    user_id: z.coerce.number().int().positive().optional(),
    dateFrom: z.string().datetime({ message: "Format de date 'De' invalide" }).optional(),
    dateTo: z.string().datetime({ message: "Format de date 'À' invalide" }).optional(),
    search: z.string().optional(), // For customer name/email or order ID
});


export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryValidation = getAllOrdersQuerySchema.safeParse(req.query);
    if (!queryValidation.success) {
        return res.status(400).json({ message: "Paramètres de requête invalides", errors: queryValidation.error.flatten().fieldErrors });
    }
    const { page, pageSize, status, user_id, dateFrom, dateTo, search } = queryValidation.data;
    const offset = (page - 1) * pageSize;

    let query = db<Order>(ORDERS_TABLE)
      .leftJoin(USERS_TABLE, `${ORDERS_TABLE}.user_id`, `${USERS_TABLE}.id`)
      .select(
        `${ORDERS_TABLE}.*`,
        db.raw(`json_object('id', ${USERS_TABLE}.id, 'firstName', ${USERS_TABLE}.firstName, 'lastName', ${USERS_TABLE}.lastName, 'email', ${USERS_TABLE}.email) as user`)
        // The above json_object might need adjustment based on exact User fields needed and DB (SQLite specific)
        // A simpler alternative if json_object is tricky or not fully supported:
        // `${USERS_TABLE}.email as user_email`,
        // `${USERS_TABLE}.firstName as user_firstName`,
        // `${USERS_TABLE}.lastName as user_lastName`
      );

    if (status) {
      query = query.where(`${ORDERS_TABLE}.status`, status);
    }
    if (user_id) {
      query = query.where(`${ORDERS_TABLE}.user_id`, user_id);
    }
    if (dateFrom) {
      query = query.where(`${ORDERS_TABLE}.created_at`, '>=', new Date(dateFrom).toISOString());
    }
    if (dateTo) {
      // Adjust dateTo to include the entire day
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      query = query.where(`${ORDERS_TABLE}.created_at`, '<=', endDate.toISOString());
    }
    if (search) {
        query = query.where(function() {
            this.where(`${ORDERS_TABLE}.customer_name`, 'like', `%${search}%`)
                .orWhere(`${ORDERS_TABLE}.customer_email`, 'like', `%${search}%`)
                .orWhere(`${ORDERS_TABLE}.id`, 'like', `%${search}%`) // Assuming order ID can be searched
                .orWhere(`${USERS_TABLE}.firstName`, 'like', `%${search}%`)
                .orWhere(`${USERS_TABLE}.lastName`, 'like', `%${search}%`)
                .orWhere(`${USERS_TABLE}.email`, 'like', `%${search}%`);
        });
    }

    const orders = await query.clone().limit(pageSize).offset(offset).orderBy(`${ORDERS_TABLE}.created_at`, 'desc');

    // Parse user JSON string if json_object was used
    const processedOrders = orders.map(order => {
        if (order.user && typeof order.user === 'string') {
            try {
                return { ...order, user: JSON.parse(order.user as string) };
            } catch (e) {
                console.error("Failed to parse user JSON for order:", order.id, e);
                return { ...order, user: null }; // or some default user object
            }
        }
        return order;
    });


    const totalItemsResult = await query.clone().clearSelect().clearOrder().countDistinct(`${ORDERS_TABLE}.id as count`).first();
    const totalItems = parseInt(totalItemsResult?.count?.toString() || "0");

    res.status(200).json({
        data: processedOrders,
        pagination: {
            page,
            pageSize,
            totalItems,
            totalPages: Math.ceil(totalItems / pageSize)
        }
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    next(error);
  }
};


export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await db<Order>(ORDERS_TABLE)
      .leftJoin(USERS_TABLE, `${ORDERS_TABLE}.user_id`, `${USERS_TABLE}.id`)
      .select(
        `${ORDERS_TABLE}.*`,
        db.raw(`json_object('id', ${USERS_TABLE}.id, 'firstName', ${USERS_TABLE}.firstName, 'lastName', ${USERS_TABLE}.lastName, 'email', ${USERS_TABLE}.email) as user`)
      )
      .where(`${ORDERS_TABLE}.id`, id)
      .first();

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée.' });
    }

    const items = await db<OrderItem>(ORDER_ITEMS_TABLE).where({ order_id: id });

    let processedOrder = { ...order, items };
    if (processedOrder.user && typeof processedOrder.user === 'string') {
        try {
            processedOrder.user = JSON.parse(processedOrder.user as string);
        } catch (e) {
            processedOrder.user = null;
        }
    }


    res.status(200).json(processedOrder);
  } catch (error) {
    console.error("Get order by ID error:", error);
    next(error);
  }
};


export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validationResult = updateOrderStatusSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({ message: "Validation errors", errors: validationResult.error.flatten().fieldErrors });
    }
    const { status } = validationResult.data;

    // Optional: Add logic here to validate status transitions
    // e.g., an order cannot go from 'delivered' back to 'pending'

    const updatedRows = await db<Order>(ORDERS_TABLE)
      .where({ id })
      .update({ status, updated_at: new Date().toISOString() });

    if (updatedRows === 0) {
      return res.status(404).json({ message: 'Commande non trouvée ou statut non modifié.' });
    }

    const updatedOrder = await db<Order>(ORDERS_TABLE).where({ id }).first(); // Fetch updated order
    res.status(200).json({ message: 'Statut de la commande mis à jour!', order: updatedOrder });
  } catch (error) {
    console.error("Update order status error:", error);
    next(error);
  }
};
