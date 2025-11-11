import { Router } from 'express';
import { listFaq } from './faq.service';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const audience = typeof req.query.audience === 'string' ? req.query.audience : undefined;
    const faqs = await listFaq(audience);
    res.json(faqs);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to load FAQs' });
  }
});

export default router;

