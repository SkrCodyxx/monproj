import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db'; // Knex instance
import { generateToken } from '../utils/jwtHelper';
import { User } from '../../src/types'; // Frontend User type, may need backend-specific one later
import * as z from 'zod';

// Zod schemas for validation
const registerSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom de famille requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères"),
  // role: z.enum(['client', 'admin']).optional(), // Role might be set by admin or default
});

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});


export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: "Validation errors", errors: validationResult.error.flatten().fieldErrors });
    }

    const { firstName, lastName, email, password } = validationResult.data;

    // Check if user already exists
    const existingUser = await db<User>(`${process.env.DB_SCHEMA || 'main'}.users`).where({ email }).first();
    if (existingUser) {
      return res.status(409).json({ message: 'Un utilisateur avec cet email existe déjà.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    // Knex returns an array of IDs, so we take the first one.
    const [newUserId] = await db<Omit<User, 'id'>>(`${process.env.DB_SCHEMA || 'main'}.users`).insert({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'client', // Default role
      // created_at and updated_at are handled by DB defaults if set in migration
    }).returning('id');

    // Fetch the created user to get all fields (like default role, timestamps if needed)
    // Or construct the user object manually if insert returns enough data (SQLite might not return full row)
    const newUser = await db<User>(`${process.env.DB_SCHEMA || 'main'}.users`).where({ id: newUserId.id /* if newUserId is object */ || newUserId /* if newUserId is primitive */ }).first();

    if (!newUser) {
        // This should ideally not happen if insert was successful
        return res.status(500).json({ message: "Erreur lors de la création de l'utilisateur après l'insertion." });
    }

    // Generate JWT
    const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role });

    // Exclude password from user object sent to client
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'Utilisateur créé avec succès!',
      token,
      user: userWithoutPassword,
    });

  } catch (error) {
    console.error("Register error:", error);
    next(error); // Pass to global error handler
  }
};


export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: "Validation errors", errors: validationResult.error.flatten().fieldErrors });
    }
    const { email, password } = validationResult.data;

    // Find user by email
    const user = await db<User>(`${process.env.DB_SCHEMA || 'main'}.users`).where({ email }).first();
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' }); // Generic message
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' }); // Generic message
    }

    // Generate JWT
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    // Exclude password from user object sent to client
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Connexion réussie!',
      token,
      user: userWithoutPassword,
    });

  } catch (error) {
    console.error("Login error:", error);
    next(error);
  }
};

// Placeholder for other auth functions if needed (e.g., getMe, logout server-side if using blocklists)
// export const getMe = async (req: Request, res: Response, next: NextFunction) => {
//   // Assuming req.user is populated by authMiddleware
//   if (!req.user) {
//     return res.status(401).json({ message: 'Not authenticated' });
//   }
//   try {
//     const user = await db<User>('users').where({ id: req.user.id }).first();
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     const { password, ...userWithoutPassword } = user;
//     res.status(200).json(userWithoutPassword);
//   } catch (error) {
//     next(error);
//   }
// };
