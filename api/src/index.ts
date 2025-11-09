import http from 'http';
import app from './app';
import { config, initializeConfig } from './config';
import prisma from './lib/prismaClient';

async function bootstrap() {
  try {
    await initializeConfig();

    // Minimal masked log to verify effective DB URL shape
    try {
      const masked = (config.databaseUrl || '').replace(/:\/\/([^:]+):[^@]+@/, '://$1:***@');
      console.log(`Database URL (masked): ${masked}`);
    } catch {}

    // Quick ping to surface connection issues early in logs
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('Database connection: OK');
    } catch (dbErr) {
      console.error('Database connection failed:', (dbErr as Error)?.message || dbErr);
    }

    const server = http.createServer(app);
    const port = config.port;

    server.listen(port, () => {
      console.log(`Muse API listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

bootstrap();

