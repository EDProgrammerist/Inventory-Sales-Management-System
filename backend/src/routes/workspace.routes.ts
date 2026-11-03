import { Router, json } from 'express'
import { requireAuth } from '@/middlewares/auth.middleware'
import { requireAdmin } from '@/middlewares/admin.middleware'
import { csrf } from '@/middlewares/csrf.middleware'
import * as controller from '@/controllers/workspace.controller'

export const workspaceRouter = Router()
workspaceRouter.use(requireAuth, requireAdmin, csrf)
workspaceRouter.get('/', controller.list)
// Existing image uploads accept 5 MB files encoded as data URLs. Keep the larger
// parser scoped to authenticated workspace mutations, away from account routes.
workspaceRouter.post('/:kind', json({ limit: '8mb' }), controller.save)
workspaceRouter.put('/:kind/:id', json({ limit: '8mb' }), controller.save)
workspaceRouter.delete('/:kind/:id',controller.remove)
