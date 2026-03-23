import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

interface JwtPayload {
  userId: string;
  githubId: number;
}

export interface AuthenticatedRequest extends Request {
  user?: Express.User;
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        githubId: true,
        username: true,
        displayName: true,
        avatarUrl: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        githubId: true,
        username: true,
        displayName: true,
        avatarUrl: true
      }
    });

    if (user) {
      req.user = user;
    }
  } catch (error) {
    // Invalid token, but continue without auth
  }

  next();
};
