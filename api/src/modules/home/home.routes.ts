import { Router } from 'express';
import { getHomepageContent } from './home.service';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const payload = await getHomepageContent();
    res.json(payload);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to load homepage content' });
  }
});

export default router;

