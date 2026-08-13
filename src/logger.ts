import pino from 'pino'

const isDev = process.env.NODE_ENV !== 'production'

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  base: {
    service: 'backend',
    version: process.env.npm_package_version,
    env: process.env.NODE_ENV ?? 'development',
  },
  transport: isDev
    ? { target: 'pino-pretty', options: { colorize: true, ignore: 'pid,hostname' } }
    : undefined,
})

export default logger
