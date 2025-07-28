import { logger } from '@/utils/logger';
import type { RedisClientType } from 'redis';
import { createClient } from 'redis';

let redis: RedisClientType;

const connectRedis = async () => {
    try {
        logger.info('⏳ Connecting to Redis...');
        redis = createClient({
            url: process.env['REDIS_URL'] ?? `redis://:${process.env['REDIS_PASSWORD']}@redis:6379`,
            socket: {
                connectTimeout: 3000,
                reconnectStrategy: (retries) => {
                    if (retries > 5) {
                        logger.error('❌ Redis connection failed after multiple attempts');
                        return new Error('Redis connection failed');
                    }
                    return Math.min(retries * 1000, 3000);
                }
            }
        });

        redis.on('error', (err) => {
            logger.error('Redis Client Error:', err);
        });

        redis.on('connect', () => {
            logger.info('✅ Redis connected successfully');
        });

        redis.on('ready', () => {
            logger.info('🔄 Redis ready to accept commands');
        });

        redis.on('end', () => {
            logger.warn('❌ Redis connection ended');
        });

        await redis.connect();

        await redis.ping();
        logger.info('🎯 Redis ping successful');

    } catch (error) {
        logger.error('Failed to connect to Redis:', error);
        throw error;
    }
};

export { connectRedis, redis };

