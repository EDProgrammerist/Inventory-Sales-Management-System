import type { RequestHandler, Response } from 'express'
import { randomBytes } from 'node:crypto'
import * as services from '@/services/auth'
import { authCookie, generateCsrfToken } from '@/middlewares/csrf.middleware'
import { ApiError } from '@/lib/api-error'
function setSession(res: Response, value: Awaited<ReturnType<typeof services.login>>) {
  res.cookie('accessToken', value.accessToken, { ...authCookie, maxAge: 15 * 60000 })
  res.cookie('refreshToken', value.refreshToken, { ...authCookie, maxAge: 7 * 86400000 })
  res.json({ data: value })
}
export const csrfToken: RequestHandler = (req, res) => {
  if (!req.cookies.csrfSession) {
    const id = randomBytes(32).toString('hex')
    req.cookies.csrfSession = id
    res.cookie('csrfSession', id, authCookie)
  }
  res.json({ data: { csrfToken: generateCsrfToken(req, res, { overwrite: true }) } })
}
export const login: RequestHandler = async (req, res) =>
  setSession(res, await services.login(req.body))
export const signup: RequestHandler = async (req, res) => {
  res.status(201)
  setSession(res, await services.signup(req.body))
}
export const session: RequestHandler = (_req, res) => {
  res.json({ data: { user: res.locals.user } })
}
export const refresh: RequestHandler = async (req, res) => {
  const token = req.cookies?.refreshToken ?? req.body?.refreshToken
  if (typeof token !== 'string') throw new ApiError(401, 'Authentication required')
  setSession(res, await services.refresh(token))
}
export const logout: RequestHandler = async (req, res) => {
  const token = req.cookies?.refreshToken ?? req.body?.refreshToken
  if (typeof token === 'string') await services.logout(token)
  res.clearCookie('accessToken', authCookie)
  res.clearCookie('refreshToken', authCookie)
  res.json({ status: 'success' })
}
