import { PrismaClient } from '@prisma/client';

// Sanitize process.env.DATABASE_URL in case quotes or extra spaces were pasted in Vercel UI
if (process.env.DATABASE_URL) {
  let cleanUrl = process.env.DATABASE_URL.trim();
  if (cleanUrl.startsWith('"') && cleanUrl.endsWith('"')) {
    cleanUrl = cleanUrl.slice(1, -1).trim();
  }
  if (cleanUrl.startsWith("'") && cleanUrl.endsWith("'")) {
    cleanUrl = cleanUrl.slice(1, -1).trim();
  }
  // Ensure it starts with postgresql:// or postgres://
  if (cleanUrl.startsWith('postgresql://') || cleanUrl.startsWith('postgres://')) {
    process.env.DATABASE_URL = cleanUrl;
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
