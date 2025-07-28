import compression from 'compression'
import cors from 'cors'
import express from 'express'
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'
import type { Request, Response } from 'express'

import { errorHandler } from '@/middleware/errorHandler'
import { authRoutes } from '@/routes/auth'
import { projectRoutes } from '@/routes/projects'
import { taskRoutes } from '@/routes/tasks'
import { requestLogger } from '@/utils/logger'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(
    cors({
      credentials: true,
      origin: process.env['FRONTEND_URL'] ?? '*'
    })
  )

  app.use(
    rateLimit({
      max: 100,
      windowMs: 15 * 60 * 1000,
      message: 'Too many requests from this IP'
    })
  )

  app.use(compression())
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ limit: '10mb', extended: true }))

  app.use(requestLogger)

  app.get('/api', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      message: 'API is running',
      timestamp: new Date().toISOString()
    })
  })

  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      message: 'API is healthy',
      timestamp: new Date().toISOString()
    })
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/projects', projectRoutes)
  app.use('/api/tasks', taskRoutes)

  app.use('/*splat', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
      timestamp: new Date().toISOString()
    })
  })

  app.use(errorHandler)

  return app
}
