import { Router } from 'express';
import { listCategories, listLotSizes, listRegions } from './catalog.service';

const router = Router();

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

router.get('/lot-sizes', async (_req, res) => {
  try {
    const lotSizes = await listLotSizes();
    res.json(lotSizes);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to load lot sizes' });
  }
});

export default router;

