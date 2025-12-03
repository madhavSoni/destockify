import { Router } from 'express';
import { getDashboardStats, uploadImage, listCategoryPages, getCategoryPage, createCategoryPage, updateCategoryPage, deleteCategoryPage } from './admin.service';
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

// Category Pages routes (admin only)
router.get('/category-pages', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
    const result = await listCategoryPages({ limit, offset });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message ?? 'Unable to fetch category pages' });
  }
});

router.get('/category-pages/:id', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const page = await getCategoryPage(Number(req.params.id));
    res.json(page);
  } catch (error: any) {
    const statusCode = error.message?.includes('not found') ? 404 : 400;
    res.status(statusCode).json({ message: error.message ?? 'Unable to fetch category page' });
  }
});

router.post('/category-pages', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const page = await createCategoryPage(req.body);
    res.status(201).json(page);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to create category page' });
  }
});

router.put('/category-pages/:id', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const page = await updateCategoryPage(Number(req.params.id), req.body);
    res.json(page);
  } catch (error: any) {
    const statusCode = error.message?.includes('not found') ? 404 : 400;
    res.status(statusCode).json({ message: error.message ?? 'Unable to update category page' });
  }
});

router.delete('/category-pages/:id', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    await deleteCategoryPage(Number(req.params.id));
    res.status(204).send();
  } catch (error: any) {
    const statusCode = error.message?.includes('not found') ? 404 : 400;
    res.status(statusCode).json({ message: error.message ?? 'Unable to delete category page' });
  }
});

export default router;

