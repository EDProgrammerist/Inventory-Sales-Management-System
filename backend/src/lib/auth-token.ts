import jwt from 'jsonwebtoken'
import { createHash } from 'node:crypto'
import { ENV } from '@/config/env'
import { ApiError } from './api-error'
export const tokenHash = (value: string) => createHash('sha256').update(value).digest('hex')
export function verifyToken(value: string, type: 'access' | 'refresh') {
  try {
    const payload = jwt.verify(value, ENV.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'kanban-api',
      audience: 'kanban-client',
    })
    if (
      typeof payload === 'string' ||
      payload.type !== type ||
      typeof payload.sub !== 'string' ||
      typeof payload.sid !== 'string'
    )
      throw new Error()
    return { userId: payload.sub, sessionId: payload.sid }
  } catch {
    throw new ApiError(401, 'Authentication required')
  }
}
export function signToken(userId: string, sessionId: string, type: 'access' | 'refresh') {
  return jwt.sign({ type, sid: sessionId }, ENV.JWT_SECRET, {
    algorithm: 'HS256',
    issuer: 'kanban-api',
    audience: 'kanban-client',
    subject: userId,
    expiresIn: type === 'access' ? '15m' : '7d',
  })
}
