/**
 * Lightweight sliding window IP rate limiter for public forms.
 * Prevents spam flooding without requiring external Redis or paid services.
 */
const rateLimitMap = new Map();

// Clean up stale IP records every 10 minutes to prevent memory leaks
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now - data.resetTime > 0) {
      rateLimitMap.delete(ip);
    }
  }
}, 10 * 60 * 1000);
if (cleanupTimer.unref) cleanupTimer.unref();

export function createRateLimiter({ windowMs = 10 * 60 * 1000, maxRequests = 5, message = 'Too many requests' }) {
  return (req, res, next) => {
    // Bypass rate limiting during automated test runs
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    // Determine client IP across proxies and serverless hosts
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                     req.headers['x-real-ip'] ||
                     req.socket?.remoteAddress ||
                     'unknown-ip';

    const now = Date.now();
    const clientData = rateLimitMap.get(clientIp);

    if (!clientData || now > clientData.resetTime) {
      rateLimitMap.set(clientIp, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    if (clientData.count >= maxRequests) {
      const waitMinutes = Math.ceil((clientData.resetTime - now) / (60 * 1000));
      return res.status(429).json({
        success: false,
        error: 'Too Many Requests',
        message: `${message}. Please wait ${waitMinutes} minute(s) before submitting again.`
      });
    }

    clientData.count += 1;
    next();
  };
}

export const inquiryRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxRequests: 5,
  message: 'Inquiry rate limit exceeded'
});

export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
  message: 'Too many login attempts'
});
