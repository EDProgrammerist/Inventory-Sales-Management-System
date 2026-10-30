import { and, eq, isNull, gt } from 'drizzle-orm'
import { getDatabase } from '@/db'
import { users, tokens } from '@/db/schema'
import type { SessionToken } from '@/models/auth.model'
export async function findUser(email: string) {
  return (await getDatabase().select().from(users).where(eq(users.email, email)))[0]
}
export async function findUserById(id: string) {
  return (await getDatabase().select().from(users).where(eq(users.id, id)))[0]
}
export async function createUser(email: string, name: string, password: string) {
  return (await getDatabase().insert(users).values({ email, name, password }).returning())[0]
}
export async function activeToken(id: string, hash?: string) {
  return (
    await getDatabase()
      .select()
      .from(tokens)
      .where(
        and(
          eq(tokens.id, id),
          eq(tokens.type, 'REFRESH'),
          isNull(tokens.revokedAt),
          isNull(tokens.consumedAt),
          gt(tokens.expiresAt, new Date().toISOString()),
          hash ? eq(tokens.token, hash) : undefined,
        ),
      )
  )[0]
}
export async function saveSession(next: SessionToken, previousId?: string) {
  return getDatabase().transaction(async (tx) => {
    if (previousId) {
      const [consumed] = await tx
        .update(tokens)
        .set({ consumedAt: new Date().toISOString() })
        .where(
          and(
            eq(tokens.id, previousId),
            isNull(tokens.consumedAt),
            isNull(tokens.revokedAt),
            gt(tokens.expiresAt, new Date().toISOString()),
          ),
        )
        .returning()
      if (!consumed) return false
    }
    await tx.insert(tokens).values(next)
    return true
  })
}
export async function revokeSession(id: string) {
  await getDatabase()
    .update(tokens)
    .set({ revokedAt: new Date().toISOString() })
    .where(eq(tokens.id, id))
}
