import { Router } from 'express';
import {
  getSupplierDetail,
  listFeaturedSuppliers,
  listSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getAllSuppliersAdmin,
  getSupplierByIdAdmin,
} from './suppliers.service';
import { authenticateToken, AuthRequest } from '../../middleware/authMiddleware';
import { isAdmin } from '../../middleware/adminMiddleware';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { category, region, search, cursor, limit, verified } = req.query;

    const result = await listSuppliers({
      category: typeof category === 'string' ? category : undefined,
      region: typeof region === 'string' ? region : undefined,
      search: typeof search === 'string' ? search : undefined,
      cursor: cursor ? Number(cursor) : undefined,
      limit: limit ? Number(limit) : undefined,
      verified: verified === 'true' ? true : verified === 'false' ? false : undefined,
    });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to fetch suppliers' });
  }
});

router.get('/featured', async (_req, res) => {
  try {
    const suppliers = await listFeaturedSuppliers();
    res.json(suppliers);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to fetch featured suppliers' });
  }
});

// ========================================
// ADMIN ROUTES (must come before /:slug to avoid route conflicts)
// ========================================

// Get all suppliers (admin only) - MUST come before /admin/:id to avoid route conflicts
router.get('/admin/all', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const search = req.query.search as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await getAllSuppliersAdmin({ search, page, limit });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to fetch suppliers' });
  }
});

// Get supplier by ID (admin only)
router.get('/admin/:id', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const supplierId = parseInt(req.params.id);
    if (isNaN(supplierId)) {
      return res.status(400).json({ message: 'Invalid supplier ID' });
    }

    const supplier = await getSupplierByIdAdmin(supplierId);
    res.json(supplier);
  } catch (error: any) {
    res.status(404).json({ message: error.message ?? 'Supplier not found' });
  }
});

// Create a new supplier (admin only)
router.post('/', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const supplier = await createSupplier(req.body);
    res.status(201).json(supplier);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to create supplier' });
  }
});

// Update a supplier (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const supplierId = parseInt(req.params.id);
    if (isNaN(supplierId)) {
      return res.status(400).json({ message: 'Invalid supplier ID' });
    }

    const supplier = await updateSupplier(supplierId, req.body);
    res.json(supplier);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to update supplier' });
  }
});

// Delete a supplier (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const supplierId = parseInt(req.params.id);
    if (isNaN(supplierId)) {
      return res.status(400).json({ message: 'Invalid supplier ID' });
    }

    const result = await deleteSupplier(supplierId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to delete supplier' });
  }
});

// ========================================
// PUBLIC ROUTES
// ========================================

// Get supplier by slug (must come after admin routes)
router.get('/:slug', async (req, res) => {
  try {
    const detail = await getSupplierDetail(req.params.slug);
    if (!detail) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.json(detail);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to fetch supplier' });
  }
});

export default router;

