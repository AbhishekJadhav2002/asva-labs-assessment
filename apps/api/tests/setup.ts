import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env['TEST_DATABASE_URL'] || 'postgresql://admin:admin123@localhost:5432/project_management_test',
        },
    },
});

beforeAll(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "users", "projects", "tasks" RESTART IDENTITY CASCADE`;
});

afterAll(async () => {
    await prisma.$disconnect();
});