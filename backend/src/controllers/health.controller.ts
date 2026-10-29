import type { RequestHandler } from 'express'
import { toHealthResponse, toRootStatusResponse } from '@/views/health.view'

export const getRootStatus: RequestHandler = (_request, response) => {
  response.status(200).json(toRootStatusResponse())
}

export const getApiHealth: RequestHandler = (_request, response) => {
  response.status(200).json(toHealthResponse())
}
