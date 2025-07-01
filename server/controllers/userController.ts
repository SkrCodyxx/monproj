import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db'; // Knex instance
import { User } from '../../src/types'; // Frontend User type
import * as z from 'zod';

// Zod schema for profile update (excluding email, password)
// For admin updates, we might allow more fields or have different validation
const adminUserProfileUpdateSchema = z.object({
  firstName: z.string().min(1, "Prénom requis").optional(),
  lastName: z.string().min(1, "Nom de famille requis").optional(),
  phone: z.string().optional(),
});

// Zod schema for admin updating a user's role
const updateUserRoleSchema = z.object({
  role: z.enum(['client', 'admin'], { message: "Role invalide. Doit être 'client' ou 'admin'." }),
});

// Zod schema for password change (used by user for their own password)
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: z.string().min(8, "Le nouveau mot de passe doit faire au moins 8 caractères"),
  // confirmNewPassword is validated on client, only newPassword needed here if validated again
});


export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id; // From authMiddleware
    if (!userId) {
      return res.status(401).json({ message: "Non autorisé. ID utilisateur manquant." });
    }

    const validationResult = userProfileUpdateSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: "Validation errors", errors: validationResult.error.flatten().fieldErrors });
    }

    const { firstName, lastName, phone } = validationResult.data;

    const fieldsToUpdate: Partial<Pick<User, 'firstName' | 'lastName' | 'phone'>> = {};
    if (firstName) fieldsToUpdate.firstName = firstName;
    if (lastName) fieldsToUpdate.lastName = lastName;
    if (phone) fieldsToUpdate.phone = phone;
    // Note: 'phone' isn't in the User type from src/types yet. It should be added if this feature is kept.
    // For now, this will work if the DB table has a 'phone' column, but User type should match.

    if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ message: "Aucun champ à mettre à jour fourni." });
    }

    fieldsToUpdate.updated_at = new Date(); // Manually update timestamp

    const updatedUserRows = await db<User>(`${process.env.DB_SCHEMA || 'main'}.users`)
      .where({ id: userId })
      .update(fieldsToUpdate)
      .returning(['id', 'firstName', 'lastName', 'email', 'role', 'phone']); // Add 'phone' if it exists

    if (updatedUserRows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé ou aucune mise à jour effectuée." });
    }

    // Assuming returning('*') or specific fields returns an array with the updated user
    const updatedUser = updatedUserRows[0];

    // Exclude password (though it's not part of 'returning' here)
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      message: 'Profil mis à jour avec succès!',
      user: userWithoutPassword,
    });

  } catch (error) {
    console.error("Update profile error:", error);
    next(error);
  }
};


// --- Admin User Management Controllers ---

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Basic pagination
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const offset = (page - 1) * pageSize;

    const users = await db<User>(`${process.env.DB_SCHEMA || 'main'}.users`)
      .select('id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'created_at', 'phone')
      .limit(pageSize)
      .offset(offset)
      .orderBy('created_at', 'desc');

    const totalUsersResult = await db<User>(`${process.env.DB_SCHEMA || 'main'}.users`).count({ count: '*' }).first();
    const totalUsers = parseInt(totalUsersResult?.count?.toString() || "0");

    res.status(200).json({
      data: users,
      pagination: {
        page,
        pageSize,
        totalItems: totalUsers,
        totalPages: Math.ceil(totalUsers / pageSize),
      }
    });
  } catch (error) {
    console.error("Get all users error:", error);
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await db<User>(`${process.env.DB_SCHEMA || 'main'}.users`)
      .select('id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'created_at', 'phone')
      .where({ id })
      .first();

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);
    next(error);
  }
};

export const updateUserRoleById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validationResult = updateUserRoleSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({ message: "Validation errors", errors: validationResult.error.flatten().fieldErrors });
    }
    const { role } = validationResult.data;

    // Prevent admin from changing their own role or a superadmin's role if that logic existed
    // For now, simple update.
    // Also, ensure the user being updated isn't the only admin, etc. (more complex logic for later)

    const updatedUserRows = await db<User>(`${process.env.DB_SCHEMA || 'main'}.users`)
      .where({ id })
      .update({ role, updated_at: new Date() })
      .returning(['id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'phone']);

    if (updatedUserRows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé ou aucune mise à jour effectuée." });
    }

    res.status(200).json({ message: 'Rôle utilisateur mis à jour.', user: updatedUserRows[0] });
  } catch (error) {
    console.error("Update user role error:", error);
    next(error);
  }
};

export const toggleUserActivationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userToUpdate = await db<User>(`${process.env.DB_SCHEMA || 'main'}.users`).where({ id }).first();

    if (!userToUpdate) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Prevent admin from deactivating themselves if they are the only admin (more complex logic)
    // For now, simple toggle.

    const newIsActiveStatus = !userToUpdate.isActive;

    const updatedUserRows = await db<User>(`${process.env.DB_SCHEMA || 'main'}.users`)
      .where({ id })
      .update({ isActive: newIsActiveStatus, updated_at: new Date() })
      .returning(['id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'phone']);

    if (updatedUserRows.length === 0) {
        return res.status(404).json({ message: "Utilisateur non trouvé ou aucune mise à jour effectuée." });
    }

    res.status(200).json({
      message: `Utilisateur ${newIsActiveStatus ? 'activé' : 'désactivé'} avec succès.`,
      user: updatedUserRows[0]
    });
  } catch (error) {
    console.error("Toggle user activation error:", error);
    next(error);
  }
};


export const updateUserPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Non autorisé. ID utilisateur manquant." });
    }

    const validationResult = passwordChangeSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: "Validation errors", errors: validationResult.error.flatten().fieldErrors });
    }
    const { currentPassword, newPassword } = validationResult.data;

    // Fetch user to verify current password
    const user = await db<User>(`${process.env.DB_SCHEMA || 'main'}.users`).where({ id: userId }).first();
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Compare current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Le mot de passe actuel est incorrect.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await db<User>(`${process.env.DB_SCHEMA || 'main'}.users`)
      .where({ id: userId })
      .update({
        password: hashedNewPassword,
        updated_at: new Date() // Manually update timestamp
      });

    res.status(200).json({ message: 'Mot de passe changé avec succès!' });

  } catch (error) {
    console.error("Change password error:", error);
    next(error);
  }
};

// Get user details (could be part of authController or userController)
export const getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const user = await db<User>(`${process.env.DB_SCHEMA || 'main'}.users`)
      .select('id', 'firstName', 'lastName', 'email', 'role', 'phone') // Select specific fields, add 'phone'
      .where({ id: userId })
      .first();

    if (!user) {
      return res.status(404).json({ message: 'Profil utilisateur non trouvé.' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    next(error);
  }
};
