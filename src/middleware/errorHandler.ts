import type { Request, Response, NextFunction } from 'express'
import { AppError, ConflictError, NotFoundError } from '../errors/AppError.ts'
import logger from '../logger.ts'

const getDbErrorCode = (err: unknown): string | undefined => {
  if (typeof err !== 'object' || err === null) return undefined
  const cause = (err as { cause?: unknown }).cause
  if (typeof cause !== 'object' || cause === null) return undefined
  return 'code' in cause ? String(cause.code) : undefined
}

const translateDbError = (err: unknown): AppError | null => {
  const code = getDbErrorCode(err)
  if (code === '23505') return new ConflictError('Resource already exists')
  if (code === '23503') return new NotFoundError('Referenced resource not found')
  return null
}

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) logger.error({ err }, err.message)
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    })
    return
  }

  const dbError = translateDbError(err)
  if (dbError) {
    res.status(dbError.statusCode).json({
      error: dbError.message,
      code: dbError.code,
    })
    return
  }

  logger.error({ err }, 'Unhandled error')
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  })
}
