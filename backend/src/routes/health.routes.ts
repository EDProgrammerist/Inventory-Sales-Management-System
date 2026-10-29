import { Router } from 'express'
import { getApiHealth, getRootStatus } from '@/controllers/health.controller'

export const healthRouter = Router()
healthRouter.get('/', getRootStatus)
healthRouter.get('/api/health', getApiHealth)
