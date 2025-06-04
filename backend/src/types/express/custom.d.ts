// This file extends the Express Request interface to include a user object
// that contains user information extracted from a JWT token.

declare namespace Express {
  export interface Request {
    user?: {
      userId: string;
      email: string;
      role: string;
      name?: string;
    };
  }
}