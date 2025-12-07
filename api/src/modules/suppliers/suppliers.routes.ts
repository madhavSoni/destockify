import { Router } from 'express';
import {
  getSupplierDetail,
  listFeaturedSuppliers,
  listSuppliers,
  getSuppliersByIds,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getAllSuppliersAdmin,
  getSupplierByIdAdmin,
  createSupplierAddress,
  updateSupplierAddress,
  deleteSupplierAddress,
} from './suppliers.service';
import { authenticateToken, AuthRequest } from '../../middleware/authMiddleware';
import { isAdmin } from '../../middleware/adminMiddleware';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { category, region, state, country, search, cursor, limit, verified, sort, isContractHolder, isBroker } = req.query;

    const result = await listSuppliers({
      category: typeof category === 'string' ? category : undefined,
      region: typeof region === 'string' ? region : undefined,
      state: typeof state === 'string' ? state : undefined,
      country: typeof country === 'string' ? country : undefined,
      search: typeof search === 'string' ? search : undefined,
      cursor: cursor ? Number(cursor) : undefined,
      limit: limit ? Number(limit) : undefined,
      verified: verified === 'true' ? true : verified === 'false' ? false : undefined,
      sort: typeof sort === 'string' ? sort : undefined,
      isContractHolder: isContractHolder === 'true' ? true : undefined,
      isBroker: isBroker === 'true' ? true : undefined,
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

// Get suppliers by IDs (public endpoint)
router.get('/by-ids', async (req, res) => {
  try {
    const { ids } = req.query;
    
    if (!ids) {
      return res.status(400).json({ message: 'ids parameter is required' });
    }

    // Parse IDs from query string (can be comma-separated or array)
    let supplierIds: number[];
    if (typeof ids === 'string') {
      supplierIds = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    } else if (Array.isArray(ids)) {
      supplierIds = ids
        .map(id => typeof id === 'string' ? parseInt(id) : typeof id === 'number' ? id : null)
        .filter((id): id is number => id !== null && !isNaN(id));
    } else {
      return res.status(400).json({ message: 'Invalid ids parameter format' });
    }

    if (supplierIds.length === 0) {
      return res.status(400).json({ message: 'No valid supplier IDs provided' });
    }

    const suppliers = await getSuppliersByIds(supplierIds);
    res.json(suppliers);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to fetch suppliers' });
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

// Address management routes (admin only)
router.post('/:id/addresses', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const supplierId = parseInt(req.params.id);
    if (isNaN(supplierId)) {
      return res.status(400).json({ message: 'Invalid supplier ID' });
    }

    const address = await createSupplierAddress(supplierId, req.body);
    res.status(201).json(address);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to create address' });
  }
});

router.put('/addresses/:addressId', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const addressId = parseInt(req.params.addressId);
    if (isNaN(addressId)) {
      return res.status(400).json({ message: 'Invalid address ID' });
    }

    const address = await updateSupplierAddress(addressId, req.body);
    res.json(address);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to update address' });
  }
});

router.delete('/addresses/:addressId', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const addressId = parseInt(req.params.addressId);
    if (isNaN(addressId)) {
      return res.status(400).json({ message: 'Invalid address ID' });
    }

    const result = await deleteSupplierAddress(addressId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to delete address' });
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

