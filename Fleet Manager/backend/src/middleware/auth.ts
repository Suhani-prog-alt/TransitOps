import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'transitops-jwt-secret-key-12345';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    region: string;
  };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Format: Bearer <token>

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Forbidden: Invalid token' });
      }
      req.user = user as AuthRequest['user'];
      next();
    });
  } else {
    res.status(401).json({ message: 'Unauthorized: Missing token' });
  }
};
