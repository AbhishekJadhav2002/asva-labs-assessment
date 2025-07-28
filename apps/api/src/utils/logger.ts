import type { NextFunction, Request, Response } from 'express'
import * as winston from 'winston'

const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
)

export const logger = winston.createLogger({
    format: logFormat,
    level: process.env['LOG_LEVEL'] ?? 'info',
    defaultMeta: { service: 'project-management-api' },
    transports: [
        new winston.transports.File({
            maxFiles: 5,
            level: 'error',
            maxsize: 5_242_880,
            filename: 'logs/error.log'
        }),
        new winston.transports.File({
            maxFiles: 5,
            maxsize: 5_242_880,
            filename: 'logs/combined.log'
        })
    ]
})

if (process.env['NODE_ENV'] !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple())
        })
    )
}

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now()

    res.on('finish', () => {
        const duration = Date.now() - start
        logger.info('HTTP Request', {
            ip: req.ip,
            url: req.url,
            method: req.method,
            status: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('User-Agent')
        })
    })

    next()
}
