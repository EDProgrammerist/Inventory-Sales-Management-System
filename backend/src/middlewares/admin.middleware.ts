import type { RequestHandler } from 'express'
import { ApiError } from '@/lib/api-error'

export const requireAdmin: RequestHandler = (_request,response,next) => {
  if (response.locals.user?.role !== 'ADMIN') throw new ApiError(403,'Administrator access required')
  next()
}
