import { verifyToken, tokenHash } from '@/lib/auth-token'
import { activeToken, findUserById } from '@/repositories/auth.repository'
import { ApiError } from '@/lib/api-error'
import { issueSession } from './issue-session-service'
export async function refresh(refreshToken: string) {
  const value = verifyToken(refreshToken, 'refresh'),
    session = await activeToken(value.sessionId, tokenHash(refreshToken))
  if (!session || session.userId !== value.userId) throw new ApiError(401, 'Session expired')
  const user = await findUserById(value.userId)
  if (!user) throw new ApiError(401, 'Authentication required')
  return issueSession(user, value.sessionId)
}
