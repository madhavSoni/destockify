import { Router } from 'express';
import suppliersRoutes from './suppliers/suppliers.routes';
import catalogRoutes from './catalog/catalog.routes';
import guidesRoutes from './guides/guides.routes';
import faqRoutes from './faq/faq.routes';
import homeRoutes from './home/home.routes';
import authRoutes from './auth/auth.routes';
import reviewsRoutes from './reviews/reviews.routes';

const router = Router();

router.use('/suppliers', suppliersRoutes);
router.use('/catalog', catalogRoutes);
router.use('/guides', guidesRoutes);
router.use('/faq', faqRoutes);
router.use('/home', homeRoutes);
router.use('/auth', authRoutes);
router.use('/reviews', reviewsRoutes);

router.get('/ping', (_req, res) => {
  res.json({ message: 'pong' });
});

export default router;

