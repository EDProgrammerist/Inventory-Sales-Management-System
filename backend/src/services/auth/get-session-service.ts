import { verifyToken } from '@/lib/auth-token'
import { activeToken, findUserById } from '@/repositories/auth.repository'
import { userView } from '@/views/auth.view'
import { ApiError } from '@/lib/api-error'
export async function getSession(accessToken: string) {
  const value = verifyToken(accessToken, 'access'),
    session = await activeToken(value.sessionId)
  if (!session || session.userId !== value.userId)
    throw new ApiError(401, 'Authentication required')
  const user = await findUserById(value.userId)
  if (!user) throw new ApiError(401, 'Authentication required')
  return userView(user)
}
