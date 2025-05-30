import { Request, Response } from 'express';

export const loginUser = async (req: Request, res: Response) => {
  const { email, role } = req.body;
  // Normally you'd verify password and use Cognito
  const token = Buffer.from(`${email}:${role}`).toString('base64');
  res.json({ token });
};