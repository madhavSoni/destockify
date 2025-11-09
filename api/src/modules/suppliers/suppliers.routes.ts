import { Router } from 'express';
import { getSupplierDetail, listFeaturedSuppliers, listSuppliers } from './suppliers.service';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { category, region, lotSize, search, cursor, limit } = req.query;

    const result = await listSuppliers({
      category: typeof category === 'string' ? category : undefined,
      region: typeof region === 'string' ? region : undefined,
      lotSize: typeof lotSize === 'string' ? lotSize : undefined,
      search: typeof search === 'string' ? search : undefined,
      cursor: cursor ? Number(cursor) : undefined,
      limit: limit ? Number(limit) : undefined,
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

