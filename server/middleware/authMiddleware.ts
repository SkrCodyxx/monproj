// Placeholder for Authentication Middleware (Express)
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken'; // Assuming JWT library like 'jsonwebtoken'

// This is a very basic placeholder. Real implementation will involve:
// - Getting token from headers (Authorization Bearer token)
// - Verifying token using JWT_SECRET
// - Finding user in DB based on token payload (e.g., user ID)
// - Attaching user to request object (e.g., req.user)
// - Handling errors (token expired, invalid token, user not found)

interface UserPayload {
  id: string;
  role: string; // Or more specific roles array
  // other properties from the JWT payload
}

// Extend Express Request type to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      // Verify token - replace 'YOUR_JWT_SECRET' with actual secret from env variables
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'YOUR_JWT_SECRET_DEV') as UserPayload;

      // In a real app, you'd fetch the user from the database here
      // For now, we'll just attach the decoded payload
      // e.g., req.user = await User.findById(decoded.id).select('-password');
      req.user = decoded; // Mocking user attachment

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found (mock)' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware for role-based authorization
export const authorize = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'User role not found, authorization denied' });
    }

    const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    const isAuthorized = userRoles.some(role => allowedRoles.includes(role));

    if (!isAuthorized) {
      return res.status(403).json({ message: `User role '${req.user.role}' is not authorized to access this route` });
    }
    next();
  };
};
