import type { RequestHandler } from 'express'
import { getSession } from '@/services/auth'
import { ApiError } from '@/lib/api-error'
export const requireAuth: RequestHandler = async (req, res, next) => {
  const header = req.get('authorization'),
    token = header ? /^Bearer (\S+)$/.exec(header)?.[1] : req.cookies?.accessToken
  if (!token) throw new ApiError(401, 'Authentication required')
  res.locals.user = await getSession(token)
  next()
}
