import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import router from './modules';

const app = express();

app.set('trust proxy', 1);

app.use(cors({
  origin: (origin, callback) => {
    // Allow all origins if wildcard configured; reflect the origin when credentials are used
    if (config.cors.origins.includes('*')) {
      return callback(null, origin || true);
    }

    if (!origin || config.cors.origins.includes(origin)) {
      return callback(null, origin || true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

app.use(rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
}));

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    env: config.env,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', router);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

export default app;

