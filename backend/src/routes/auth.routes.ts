import { Router } from 'express'
import * as controller from '@/controllers/auth.controller'
import { requireAuth } from '@/middlewares/auth.middleware'
import { authLimit } from '@/middlewares/auth-limit.middleware'
import { csrf } from '@/middlewares/csrf.middleware'
export const authRouter = Router()
authRouter.get('/csrf-token', controller.csrfToken)
authRouter.post('/login', authLimit, csrf, controller.login)
authRouter.post('/signup', authLimit, csrf, controller.signup)
authRouter.get('/session', requireAuth, controller.session)
authRouter.post('/refresh', csrf, controller.refresh)
authRouter.post('/logout', csrf, controller.logout)
