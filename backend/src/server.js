import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import apiRoutes from './routes/apiRoutes.js';
import authRoutes from './routes/authRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { createInquiry } from './controllers/inquiryController.js';
import { inquiryRateLimiter } from './middleware/rateLimitMiddleware.js';
import { dataService } from './services/dataService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Middleware
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`${req.method} ${req.originalUrl} [${res.statusCode}] - ${duration}ms`);
    }
  });
  next();
});

// API Routes
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.post('/api/feedback', inquiryRateLimiter, createInquiry);
app.use('/api/admin', adminRoutes);

// Additional root mappings for serverless environments
app.use('/inquiries', inquiryRoutes);
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);

// Serve frontend build if present
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath, {
  etag: false,
  maxAge: 0,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  }
}));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(frontendDistPath, 'index.html');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // In development mode when frontend is run via Vite dev server
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Pani Safe Backend API</title>
            <style>
              body { font-family: system-ui, sans-serif; background: #0F382A; color: #FFFFFF; padding: 40px; text-align: center; }
              .card { background: #164E3F; max-width: 600px; margin: 40px auto; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
              h1 { color: #5EEAD4; margin-bottom: 8px; }
              p { color: #E2E8F0; line-height: 1.6; }
              a { color: #2DD4BF; text-decoration: none; font-weight: bold; }
              code { background: #064E3B; padding: 3px 8px; border-radius: 4px; font-family: monospace; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Pani Safe API Engine</h1>
              <p>The backend service for <strong>IBM Z Datathon 2026</strong> is active and healthy.</p>
              <p>Explore endpoints: <a href="/api/health">/api/health</a> | <a href="/api/summary">/api/summary</a> | <a href="/api/districts">/api/districts</a></p>
              <p>Start the frontend with: <code>npm run dev</code> inside <code>/frontend</code></p>
            </div>
          </body>
        </html>
      `);
    }
  });
});

// Centralized error handling
app.use((err, req, res, next) => {
  console.error('[UNHANDLED SERVER ERROR]', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred in the Pani Safe engine.'
  });
});

// Export Express app for Vercel serverless functions and testing
export default app;

// Initialize Data Engine and start server
async function startServer() {
  try {
    dataService.init();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  PANI SAFE GROUNDWATER SCREENING PLATFORM BACKEND  `);
      console.log(`  Target Platform: LinuxONE s390x & Node.js v24    `);
      console.log(`  Server Port: http://localhost:${PORT}             `);
      console.log(`  Health Check: http://localhost:${PORT}/api/health `);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

const isMainScript = process.argv[1] && (
  process.argv[1] === fileURLToPath(import.meta.url) ||
  process.argv[1].replace(/\\/g, '/').endsWith('backend/src/server.js')
);

if (isMainScript && !process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  startServer();
}
