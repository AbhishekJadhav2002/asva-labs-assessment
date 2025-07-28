import type { AuthenticatedRequest } from '@/middleware/auth';
import { authenticate, requireOwnership } from '@/middleware/auth';
import { invalidateCache } from '@/middleware/cache';
import { TaskService } from '@/services/taskService';
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

router.get('/project/:projectId',
    [param('projectId').isString()],
    authenticate,
    requireOwnership('project'),
    validateRequest,
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.params['projectId']) {
                return next(new AppError('Project ID is required', 400));
            }

            const tasks = await TaskService.getByProject(
                req.params['projectId'],
                req.user?.tenantId ?? ''
            );
            res.json({
                data: tasks,
                success: true,
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
    requireOwnership('task'),
    validateRequest,
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.params['id']) {
                return next(new AppError('Task ID is required', 400));
            }

            const task = await TaskService.getById(req.params['id'], req.user?.tenantId ?? '');
            res.json({
                data: task,
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
        body('title').trim().isLength({ min: 1 }),
        body('description').optional().trim(),
        body('projectId').isString(),
        body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
        body('dueDate').optional().isISO8601()
    ],
    authenticate,
    invalidateCache('/tasks'),
    validateRequest,
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const taskData = {
                ...req.body,
                userId: req.user?.id,
                tenantId: req.user?.tenantId,
                dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined
            };
            const task = await TaskService.create(taskData);
            res.status(201).json({
                data: task,
                success: true,
                timestamp: new Date().toISOString(),
                message: 'Task created successfully'
            });
        } catch (error) {
            next(error);
        }
    }
);

router.put('/:id',
    [
        param('id').isString(),
        body('title').optional().trim().isLength({ min: 1 }),
        body('description').optional().trim(),
        body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']),
        body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
        body('dueDate').optional().isISO8601()
    ],
    authenticate,
    requireOwnership('task'),
    invalidateCache('/tasks'),
    validateRequest,
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.params['id']) {
                return next(new AppError('Task ID is required', 400));
            }

            const updateData = {
                ...req.body,
                dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined
            };
            const task = await TaskService.update(
                req.params['id'],
                updateData,
                req.user?.tenantId ?? ''
            );
            res.json({
                data: task,
                success: true,
                timestamp: new Date().toISOString(),
                message: 'Task updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }
);

router.delete('/:id',
    [param('id').isString()],
    authenticate,
    requireOwnership('task'),
    invalidateCache('/tasks'),
    validateRequest,
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.params['id']) {
                return next(new AppError('Task ID is required', 400));
            }

            const result = await TaskService.delete(req.params['id'], req.user?.tenantId ?? '');
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

export { router as taskRoutes };

