import { AuthService } from '@/services/authService';
import { AppError } from '@/utils/errors';
import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import { body, validationResult } from 'express-validator';

const router = Router();

const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError('Validation failed', 400));
    }
    next();
};

router.post('/register',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 }),
        body('name').trim().isLength({ min: 2 }),
        body('tenantId').trim().isLength({ min: 1 }),
        body('role').optional().isIn(['ADMIN', 'USER'])
    ],
    validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await AuthService.register(req.body);
            res.status(201).json({
                data: result,
                success: true,
                timestamp: new Date().toISOString(),
                message: 'User registered successfully'
            });
        } catch (error) {
            next(error);
        }
    }
);

router.post('/login',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').exists(),
        body('tenantId').trim().isLength({ min: 1 })
    ],
    validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await AuthService.login(req.body);
            res.json({
                data: result,
                success: true,
                message: 'Login successful',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            next(error);
        }
    }
);

router.post('/refresh',
    [body('refreshToken').exists()],
    validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { refreshToken } = req.body;
            const result = await AuthService.refreshToken(refreshToken);
            res.json({
                data: result,
                success: true,
                timestamp: new Date().toISOString(),
                message: 'Token refreshed successfully'
            });
        } catch (error) {
            next(error);
        }
    }
);

export { router as authRoutes };

