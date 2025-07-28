import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    const hashedPassword = await hash('demo123', 12);

    const adminUser = await prisma.user.upsert({
        update: {},
        where: { email: 'admin@demo.com' },
        create: {
            role: 'ADMIN',
            tenantId: 'demo',
            name: 'Demo Admin',
            email: 'admin@demo.com',
            password: hashedPassword,
        },
    });

    const regularUser = await prisma.user.upsert({
        update: {},
        where: { email: 'user@demo.com' },
        create: {
            role: 'USER',
            tenantId: 'demo',
            name: 'Demo User',
            email: 'user@demo.com',
            password: hashedPassword,
        },
    });

    const project1 = await prisma.project.create({
        data: {
            status: 'ACTIVE',
            tenantId: 'demo',
            userId: adminUser.id,
            name: 'Website Redesign',
            description: 'Complete redesign of the company website with modern UI/UX',
        },
    });

    const project2 = await prisma.project.create({
        data: {
            status: 'ACTIVE',
            tenantId: 'demo',
            userId: regularUser.id,
            name: 'Mobile App Development',
            description: 'Develop a cross-platform mobile application',
        },
    });

    const project3 = await prisma.project.create({
        data: {
            tenantId: 'demo',
            status: 'COMPLETED',
            userId: adminUser.id,
            name: 'API Documentation',
            description: 'Create comprehensive API documentation',
        },
    });

    const tasks = [
        {
            tenantId: 'demo',
            userId: adminUser.id,
            projectId: project1.id,
            status: 'DONE' as const,
            priority: 'HIGH' as const,
            title: 'Design System Creation',
            description: 'Create a comprehensive design system with components and guidelines',
        },
        {
            tenantId: 'demo',
            userId: adminUser.id,
            projectId: project1.id,
            title: 'Homepage Mockups',
            priority: 'HIGH' as const,
            status: 'IN_PROGRESS' as const,
            description: 'Create high-fidelity mockups for the new homepage',
        },
        {
            tenantId: 'demo',
            title: 'User Testing',
            projectId: project1.id,
            userId: regularUser.id,
            status: 'TODO' as const,
            priority: 'MEDIUM' as const,
            description: 'Conduct user testing sessions with the new design',
        },

        {
            tenantId: 'demo',
            projectId: project2.id,
            userId: regularUser.id,
            status: 'DONE' as const,
            priority: 'HIGH' as const,
            title: 'React Native Setup',
            description: 'Initialize React Native project with necessary dependencies',
        },
        {
            tenantId: 'demo',
            projectId: project2.id,
            userId: regularUser.id,
            priority: 'HIGH' as const,
            title: 'Authentication Flow',
            status: 'IN_PROGRESS' as const,
            description: 'Implement user authentication and authorization',
        },
        {
            tenantId: 'demo',
            projectId: project2.id,
            userId: regularUser.id,
            status: 'TODO' as const,
            title: 'Push Notifications',
            priority: 'MEDIUM' as const,
            description: 'Integrate push notification service',
        },

        {
            tenantId: 'demo',
            userId: adminUser.id,
            projectId: project3.id,
            status: 'DONE' as const,
            priority: 'HIGH' as const,
            title: 'OpenAPI Specification',
            description: 'Write comprehensive OpenAPI/Swagger documentation',
        },
        {
            tenantId: 'demo',
            userId: adminUser.id,
            title: 'Code Examples',
            projectId: project3.id,
            status: 'DONE' as const,
            priority: 'MEDIUM' as const,
            description: 'Provide code examples for all API endpoints',
        },
    ];

    for (const task of tasks) {
        await prisma.task.create({ data: task });
    }

    console.log('✅ Database seeded successfully!');
    console.log('👤 Admin user: admin@demo.com / demo123');
    console.log('👤 Regular user: user@demo.com / demo123');
    console.log('🏢 Tenant: demo');
}

main()
    .catch((error) => {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });