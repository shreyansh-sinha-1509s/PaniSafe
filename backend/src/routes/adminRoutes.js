import express from 'express';
import { loginAdmin, logoutAdmin, getAdminProfile } from '../controllers/adminAuthController.js';
import {
  listInquiries,
  getInquiryById,
  updateInquiryStatus,
  recordInquiryReply
} from '../controllers/inquiryController.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';
import { loginRateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// 1. Admin Authentication
router.post('/login', loginRateLimiter, loginAdmin);
router.post('/logout', logoutAdmin);
router.get('/me', verifyAdmin, getAdminProfile);

// 2. Protected Inquiry Operations
router.get('/inquiries', verifyAdmin, listInquiries);
router.get('/inquiries/:id', verifyAdmin, getInquiryById);
router.patch('/inquiries/:id/status', verifyAdmin, updateInquiryStatus);
router.post('/inquiries/:id/reply', verifyAdmin, recordInquiryReply);

export default router;
