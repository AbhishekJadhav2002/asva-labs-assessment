import * as path from 'node:path'
import { configDotenv } from 'dotenv'

import { logger } from '@/utils/logger'

export default function loadEnvFile() {
  try {
    const envFilePath = path.resolve(__dirname, '../../.env')

    configDotenv({ quiet: true, path: envFilePath })
  } catch (error) {
    logger.error('Failed to load ENV file:', error)
  }
}
