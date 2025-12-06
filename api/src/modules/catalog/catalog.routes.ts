import { Router } from 'express';
import {
  listCategories,
  listRegions,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getRegionById,
  createRegion,
  updateRegion,
  deleteRegion,
  getCategoryPages,
  getCategoryPageBySlug,
} from './catalog.service';
import { authenticateToken, AuthRequest } from '../../middleware/authMiddleware';
import { isAdmin } from '../../middleware/adminMiddleware';

const router = Router();

// Public routes
router.get('/categories', async (_req, res) => {
  try {
    const categories = await listCategories();
    res.json(categories);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to load categories' });
  }
});

router.get('/regions', async (_req, res) => {
  try {
    const regions = await listRegions();
    res.json(regions);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to load regions' });
  }
});

// Public CategoryPage routes
router.get('/category-pages', async (req, res) => {
  try {
    const topicCategory = typeof req.query.topicCategory === 'string' ? req.query.topicCategory : undefined;
    const pages = await getCategoryPages(topicCategory);
    res.json(pages);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to load category pages' });
  }
});

router.get('/category-pages/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    console.log(`[API] GET /category-pages/${slug}`);
    const page = await getCategoryPageBySlug(slug);
    res.json(page);
  } catch (error: any) {
    const statusCode = error.message?.includes('not found') ? 404 : 400;
    console.error(`[API] Error loading category page:`, error.message);
    res.status(statusCode).json({ 
      message: error.message ?? 'Unable to load category page',
      slug: req.params.slug 
    });
  }
});

// Admin routes for Categories
router.get('/categories/:id', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const category = await getCategoryById(Number(req.params.id));
    res.json(category);
  } catch (error: any) {
    const statusCode = error.message?.includes('not found') ? 404 : 400;
    res.status(statusCode).json({ message: error.message ?? 'Unable to fetch category' });
  }
});

router.post('/categories', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const category = await createCategory(req.body);
    res.status(201).json(category);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to create category' });
  }
});

router.put('/categories/:id', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const category = await updateCategory(Number(req.params.id), req.body);
    res.json(category);
  } catch (error: any) {
    const statusCode = error.message?.includes('not found') ? 404 : 400;
    res.status(statusCode).json({ message: error.message ?? 'Unable to update category' });
  }
});

router.delete('/categories/:id', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    await deleteCategory(Number(req.params.id));
    res.status(204).send();
  } catch (error: any) {
    const statusCode = error.message?.includes('not found') ? 404 : 400;
    res.status(statusCode).json({ message: error.message ?? 'Unable to delete category' });
  }
});

// Admin routes for Regions
router.get('/regions/:id', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const region = await getRegionById(Number(req.params.id));
    res.json(region);
  } catch (error: any) {
    const statusCode = error.message?.includes('not found') ? 404 : 400;
    res.status(statusCode).json({ message: error.message ?? 'Unable to fetch region' });
  }
});

router.post('/regions', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const region = await createRegion(req.body);
    res.status(201).json(region);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to create region' });
  }
});

router.put('/regions/:id', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const region = await updateRegion(Number(req.params.id), req.body);
    res.json(region);
  } catch (error: any) {
    const statusCode = error.message?.includes('not found') ? 404 : 400;
    res.status(statusCode).json({ message: error.message ?? 'Unable to update region' });
  }
});

router.delete('/regions/:id', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    await deleteRegion(Number(req.params.id));
    res.status(204).send();
  } catch (error: any) {
    const statusCode = error.message?.includes('not found') ? 404 : 400;
    res.status(statusCode).json({ message: error.message ?? 'Unable to delete region' });
  }
});

export default router;

