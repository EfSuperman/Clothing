import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  const decoded = verifyToken(token) as { userId: string; role: string } | null;

  if (!decoded) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }

  req.user = decoded;
  next();
};

export const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  console.log('AUTHORIZING ADMIN:', req.user?.role);
  if (req.user?.role !== 'ADMIN') {
     console.warn('ADMIN DENIED');
     res.status(403).json({ message: 'Access denied. Admin only.' });
     return;
  }
  next();
};
