import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import hpp from 'hpp'
import { ENV } from '@/config/env'
import { healthRouter } from '@/routes/health.routes'
import { errorHandler } from '@/middlewares/error.middleware'
import { authRouter } from '@/routes/auth.routes'

export const app = express()
app.disable('x-powered-by')
app.use(helmet())
app.use(cors({ origin: ENV.FRONTEND_URL, credentials: true }))
app.use(express.json({ limit: '32kb' }))
app.use(express.urlencoded({ extended: false, limit: '32kb' }))
app.use(cookieParser())
app.use(hpp())
app.use(healthRouter)
app.use('/api/auth/v1', authRouter)

app.use((_request, response) => {
  response.status(404).json({ status: 'error', message: 'Route not found' })
})
app.use(errorHandler)
