import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import prisma from '../lib/prismaClient';

/**
 * Admin Middleware
 * 
 * Verifies that the authenticated user has admin privileges.
 * Must be used after authenticateToken middleware.
 */
export async function isAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.user.customerId },
      select: { isAdmin: true },
    });

    if (!customer || !customer.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return res.status(500).json({ message: 'Error verifying admin access' });
  }
}
