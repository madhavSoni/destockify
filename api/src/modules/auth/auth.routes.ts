import { Router } from 'express';
import { signUp, login, verifyEmail, forgotPassword, resetPassword } from './auth.service';
import { authenticateToken, AuthRequest } from '../../middleware/authMiddleware';
import prisma from '../../lib/prismaClient';
import * as emailService from '../../lib/emailService';

const router = Router();

router.post('/signup', async (req, res) => {
  try {
    const payload = req.body;
    const result = await signUp(payload);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to sign up' });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await login({ email, password });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to login' });
  }
});


router.get('/verify-email', async (req, res) => {
  try {
    const token = String(req.query.token ?? '');
    const result = await verifyEmail({ token });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to verify email' });
  }
});


router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await forgotPassword({ email });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to process forgot password' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const result = await resetPassword({ token, newPassword });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? 'Unable to reset password' });
  }
});

// ✅ Protected route - Get current user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const customerId = req.user!.customerId;
    
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error: any) {
    res.status(500).json({ message: error.message ?? 'Unable to fetch profile' });
  }
});

router.get('/test-email', async (req, res) => {
  try {
    const testEmail = req.query.email as string;
    
    if (!testEmail) {
      return res.status(400).json({ message: 'Please provide an email query parameter: ?email=your@email.com' });
    }

    const isReady = await emailService.testEmailConnection();
    
    if (!isReady) {
      return res.status(500).json({ 
        message: 'Email service not configured. Please check SMTP settings in .env file.' 
      });
    }

    await emailService.sendVerificationEmail(testEmail, 'test-token-123456');
    
    res.json({ 
      message: `Test verification email sent to ${testEmail}. Check your inbox!`,
      note: 'In development, the verification token is: test-token-123456'
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to send test email',
      error: error.message 
    });
  }
});

export default router;
