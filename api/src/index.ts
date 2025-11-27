import http from 'http';
import app from './app';
import { config, initializeConfig } from './config';
import { clearPrismaClient } from './lib/prismaClient';
// Import prisma after other imports to ensure config is loaded first
// We'll recreate it after clearing cache
let prisma: typeof import('./lib/prismaClient').default;

async function bootstrap() {
  try {
    // Initialize config first (loads environment variables from .env.local)
    await initializeConfig();

    // Clear any cached Prisma client to force recreation with updated config
    clearPrismaClient();

    // Log the actual DATABASE_URL being used
    const databaseUrl = process.env.DATABASE_URL || config.databaseUrl || '';
    if (databaseUrl) {
      const masked = databaseUrl.replace(/:\/\/([^:]+):[^@]+@/, '://$1:***@');
      console.log(`[Config] Database URL (masked): ${masked}`);
      const hostInfo = databaseUrl.includes('34.29.108.164') 
        ? 'Direct connection (34.29.108.164)' 
        : databaseUrl.includes('127.0.0.1:5433') 
        ? 'Proxy (127.0.0.1:5433) - WARNING: Proxy may not be working!' 
        : 'Unknown';
      console.log(`[Config] Database host: ${hostInfo}`);
    } else {
      console.error('[Config] ERROR: No DATABASE_URL found!');
    }

    // Re-import prisma module to get fresh client after cache clear
    // Delete from require cache to force re-evaluation
    const prismaModulePath = require.resolve('./lib/prismaClient');
    delete require.cache[prismaModulePath];
    const prismaModule = await import('./lib/prismaClient');
    prisma = prismaModule.default;
    
    // Quick ping to surface connection issues early in logs
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('[Database] Connection: OK');
    } catch (dbErr) {
      console.error('[Database] Connection failed:', (dbErr as Error)?.message || dbErr);
      const attemptedUrl = databaseUrl || 'NOT SET';
      const maskedUrl = attemptedUrl.replace(/:\/\/([^:]+):[^@]+@/, '://$1:***@');
      console.error('[Database] Attempted URL:', maskedUrl);
    }

    const server = http.createServer(app);
    const port = config.port;

    server.listen(port, () => {
      console.log(`Destockify API listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

bootstrap();

