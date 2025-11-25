import { Router } from 'express';
import { getDashboardStats, uploadImage } from './admin.service';
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

// Upload image (admin only) - accepts base64-encoded image data
// Request body: { image: "data:image/png;base64,..." } or { image: "base64string", filename?: "image.png", mimeType?: "image/png" }
router.post('/upload-image', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const { image, filename, mimeType } = req.body;
    
    if (!image) {
      return res.status(400).json({ message: 'No image data provided' });
    }

    const imageUrl = await uploadImage(image, filename, mimeType);
    res.json({ url: imageUrl });
  } catch (error: any) {
    res.status(500).json({ message: error.message ?? 'Unable to upload image' });
  }
});

export default router;

