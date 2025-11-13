import { PrismaClient } from '@prisma/client';
import { log } from '../common/logger';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Test database connection
export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    log.info('✅ Database connected successfully');
  } catch (error) {
    log.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Disconnect database
export const disconnectDatabase = async () => {
  await prisma.$disconnect();
  log.info('Database disconnected');
};

export default prisma;
