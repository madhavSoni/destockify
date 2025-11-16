import { Router } from 'express';
import {
  createReview,
  updateReview,
  deleteReview,
  getMyReviews,
  approveReview,
  unapproveReview,
  adminDeleteReview,
  getAllReviewsAdmin,
  getReviewsBySupplierAdmin,
  adminUpdateReview,
  adminCreateReview,
} from './reviews.service';
import { authenticateToken, AuthRequest } from '../../middleware/authMiddleware';
import { isAdmin } from '../../middleware/adminMiddleware';

const router = Router();

// ========================================
// CUSTOMER ROUTES (Authenticated)
// ========================================

// Create a new review (requires verified account)
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const customerId = req.user!.customerId;
    const payload = {
      customerId,
      ...req.body,
    };

    const result = await createReview(payload);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to create review' });
  }
});

// Get all reviews by the authenticated customer
router.get('/my-reviews', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const customerId = req.user!.customerId;
    const reviews = await getMyReviews(customerId);
    res.json(reviews);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to fetch reviews' });
  }
});

// Update customer's own review
router.put('/:reviewId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const customerId = req.user!.customerId;
    const reviewId = parseInt(req.params.reviewId);

    if (isNaN(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }

    const payload = {
      reviewId,
      customerId,
      ...req.body,
    };

    const result = await updateReview(payload);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to update review' });
  }
});

// Delete customer's own review
router.delete('/:reviewId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const customerId = req.user!.customerId;
    const reviewId = parseInt(req.params.reviewId);

    if (isNaN(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }

    const result = await deleteReview({ reviewId, customerId });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to delete review' });
  }
});

// ========================================
// ADMIN ROUTES
// ========================================

// Get all reviews (admin only)
router.get('/admin/all', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const status = req.query.status as 'approved' | 'pending' | 'rejected' | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await getAllReviewsAdmin({ status, page, limit });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to fetch reviews' });
  }
});

// Approve a review (admin only)
router.post('/:reviewId/approve', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);

    if (isNaN(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }

    const result = await approveReview(reviewId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to approve review' });
  }
});

// Unapprove a review (admin only)
router.post('/:reviewId/unapprove', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);

    if (isNaN(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }

    const payload = {
      reviewId,
      moderationNotes: req.body.moderationNotes,
    };

    const result = await unapproveReview(payload);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to unapprove review' });
  }
});

// Delete any review permanently (admin only)
router.delete('/:reviewId/admin', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);

    if (isNaN(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }

    const result = await adminDeleteReview(reviewId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to delete review' });
  }
});

// Get reviews by supplier ID (admin only)
router.get('/admin/supplier/:supplierId', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const supplierId = parseInt(req.params.supplierId);

    if (isNaN(supplierId)) {
      return res.status(400).json({ message: 'Invalid supplier ID' });
    }

    const reviews = await getReviewsBySupplierAdmin(supplierId);
    res.json(reviews);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to fetch reviews' });
  }
});

// Admin: Update any review
router.put('/admin/:reviewId', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);

    if (isNaN(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }

    const result = await adminUpdateReview({
      reviewId,
      ...req.body,
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to update review' });
  }
});

// Admin: Create review
router.post('/admin', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const result = await adminCreateReview(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to create review' });
  }
});

export default router;
