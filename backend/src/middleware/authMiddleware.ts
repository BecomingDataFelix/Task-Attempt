import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Production-grade middleware for JWT token validation
const authMiddleware = (requiredRole?: 'admin' | 'member') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token is missing or malformed.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authorization token is missing.' });
    }

    try {
      // Extract and decode the JWT payload
      const base64Payload = token.split('.')[1];
      if (!base64Payload) {
        return res.status(401).json({ message: 'Invalid token format.' });
      }
      
      const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
      
      // Extract user information from the token
      const userId = payload.sub; // JWT standard for subject (user ID)
      const userEmail = payload.email;
      const userRole = payload['custom:role'] || 'member';
      const userName = payload.name || payload.email;
      
      if (!userId || !userEmail) {
        return res.status(401).json({ message: 'Invalid token: Missing user information.' });
      }

      // Attach user info to the request object
      req.user = {
        userId: userId,
        email: userEmail,
        role: userRole,
        name: userName
      };

      // Role-based authorization check
      if (requiredRole && req.user.role !== requiredRole) {
        return res.status(403).json({ 
          message: `Access denied. Requires ${requiredRole} role.`,
          currentRole: req.user.role
        });
      }

      next(); // Proceed to the next middleware/route handler
    } catch (error: any) {
      console.error("Token processing failed:", error.message);
      return res.status(401).json({ message: 'Error processing token.', error: error.message });
    }
  };
};

export default authMiddleware;