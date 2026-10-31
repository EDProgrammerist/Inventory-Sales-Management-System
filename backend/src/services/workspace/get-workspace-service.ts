import { listWorkspace } from '@/repositories/workspace.repository'
export async function getWorkspace(userId: string) {
  return listWorkspace(userId)
}
