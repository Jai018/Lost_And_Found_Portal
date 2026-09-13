import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : undefined);

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. Please sign in.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'findit-secret-key') as { id: string };
    const user    = await User.findById(decoded.id).select('+password');

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or account deactivated.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : undefined);

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'findit-secret-key') as { id: string };
      const user    = await User.findById(decoded.id);
      if (user?.isActive) req.user = user;
    }
  } catch { /* ignore */ }
  next();
};

export const requireRole = (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access forbidden. Insufficient permissions.' });
    }
    next();
  };

export const generateToken = (userId: string): string =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET || 'findit-secret-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  } as jwt.SignOptions);
