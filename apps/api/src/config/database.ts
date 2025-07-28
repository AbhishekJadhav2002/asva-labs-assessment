import { logger } from '@/utils/logger';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        errorFormat: 'pretty',
        log: process.env['NODE_ENV'] === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (process.env['NODE_ENV'] !== 'production') globalForPrisma.prisma = prisma;

prisma.$on('query' as never, (e: {
    duration: number;
    params: unknown[];
    query: string;
}) => {
    logger.debug('Query: ' + e.query);
    logger.debug('Params: ' + e.params);
    logger.debug('Duration: ' + e.duration + 'ms');
});

process.on('beforeExit', () => {
    prisma.$disconnect();
});