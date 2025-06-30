import jwt from 'jsonwebtoken';
import { User } from '../../src/types'; // Assuming User type is available

// IMPORTANT: In a real application, this secret MUST come from environment variables
// and should be a long, complex, random string.
// For sandbox purposes, using a placeholder.
const JWT_SECRET = process.env.JWT_SECRET || 'DEV_JWT_SECRET_REPLACE_THIS_IN_PROD';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  // You can add other non-sensitive info if needed
}

/**
 * Generates a JWT for a given user.
 * @param user - The user object (or relevant parts like id, email, role).
 * @returns The generated JWT string.
 */
export const generateToken = (user: Pick<User, 'id' | 'email' | 'role'>): string => {
  const payload: JwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  if (!JWT_SECRET) {
    // This should ideally halt the application or log a critical error
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    throw new Error('JWT_SECRET is not configured, cannot generate token.');
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Verifies a JWT.
 * This is more for middleware, but good to have a central place.
 * @param token - The JWT string to verify.
 * @returns The decoded payload if the token is valid.
 * @throws Error if the token is invalid or expired.
 */
export const verifyToken = (token: string): JwtPayload => {
  if (!JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    throw new Error('JWT_SECRET is not configured, cannot verify token.');
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error('JWT Verification Error:', error);
    throw error; // Re-throw to be handled by caller (e.g., auth middleware)
  }
};
