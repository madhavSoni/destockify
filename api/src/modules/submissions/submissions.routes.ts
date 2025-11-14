import { Router } from 'express';
import {
  createSubmission,
  getCustomerSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
  getAllSubmissions,
  approveSubmission,
  rejectSubmission,
  deleteSubmissionAdmin,
} from './submissions.service';
import { authenticateToken, AuthRequest } from '../../middleware/authMiddleware';
import { isAdmin } from '../../middleware/adminMiddleware';

const router = Router();

// ========== CUSTOMER ROUTES ==========

// Create new submission
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const customerId = req.user!.customerId;
    const submission = await createSubmission(customerId, req.body);
    res.status(201).json(submission);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to create submission' });
  }
});

// Get my submissions
router.get('/my-submissions', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const customerId = req.user!.customerId;
    const submissions = await getCustomerSubmissions(customerId);
    res.json(submissions);
  } catch (error: any) {
    res.status(500).json({ message: error.message ?? 'Unable to fetch submissions' });
  }
});

// Get single submission
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const customerId = req.user!.customerId;
    const submissionId = parseInt(req.params.id);
    const submission = await getSubmissionById(submissionId, customerId);
    res.json(submission);
  } catch (error: any) {
    res.status(404).json({ message: error.message ?? 'Submission not found' });
  }
});

// Update submission
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const customerId = req.user!.customerId;
    const submissionId = parseInt(req.params.id);
    const updated = await updateSubmission(submissionId, customerId, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to update submission' });
  }
});

// Delete submission
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const customerId = req.user!.customerId;
    const submissionId = parseInt(req.params.id);
    const result = await deleteSubmission(submissionId, customerId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to delete submission' });
  }
});

// ========== ADMIN ROUTES ==========

// Get all submissions (admin)
router.get('/admin/all', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const status = req.query.status as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const result = await getAllSubmissions(status, page, limit);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message ?? 'Unable to fetch submissions' });
  }
});

// Approve submission (admin)
router.post('/:id/approve', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const submissionId = parseInt(req.params.id);
    const { adminNotes } = req.body;
    const result = await approveSubmission(submissionId, adminNotes);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to approve submission' });
  }
});

// Reject submission (admin)
router.post('/:id/reject', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const submissionId = parseInt(req.params.id);
    const { adminNotes } = req.body;
    
    if (!adminNotes) {
      return res.status(400).json({ message: 'Admin notes are required for rejection' });
    }
    
    const result = await rejectSubmission(submissionId, adminNotes);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to reject submission' });
  }
});

// Delete submission (admin)
router.delete('/:id/admin', authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const submissionId = parseInt(req.params.id);
    const result = await deleteSubmissionAdmin(submissionId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to delete submission' });
  }
});

export default router;
