import { prisma } from '@/config/database';
import { publishEvent } from '@/config/kafka';
import { AppError } from '@/utils/errors';

interface CreateTaskData {
    title: string;
    userId: string;
    dueDate?: Date;
    tenantId: string;
    projectId: string;
    description?: string;
    priority?: 'HIGH' | 'LOW' | 'MEDIUM' | 'URGENT';
}

interface UpdateTaskData {
    title?: string;
    dueDate?: Date;
    description?: string;
    priority?: 'HIGH' | 'LOW' | 'MEDIUM' | 'URGENT';
    status?: 'CANCELLED' | 'DONE' | 'IN_PROGRESS' | 'TODO';
}

export const TaskService = {
    async getByProject(projectId: string, tenantId: string) {
        const tasks = await prisma.task.findMany({
            where: { tenantId, projectId },
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'desc' }
            ],
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        return tasks;
    },

    async getById(id: string, tenantId: string) {
        const task = await prisma.task.findFirst({
            where: { id, tenantId },
            include: {
                project: {
                    select: { id: true, name: true }
                },
                user: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        if (!task) {
            throw new AppError('Task not found', 404);
        }

        return task;
    },

    async delete(id: string, tenantId: string) {
        const task = await prisma.task.findFirst({
            where: { id, tenantId }
        });

        if (!task) {
            throw new AppError('Task not found', 404);
        }

        await prisma.task.delete({
            where: { id }
        });

        await publishEvent('task.deleted', {
            taskId: id,
            title: task.title,
            userId: task.userId,
            tenantId: task.tenantId,
            projectId: task.projectId,
            timestamp: new Date().toISOString()
        });

        return { message: 'Task deleted successfully' };
    },

    async update(id: string, data: UpdateTaskData, tenantId: string) {
        const task = await prisma.task.update({
            where: { id, tenantId },
            data: {
                ...data,
                updatedAt: new Date()
            },
            include: {
                project: {
                    select: { id: true, name: true }
                },
                user: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        await publishEvent('task.updated', {
            taskId: task.id,
            title: task.title,
            status: task.status,
            userId: task.userId,
            priority: task.priority,
            tenantId: task.tenantId,
            projectId: task.projectId,
            timestamp: new Date().toISOString()
        });

        return task;
    },

    async create(data: CreateTaskData) {
        // Verify project exists and belongs to tenant
        const project = await prisma.project.findFirst({
            where: { id: data.projectId, tenantId: data.tenantId }
        });

        if (!project) {
            throw new AppError('Project not found', 404);
        }

        const task = await prisma.task.create({
            data,
            include: {
                project: {
                    select: { id: true, name: true }
                },
                user: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        await publishEvent('task.created', {
            taskId: task.id,
            title: task.title,
            userId: task.userId,
            tenantId: task.tenantId,
            projectId: task.projectId,
            timestamp: new Date().toISOString()
        });

        return task;
    },
};