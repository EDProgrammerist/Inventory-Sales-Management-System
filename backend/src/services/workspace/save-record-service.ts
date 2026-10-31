import { ApiError } from '@/lib/api-error'
import { writeRecord } from '@/repositories/workspace.repository'
import { workspaceSchemas, type WorkspaceKind } from '@/schema/workspace.schema'

export async function saveRecord(userId: string, kind: WorkspaceKind, input: unknown, id?: string) {
  const data = workspaceSchemas[kind].parse(input)
  if (id !== undefined && id !== data.id) throw new ApiError(400, 'The record ID cannot be changed')
  try {
    const row = await writeRecord(userId, kind, data, id !== undefined)
    if (!row) throw new ApiError(404, 'Record not found')
    return row
  } catch (error) {
    const cause = error instanceof Error && error.cause ? error.cause : error
    if (typeof cause === 'object' && cause && 'code' in cause && cause.code === '23505')
      throw new ApiError(409, 'This record already exists. Check the product name or ID, supplier and product, or store branch.')
    throw error
  }
}
