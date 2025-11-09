import { PrismaClient } from '@prisma/client';
import { config } from '../config';

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

export function createPrismaClient(): PrismaClient {
  const originalUrl = config.databaseUrl;
  const normalizedUrl =
    originalUrl && originalUrl.includes('host=/cloudsql/') && originalUrl.includes('@/')
      ? originalUrl.replace('@/', '@localhost/')
      : originalUrl;

  return new PrismaClient({
    datasources: {
      db: {
        url: normalizedUrl,
      },
    },
  });
}

const prisma = global.__prismaClient ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__prismaClient = prisma;
}

export default prisma;

