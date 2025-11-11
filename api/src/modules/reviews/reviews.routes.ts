import { Router } from 'express';
import {
  createReview,
  updateReview,
  deleteReview,
  getMyReviews,
  approveReview,
  unapproveReview,
  adminDeleteReview,
} from './reviews.service';
import { authenticateToken, AuthRequest } from '../../middleware/authMiddleware';

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
// ADMIN ROUTES (TODO: Add admin middleware)
// ========================================
// Note: In production, add an isAdmin middleware to protect these routes

// Approve a review (admin only)
router.post('/:reviewId/approve', async (req, res) => {
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
router.post('/:reviewId/unapprove', async (req, res) => {
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
router.delete('/:reviewId/admin', async (req, res) => {
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

export default router;
