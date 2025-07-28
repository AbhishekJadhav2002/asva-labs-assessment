import type { AuthenticatedRequest } from '@/middleware/auth';
import { authenticate, requireOwnership } from '@/middleware/auth';
import { cacheMiddleware, invalidateCache } from '@/middleware/cache';
import { ProjectService } from '@/services/projectService';
import { AppError } from '@/utils/errors';
import type { NextFunction, Response } from 'express';
import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';

const router = Router();

const validateRequest = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError('Validation failed', 400));
    }
    next();
};

router.get('/',
    authenticate,
    cacheMiddleware(60),
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const projects = await ProjectService.getAll(
                req.user?.tenantId ?? '',
                req.user?.id ?? '',
                req.user?.role ?? ''
            );
            res.json({
                success: true,
                data: projects,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            next(error);
        }
    }
);

router.get('/:id',
    [param('id').isString()],
    authenticate,
    requireOwnership('project'),
    validateRequest,
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.params['id']) {
                return next(new AppError('Project ID is required', 400));
            }

            const project = await ProjectService.getById(req.params['id'], req.user?.tenantId ?? '');
            res.json({
                data: project,
                success: true,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            next(error);
        }
    }
);

router.post('/',
    [
        body('name').trim().isLength({ min: 1 }),
        body('description').optional().trim()
    ],
    authenticate,
    invalidateCache('/projects'),
    validateRequest,
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const projectData = {
                ...req.body,
                userId: req.user?.id,
                tenantId: req.user?.tenantId
            };

            const project = await ProjectService.create(projectData);
            res.status(201).json({
                data: project,
                success: true,
                timestamp: new Date().toISOString(),
                message: 'Project created successfully'
            });
        } catch (error) {
            next(error);
        }
    }
);

router.put('/:id',
    [
        param('id').isString(),
        body('name').optional().trim().isLength({ min: 1 }),
        body('description').optional().trim(),
        body('status').optional().isIn(['ACTIVE', 'COMPLETED', 'ARCHIVED'])
    ],
    authenticate,
    requireOwnership('project'),
    invalidateCache('/projects'),
    validateRequest,
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.params['id']) {
                return next(new AppError('Project ID is required', 400));
            }

            const project = await ProjectService.update(
                req.params['id'],
                req.body,
                req.user?.tenantId ?? ''
            );

            res.json({
                data: project,
                success: true,
                timestamp: new Date().toISOString(),
                message: 'Project updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }
);

router.delete('/:id',
    [param('id').isString()],
    authenticate,
    requireOwnership('project'),
    invalidateCache('/projects'),
    validateRequest,
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.params['id']) {
                return next(new AppError('Project ID is required', 400));
            }

            const result = await ProjectService.delete(req.params['id'], req.user?.tenantId ?? '');
            res.json({
                data: result,
                success: true,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            next(error);
        }
    }
);

export { router as projectRoutes };

