import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const NODE_ENV = process.env.NODE_ENV || 'development';

// Load environment files based on environment
// In production: try .env.prod first, then .env.production (for backward compatibility)
// In development: load .env first (base), then .env.local (overrides .env values)
if (NODE_ENV === 'production') {
  const envProdPath = path.join(process.cwd(), '.env.prod');
  const envProductionPath = path.join(process.cwd(), '.env.production');
  
  // Try .env.prod first
  if (fs.existsSync(envProdPath)) {
    dotenv.config({ path: envProdPath });
  } else if (fs.existsSync(envProductionPath)) {
    // Fallback to .env.production for backward compatibility
    dotenv.config({ path: envProductionPath });
  }
} else {
  // Development: load .env first (base defaults), then .env.local (local overrides)
  // Standard pattern: .env.local overrides .env values
  const envPath = path.join(process.cwd(), '.env');
  const envLocalPath = path.join(process.cwd(), '.env.local');
  
  // Load base .env first if it exists
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
  
  // Load .env.local with override so it can override .env values
  // This is the standard pattern for local development
  if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath, override: true });
  }
}

let secretsCache: Record<string, string> = {};

async function fetchSecret(secretName: string): Promise<string> {
  if (secretsCache[secretName]) {
    return secretsCache[secretName];
  }

  if (NODE_ENV !== 'production') {
    const value = process.env[secretName];
    if (!value) {
      throw new Error(`Missing environment variable ${secretName}`);
    }
    secretsCache[secretName] = value;
    return value;
  }

  const client = new SecretManagerServiceClient();
  const projectId = process.env.GCS_PROJECT_ID;

  if (!projectId) {
    throw new Error('GCS_PROJECT_ID is required in production');
  }

  const secretPath = `projects/${projectId}/secrets/${secretName}/versions/latest`;
  const [version] = await client.accessSecretVersion({ name: secretPath });
  const payload = version.payload?.data?.toString();

  if (!payload) {
    throw new Error(`Secret ${secretName} has no payload`);
  }

  secretsCache[secretName] = payload;
  return payload;
}

export interface AppConfig {
  env: string;
  port: number;
  databaseUrl: string;
  jwt: {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  gcs: {
    bucketName: string;
    projectId: string | undefined;
    credentialsPath?: string;
  };
  email: {
    from: string;
    user?: string;
    password?: string;
  };
  cors: {
    origins: string[];
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}

export const config: AppConfig = {
  env: NODE_ENV,
  port: Number(process.env.PORT || 8080),
  databaseUrl: process.env.DATABASE_URL || '',
  jwt: {
    secret: process.env.JWT_SECRET || 'replace-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'replace-me-refresh',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  gcs: {
    bucketName: process.env.GCS_BUCKET_NAME || 'muse-media',
    projectId: process.env.GCS_PROJECT_ID,
    credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  },
  email: {
    from: process.env.EMAIL_FROM || 'Muse <noreply@muse.app>',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
  },
  cors: {
    // Default allowlist includes localhost and the deployed frontend; can be overridden via CORS_ORIGINS
    origins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',')
      : ['http://localhost:3000', 'https://muse-frontend-881749700707.us-central1.run.app'],
  },
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 200),
  },
};

export async function initializeConfig(): Promise<void> {
  if (!config.databaseUrl) {
    config.databaseUrl = await fetchSecret('DATABASE_URL');
  }

  if (config.jwt.secret === 'replace-me') {
    config.jwt.secret = await fetchSecret('JWT_SECRET');
  }

  if (config.jwt.refreshSecret === 'replace-me-refresh') {
    config.jwt.refreshSecret = await fetchSecret('JWT_REFRESH_SECRET');
  }
}

