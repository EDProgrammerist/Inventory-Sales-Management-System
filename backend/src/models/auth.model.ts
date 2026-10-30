import type { users, tokens } from '@/db/schema'
export type Account = typeof users.$inferSelect
export type SessionToken = typeof tokens.$inferInsert
