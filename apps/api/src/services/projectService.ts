import { prisma } from '@/config/database';
import { publishEvent } from '@/config/kafka';
import { AppError } from '@/utils/errors';

interface CreateProjectData {
    name: string;
    userId: string;
    tenantId: string;
    description?: string;
}

interface UpdateProjectData {
    name?: string;
    description?: string;
    status?: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
}

export const ProjectService = {
    async create(data: CreateProjectData) {
        const project = await prisma.project.create({
            data,
            include: {
                tasks: true,
                user: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        await publishEvent('project.created', {
            name: project.name,
            projectId: project.id,
            userId: project.userId,
            tenantId: project.tenantId,
            timestamp: new Date().toISOString()
        });

        return project;
    },

    async delete(id: string, tenantId: string) {
        const project = await prisma.project.findFirst({
            where: { id, tenantId }
        });

        if (!project) {
            throw new AppError('Project not found', 404);
        }

        await prisma.project.delete({
            where: { id }
        });

        await publishEvent('project.deleted', {
            projectId: id,
            name: project.name,
            userId: project.userId,
            tenantId: project.tenantId,
            timestamp: new Date().toISOString()
        });

        return { message: 'Project deleted successfully' };
    },

    async getById(id: string, tenantId: string) {
        const project = await prisma.project.findFirst({
            where: { id, tenantId },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                },
                tasks: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
            }
        });

        if (!project) {
            throw new AppError('Project not found', 404);
        }

        return project;
    },

    async update(id: string, data: UpdateProjectData, tenantId: string) {
        const project = await prisma.project.update({
            where: { id, tenantId },
            data: {
                ...data,
                updatedAt: new Date()
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        await publishEvent('project.updated', {
            name: project.name,
            projectId: project.id,
            status: project.status,
            userId: project.userId,
            tenantId: project.tenantId,
            timestamp: new Date().toISOString()
        });

        return project;
    },

    async getAll(tenantId: string, userId?: string, role?: string) {
        const where: { tenantId: string; userId?: string } = { tenantId };

        // Non-admin users
        if (role !== 'ADMIN' && userId) {
            where.userId = userId;
        }

        const projects = await prisma.project.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                },
                tasks: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        priority: true
                    }
                }
            }
        });

        return projects;
    },
};