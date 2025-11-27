import { PrismaClient } from '@prisma/client';
import { config } from '../config';

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

export function createPrismaClient(): PrismaClient {
  // Always check process.env.DATABASE_URL first, then config.databaseUrl
  // This ensures we get the latest value even if config hasn't been updated yet
  const databaseUrl = process.env.DATABASE_URL || config.databaseUrl || '';
  
  const originalUrl = databaseUrl;
  const normalizedUrl =
    originalUrl && originalUrl.includes('host=/cloudsql/') && originalUrl.includes('@/')
      ? originalUrl.replace('@/', '@localhost/')
      : originalUrl;

  // Log the connection URL (masked for security)
  if (normalizedUrl) {
    const masked = normalizedUrl.replace(/:\/\/([^:]+):[^@]+@/, '://$1:***@');
    console.log(`[Prisma] Creating client with database URL: ${masked}`);
  } else {
    console.warn('[Prisma] WARNING: No DATABASE_URL found in config or environment!');
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: normalizedUrl,
      },
    },
  });
}

/**
 * Clear the cached Prisma client to force recreation with new connection string
 */
export function clearPrismaClient(): void {
  if (global.__prismaClient) {
    console.log('[Prisma] Disconnecting and clearing cached client...');
    global.__prismaClient.$disconnect().catch(() => {
      // Ignore disconnect errors
    });
    global.__prismaClient = undefined;
  }
}

// Create or get cached client
// Always check process.env.DATABASE_URL directly to ensure we get the latest value
function getPrismaClient(): PrismaClient {
  // Always use process.env.DATABASE_URL directly to get the most current value
  // This ensures we get the value from .env.local even if config hasn't been updated
  const currentUrl = process.env.DATABASE_URL || config.databaseUrl || '';
  
  // If we have a cached client, check if we should keep using it
  if (global.__prismaClient) {
    // If URL points to broken proxy, always clear and recreate
    if (currentUrl.includes('127.0.0.1:5433')) {
      console.log('[Prisma] Detected proxy URL (127.0.0.1:5433), clearing cache to use direct connection...');
      clearPrismaClient();
    } else if (currentUrl && !currentUrl.includes('127.0.0.1:5433')) {
      // URL is valid and not the broken proxy, we can keep using cached client
      return global.__prismaClient;
    }
  }
  
  // Create new client with current URL
  const client = createPrismaClient();
  
  if (process.env.NODE_ENV !== 'production') {
    global.__prismaClient = client;
  }
  
  return client;
}

// Create initial client
// Note: This may be created before .env.local is loaded, but getPrismaClient()
// always checks process.env.DATABASE_URL directly, so after config initialization
// and cache clearing, a new client will be created with the correct URL
const prisma = getPrismaClient();

export default prisma;

