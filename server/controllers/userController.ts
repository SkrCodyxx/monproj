import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db'; // Knex instance
import { User } from '../../src/types'; // Frontend User type
import * as z from 'zod';

// Zod schema for profile update (excluding email, password)
const userProfileUpdateSchema = z.object({
  firstName: z.string().min(1, "Prénom requis").optional(),
  lastName: z.string().min(1, "Nom de famille requis").optional(),
  phone: z.string().optional(), // Add more specific validation if needed
});

// Zod schema for password change
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
