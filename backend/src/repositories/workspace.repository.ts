import { and, asc, eq } from 'drizzle-orm'
import { getDatabase } from '@/db'
import { workspaceRecords } from '@/db/schema'
import type { WorkspaceKind } from '@/schema/workspace.schema'
type Database = Pick<ReturnType<typeof getDatabase>, 'select' | 'insert' | 'update' | 'transaction'>

function owned(userId: string, kind: WorkspaceKind, id: string) {
  return and(eq(workspaceRecords.userId, userId), eq(workspaceRecords.kind, kind), eq(workspaceRecords.id, id))
}
export async function listWorkspace(userId: string, database: Database = getDatabase()) {
  return database.select().from(workspaceRecords).where(eq(workspaceRecords.userId, userId)).orderBy(asc(workspaceRecords.createdAt), asc(workspaceRecords.id))
}
export async function writeRecord(userId: string, kind: WorkspaceKind, data: Record<string, unknown> & { id: string }, updating: boolean, database: Database = getDatabase()) {
  return database.transaction(async (tx) => {
    const previous = updating
      ? (await tx.select().from(workspaceRecords).where(owned(userId, kind, data.id)).for('update'))[0]
      : undefined
    if (updating && !previous) return undefined
    const events = [...(previous?.events ?? [])]
    if (kind === 'products') events.push({ id: crypto.randomUUID(), productId: data.id, kind: updating ? 'updated' : 'created', at: new Date().toISOString() })
    return updating
      ? (await tx.update(workspaceRecords).set({ data, events }).where(owned(userId, kind, data.id)).returning())[0]
      : (await tx.insert(workspaceRecords).values({ userId, kind, id: data.id, data, events }).returning())[0]
  })
}
