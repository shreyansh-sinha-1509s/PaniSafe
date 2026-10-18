import express from 'express';
import { createInquiry } from '../controllers/inquiryController.js';
import { inquiryRateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// Public inquiry submission endpoint with rate limiting and honeypot spam protection
router.post('/', inquiryRateLimiter, createInquiry);

export default router;
