import { redis } from '@/config/redis';
import type { AuthenticatedRequest } from '@/middleware/auth';
import { logger } from '@/utils/logger';
import type { NextFunction, Response } from 'express';

export const cacheMiddleware = (duration: number = 60) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (req.method !== 'GET') {
            return next();
        }

        const key = `cache:${req.originalUrl}:${req.user?.tenantId ?? 'anonymous'}`;

        try {
            const cached = await redis.get(key);
            if (cached) {
                logger.debug(`Cache hit for key: ${key}`);
                return res.json(JSON.parse(cached));
            }

            const originalJson = res.json;
            res.json = function (data: unknown) {
                if (res.statusCode === 200) {
                    redis.setEx(key, duration, JSON.stringify(data)).catch(error =>
                        logger.error('Cache set error:', error)
                    );
                }
                return originalJson.call(this, data);
            };

            next();
        } catch (error) {
            logger.error('Cache middleware error:', error);
            next();
        }
    };
};

export const invalidateCache = (pattern: string) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const tenantId = req.user?.tenantId;
        if (tenantId) {
            const keys = await redis.keys(`cache:*${pattern}*${tenantId}*`);
            if (keys.length > 0) {
                await redis.del([...keys]);
                logger.debug(`Invalidated ${keys.length} cache keys`);
            }
        }
        next();
    };
};
