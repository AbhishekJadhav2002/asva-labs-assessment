import type { ErrorRequestHandler } from 'express'

import { AppError } from '@/utils/errors'
import { logger } from '@/utils/logger'

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  logger.error('Error:', {
    ip: req.ip,
    url: req.url,
    stack: err.stack,
    method: req.method,
    message: err.message
  })

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      timestamp: new Date().toISOString()
    })
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      success: false,
      timestamp: new Date().toISOString(),
      message: 'Database operation failed'
    })
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      timestamp: new Date().toISOString()
    })
  }

  return res.status(500).json({
    success: false,
    timestamp: new Date().toISOString(),
    message: process.env['NODE_ENV'] === 'production' ? 'Internal server error' : err.message
  })
}
