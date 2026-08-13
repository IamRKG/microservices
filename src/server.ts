import app from './app.ts'
import logger from './logger.ts'
import { pool } from './index.ts'

const PORT = process.env.PORT ?? 6000

const server = app.listen(PORT, () => logger.info(`Server running on port ${PORT}`))

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down server...')
  server.close(async () => {
    logger.info('Server closed')
    await pool.end()
    process.exit(0)
  })
  // Force exit after 10s if connections don't close
  setTimeout(() => {
    logger.error('Forced exit after timeout')
    process.exit(1)
  }, 10000)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
