import { prisma } from '@/config/database';
import { AppError } from '@/utils/errors';
import type { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
    user?: {
        email: string;
        id: string;
        role: string;
        tenantId: string;
    };
}

export const authenticate = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new AppError('Access denied. No token provided.', 401);
        }

        const jwtSecret = process.env['JWT_SECRET']
        if (!jwtSecret) {
            throw new AppError('JWT_SECRET is not set', 500)
        }
        const decoded = jwt.verify(token, jwtSecret) as { tenantId: string; userId: string; };

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, role: true, email: true, tenantId: true }
        });

        if (!user) {
            throw new AppError('Invalid token.', 401);
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new AppError('Invalid token.', 401));
        } else {
            next(error);
        }
    }
};

export const requireAdmin = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    if (req.user?.role !== 'ADMIN') {
        return next(new AppError('Access denied. Admin role required.', 403));
    }
    next();
};

export const requireOwnership = (resourceType: 'project' | 'task') => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const resourceId = req.params['id'] ?? req.params['projectId'] ?? req.params['taskId'];
            const userId = req.user?.id;
            const tenantId = req.user?.tenantId;

            const resource = await (resourceType === 'project' ? prisma.project.findFirst({
                select: { userId: true },
                where: {
                    ...(resourceId ? { id: resourceId } : {}),
                    ...(tenantId ? { id: tenantId } : {}),
                }
            }) : prisma.task.findFirst({
                select: { userId: true, project: { select: { userId: true } } },
                where: {
                    ...(resourceId ? { id: resourceId } : {}),
                    ...(tenantId ? { id: tenantId } : {})
                }
            }));

            if (!resource) {
                return next(new AppError(`${resourceType} not found`, 404));
            }

            // Admin access in their tenant
            if (req.user?.role === 'ADMIN') {
                return next();
            }

            const isOwner = resourceType === 'project' ? resource.userId === userId : resource.userId === userId || ((resource as { project: { userId: string } })?.project && (resource as { project: { userId: string } })?.project.userId === userId);

            if (!isOwner) {
                return next(new AppError('Access denied. You can only access your own resources.', 403));
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};