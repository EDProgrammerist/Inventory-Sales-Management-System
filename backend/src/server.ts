import { app } from '@/app'
import { ENV } from '@/config/env'

const server = app.listen(ENV.PORT, () => {
  console.log(`${ENV.APP_NAME} listening on ${ENV.BACKEND_URL}`)
})

server.on('error', (error) => {
  console.error('Unable to start the API:', error.message)
  process.exitCode = 1
})

function shutdown() {
  server.close(() => { process.exitCode = 0 })
  setTimeout(() => process.exit(1), 10000).unref()
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)
