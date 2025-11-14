import { Router } from 'express';
import { getDashboardStats } from './admin.service';
import { authenticateToken, AuthRequest } from '../../middleware/authMiddleware';
import { isAdmin } from '../../middleware/adminMiddleware';

const router = Router();

// Get dashboard stats (admin only)
router.get('/dashboard', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message ?? 'Unable to fetch dashboard stats' });
  }
});

export default router;

