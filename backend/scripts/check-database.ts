import 'dotenv/config'
import { Client } from 'pg'

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured')
  const client = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15000, query_timeout: 15000 })
  try {
    await client.connect()
    await client.query('SELECT 1')
    const tables = await client.query<{ table_schema: string; table_name: string }>(
      "SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema IN ('public', 'drizzle') AND table_type = 'BASE TABLE' ORDER BY table_schema, table_name",
    )
    const tableNames = tables.rows.map((table) => `${table.table_schema}.${table.table_name}`)
    const counts: Record<string, number> = {}
    if (tableNames.includes('public.user')) counts.users = Number((await client.query('SELECT count(*) AS count FROM "user"')).rows[0].count)
    if (tableNames.includes('public.item')) counts.items = Number((await client.query('SELECT count(*) AS count FROM "item"')).rows[0].count)
    if (tableNames.includes('drizzle.__drizzle_migrations')) counts.migrations = Number((await client.query('SELECT count(*) AS count FROM drizzle.__drizzle_migrations')).rows[0].count)
    console.log(JSON.stringify({ connected: true, tables: tables.rows, counts }))
  } finally {
    await client.end()
  }
}

main().catch(() => {
  // Database driver errors may include connection details; never print them here.
  console.error('Database check failed. Check the configured URL, network access, and TLS settings.')
  process.exitCode = 1
})
