import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { ENV } from '@/config/env'
import * as schema from './schema'

// Created only when a persisted feature needs it; health checks run without PostgreSQL.
function createDatabase() {
  if (!ENV.DATABASE_URL) throw new Error('DATABASE_URL is required for persisted features')
  const pool = new Pool({ connectionString: ENV.DATABASE_URL })
  pool.on('error', () => console.error('Unexpected PostgreSQL connection error'))
  return { pool, db: drizzle({ client: pool, schema }) }
}

let connection: ReturnType<typeof createDatabase> | undefined

export function getDatabase() {
  connection ??= createDatabase()
  return connection.db
}

export async function closeDatabase() {
  if (connection) {
    await connection.pool.end()
    connection = undefined
  }
}
