import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import { ApiError } from '@/lib/api-error'

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, next) => {
  if (response.headersSent) return next(error)
  if (error instanceof ApiError) {
    response.status(error.status).json({ status: 'error', message: error.message })
    return
  }
  if (error instanceof ZodError) {
    response
      .status(400)
      .json({
        status: 'error',
        message: error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join('; '),
      })
    return
  }
  const cause = error instanceof Error && error.cause ? error.cause : error
  if (typeof cause === 'object' && cause !== null && 'code' in cause && cause.code === '23505') {
    response
      .status(409)
      .json({ status: 'error', message: 'An account already exists with this email' })
    return
  }
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'EBADCSRFTOKEN'
  ) {
    response.status(403).json({ status: 'error', message: 'Invalid or missing CSRF token' })
    return
  }
  const type =
    typeof error === 'object' && error !== null && 'type' in error ? error.type : undefined
  if (type === 'entity.parse.failed') {
    response.status(400).json({ status: 'error', message: 'Invalid JSON body' })
    return
  }
  if (type === 'entity.too.large') {
    response.status(413).json({ status: 'error', message: 'Request body is too large' })
    return
  }
  console.error('Unhandled API error:', error instanceof Error ? error.name : 'Unknown error')
  response.status(500).json({ status: 'error', message: 'An unexpected server error occurred' })
}
