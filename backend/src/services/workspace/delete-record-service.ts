import {z} from 'zod'
import {ApiError} from '@/lib/api-error'
import {deleteRecord} from '@/repositories/workspace.repository'
import {workspaceKind} from '@/schema/workspace.schema'

export async function removeRecord(userId:string,kind:unknown,id:unknown) {
  const parsedKind=workspaceKind.parse(kind),parsedId=z.string().min(1).max(100).parse(id)
  if(!await deleteRecord(userId,parsedKind,parsedId))throw new ApiError(404,'Record not found')
}
