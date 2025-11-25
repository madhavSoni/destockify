import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import router from './modules';

const app = express();

app.set('trust proxy', 1);

// CORS configuration adopting Cloud Run URL pattern matching (like muse)
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // Allow all origins if wildcard configured; reflect the origin when credentials are used
    if (config.cors.origins.includes('*')) {
      return callback(null, true);
    }

    // Exact match allowed origins
    if (config.cors.origins.includes(origin)) {
      return callback(null, true);
    }

    // Try hostname-based matching to handle Cloud Run URL variations
    try {
      const originUrl = new URL(origin);
      const originHost = originUrl.hostname;
      const originProtocol = originUrl.protocol;

      // If any allowed origin contains a Cloud Run host, allow other .run.app origins
      const hasRunApp = config.cors.origins.some(url => {
        try {
          return new URL(url).hostname.includes('.run.app');
        } catch {
          return false;
        }
      });

      if (hasRunApp && originHost.includes('.run.app')) {
        return callback(null, true);
      }

      for (const allowedUrl of config.cors.origins) {
        try {
          const allowedUrlObj = new URL(allowedUrl);
          const allowedHost = allowedUrlObj.hostname;
          const allowedProtocol = allowedUrlObj.protocol;

          // Match if hostnames are the same (exact match + protocol)
          if (originHost === allowedHost && originProtocol === allowedProtocol) {
            return callback(null, true);
          }

          // Match if hostnames are the same regardless of protocol (http/https)
          if (originHost === allowedHost) {
            return callback(null, true);
          }

          // Match if one hostname contains the other (subdomain variations)
          if (originHost.includes(allowedHost) || allowedHost.includes(originHost)) {
            return callback(null, true);
          }
        } catch {
          // Skip invalid allowedUrl entries
          continue;
        }
      }
    } catch {
      // If origin isn't a valid URL, reject
      return callback(new Error('Invalid origin URL'));
    }

    // Log rejected origin for debugging (development only)
    if (config.env === 'development') {
      console.warn(`CORS: Origin "${origin}" not allowed. Allowed origins:`, config.cors.origins);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
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

