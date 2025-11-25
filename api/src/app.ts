import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import router from './modules';

const app = express();

app.set('trust proxy', 1);

// CORS configuration with explicit headers and better error handling
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (same-origin requests, mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Allow all origins if wildcard configured
    if (config.cors.origins.includes('*')) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (config.cors.origins.includes(origin)) {
      return callback(null, true);
    }

    // Log CORS rejection for debugging (only in development)
    if (config.env === 'development') {
      console.warn(`CORS: Origin "${origin}" not allowed. Allowed origins:`, config.cors.origins);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Skip rate limiting for health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    env: config.env,
    timestamp: new Date().toISOString(),
  });
});

// Rate limiting with skip for health endpoint
app.use(rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  skip: (req) => req.path === '/health',
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use('/api', router);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

export default app;

