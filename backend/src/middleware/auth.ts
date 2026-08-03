import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { Admin } from '../models/Admin';

export interface AuthRequest extends Request {
  admin?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.access_token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const decoded = verifyToken(token);
    
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      res.status(401).json({ message: 'Admin not found' });
      return;
    }

    req.admin = {
      id: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};