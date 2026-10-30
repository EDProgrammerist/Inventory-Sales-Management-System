import { verifyToken, tokenHash } from '@/lib/auth-token'
import { activeToken, revokeSession } from '@/repositories/auth.repository'
import { ApiError } from '@/lib/api-error'
export async function logout(refreshToken: string) {
  let value: ReturnType<typeof verifyToken>
  try {
    value = verifyToken(refreshToken, 'refresh')
  } catch (error) {
    // Invalid or expired cookies still need clearing; valid sessions must be revoked below.
    if (error instanceof ApiError && error.status === 401) return
    throw error
  }
  if (await activeToken(value.sessionId, tokenHash(refreshToken)))
    await revokeSession(value.sessionId)
}
