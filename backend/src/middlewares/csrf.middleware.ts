import type { RequestHandler } from 'express'
import { doubleCsrf } from 'csrf-csrf'
import { ENV } from '@/config/env'
import { ApiError } from '@/lib/api-error'
export const authCookie = {
  httpOnly: true,
  secure: ENV.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}
export const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => ENV.CSRF_SECRET,
  getSessionIdentifier: (req) => req.cookies?.refreshToken ?? req.cookies?.csrfSession ?? '',
  cookieName: ENV.NODE_ENV === 'production' ? '__Host-kanban-csrf' : 'kanban-csrf',
  cookieOptions: authCookie,
  getCsrfTokenFromRequest: (req) => req.get('x-csrf-token'),
})
export const csrf: RequestHandler = (req, res, next) => {
  if (req.get('origin') && req.get('origin') !== ENV.FRONTEND_URL)
    throw new ApiError(403, 'Origin not allowed')
  const cookieFree =
    !req.cookies?.accessToken &&
    !req.cookies?.refreshToken &&
    !req.cookies?.csrfSession &&
    !req.get('origin') &&
    !req.get('referer') &&
    !req.get('sec-fetch-site')
  if (cookieFree) return next()
  doubleCsrfProtection(req, res, next)
}
