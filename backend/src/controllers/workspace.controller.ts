import type { RequestHandler } from 'express'
import { workspaceKind } from '@/schema/workspace.schema'
import { getWorkspace } from '@/services/workspace/get-workspace-service'
import { saveRecord } from '@/services/workspace/save-record-service'
import { recordView, workspaceView } from '@/views/workspace.view'

export const list: RequestHandler = async (_req, res) => {
  res.json({ status: 'success', data: workspaceView(await getWorkspace(res.locals.user.id)) })
}
export const save: RequestHandler = async (req, res) => {
  const kind = workspaceKind.parse(req.params.kind)
  const id = req.method === 'PUT' ? String(req.params.id) : undefined
  const row = await saveRecord(res.locals.user.id, kind, req.body, id)
  res.status(id === undefined ? 201 : 200).json({ status: 'success', data: recordView(row) })
}
