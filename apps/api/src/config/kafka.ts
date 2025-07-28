import type { Consumer, Producer } from 'kafkajs';
import { CompressionTypes, Kafka, logLevel, Partitioners } from 'kafkajs';

import { logger } from '@/utils/logger';

let kafka: Kafka
let producer: Producer
let consumer: Consumer

const connectKafka = async (retries = 3): Promise<void> => {
  const brokers = process.env['KAFKA_BROKERS']?.split(',')?.map((b) => b.trim()) ?? ['kafka:9092']

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info('⏳ Connecting to Kafka...')
      kafka = new Kafka({
        brokers,
        requestTimeout: 30_000,
        connectionTimeout: 3000,
        clientId: 'project-management-api',
        ssl: process.env['KAFKA_SSL'] === 'true' ? {} : false,
        logLevel: process.env['NODE_ENV'] === 'production' ? logLevel.ERROR : logLevel.WARN,
        retry: {
          retries: 8,
          factor: 0.2,
          multiplier: 2,
          maxRetryTime: 30_000,
          initialRetryTime: 100
        }
      })

      producer = kafka.producer({
        maxInFlightRequests: 1,
        transactionTimeout: 60_000,
        createPartitioner: Partitioners.LegacyPartitioner
      })

      await producer.connect()
      logger.info('✅ Kafka producer connected')

      consumer = kafka.consumer({
        sessionTimeout: 30_000,
        heartbeatInterval: 3000,
        groupId: 'project-management-group',
        retry: {
          retries: 5,
          factor: 0.2,
          multiplier: 2,
          maxRetryTime: 10_000,
          initialRetryTime: 100
        }
      })

      await consumer.connect()
      logger.info('✅ Kafka consumer connected')

      await consumer.subscribe({
        fromBeginning: false,
        topics: ['user-events', 'project-events', 'task-events']
      })

      await consumer.run({
        autoCommit: true,
        autoCommitInterval: 5000,
        eachMessage: async ({ topic, message }) => {
          try {
            const event = JSON.parse(message.value?.toString() ?? '{}')
            logger.info(`📨 Received event from ${topic}:`, event)

            await processEvent(topic, event)
          } catch (error) {
            logger.error('Error processing Kafka message:', error)
          }
        }
      })

      logger.info('🎯 Kafka setup completed')
    } catch (error) {
      logger.warn(`❗ Kafka connection attempt ${attempt} failed:`, error)

      if (attempt === retries) {
        logger.error('All Kafka connection attempts failed')
        throw error
      }

      await new Promise(resolve => setTimeout(resolve, 2000 * attempt))
    }
  }
}

export const publishEvent = async (eventType: string, data: {
  [key: string]: unknown;
  tenantId?: string;
}) => {
  try {
    const topic = getTopicForEvent(eventType)
    const message = {
      key: data.tenantId ?? 'default',
      value: JSON.stringify({
        data,
        eventType,
        source: 'project-management-api',
        timestamp: new Date().toISOString()
      })
    }

    await producer.send({
      topic,
      acks: -1,
      messages: [message],
      compression: CompressionTypes.GZIP
    })

    logger.info(`📤 Event published to ${topic}:`, { data, eventType })
  } catch (error) {
    logger.error('Error publishing event:', error)
    // Don't break the flow
  }
}

const getTopicForEvent = (eventType: string): string => {
  if (eventType.startsWith('user.')) return 'user-events'
  if (eventType.startsWith('project.')) return 'project-events'
  if (eventType.startsWith('task.')) return 'task-events'
  return 'general-events'
}

const processEvent = async (topic: string, event: {
  data: {
    [key: string]: unknown;
    email?: string;
    name?: string;
    tenantId?: string;
    title?: string;
  };
  eventType: string;
}) => {
  switch (event.eventType) {
    case 'user.created': {
      logger.info(`New user registered: ${event.data.email}`)
      break
    }
    case 'project.created': {
      logger.info(`New project created: ${event.data.name}`)
      break
    }
    case 'task.created': {
      logger.info(`New task created: ${event.data.title}`)
      break
    }
    case 'user.updated': {
      logger.info(`User updated: ${event.data.email}`)
      break
    }
    case 'user.deleted': {
      logger.info(`User deleted: ${event.data.email}`)
      break
    }
    case 'project.updated': {
      logger.info(`Project updated: ${event.data.name}`)
      break
    }
    case 'project.deleted': {
      logger.info(`Project deleted: ${event.data.name}`)
      break
    }
    case 'task.updated': {
      logger.info(`Task updated: ${event.data.title}`)
      break
    }
    case 'task.deleted': {
      logger.info(`Task deleted: ${event.data.title}`)
      break
    }
    default: {
      logger.debug(`Unhandled event type: ${event.eventType}`)
    }
  }
}

export { connectKafka, consumer, producer };

