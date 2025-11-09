import { Router } from 'express';
import { getGuide, listGuides } from './guides.service';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { featured, limit } = req.query;
    const featuredOnly = typeof featured === 'string' ? featured === 'true' : undefined;
    const guides = await listGuides({
      featuredOnly,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(guides);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to load guides' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const guide = await getGuide(req.params.slug);
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }
    res.json(guide);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to load guide' });
  }
});

export default router;

