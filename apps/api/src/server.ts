import loadEnvFile from '@/config/env'
import { connectKafka } from '@/config/kafka'
import { connectRedis } from '@/config/redis'
import { createApp } from './app'
import { logger } from '@/utils/logger'

async function startServer() {
  try {
    loadEnvFile()

    await connectRedis()
    await connectKafka(1)

    const app = createApp()

    const PORT = process.env['API_PORT'] ?? 3001
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`)
      logger.info(`📊 Environment: ${process.env['NODE_ENV'] ?? 'development'}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1)
  }
}

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...')
  process.exit(0)
})

startServer()
