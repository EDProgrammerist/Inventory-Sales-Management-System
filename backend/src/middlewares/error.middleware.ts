import type { ErrorRequestHandler } from 'express'

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, next) => {
  if (response.headersSent) return next(error)
  const type = typeof error === 'object' && error !== null && 'type' in error ? error.type : undefined
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
