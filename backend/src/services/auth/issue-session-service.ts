import { randomUUID } from 'node:crypto'
import { saveSession } from '@/repositories/auth.repository'
import { signToken, tokenHash } from '@/lib/auth-token'
import { userView } from '@/views/auth.view'
import { ApiError } from '@/lib/api-error'
import type { Account } from '@/models/auth.model'
export async function issueSession(user: Account, previousId?: string) {
  const id = randomUUID(),
    accessToken = signToken(user.id, id, 'access'),
    refreshToken = signToken(user.id, id, 'refresh')
  const saved = await saveSession(
    {
      id,
      userId: user.id,
      type: 'REFRESH',
      token: tokenHash(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    },
    previousId,
  )
  if (!saved) throw new ApiError(401, 'Session expired')
  return { user: userView(user), accessToken, refreshToken }
}
