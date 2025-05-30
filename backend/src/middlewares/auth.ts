import { Request, Response, NextFunction } from 'express';

export const verifyUser = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send('No token provided');

  const token = authHeader.split(' ')[1];
  const decoded = Buffer.from(token, 'base64').toString('ascii');
  const [email, role] = decoded.split(':');

  req.user = { email, role };
  next();
};