import 'dotenv/config'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { resolve, join } from 'node:path'
import { Client } from 'pg'
import { catalogImport } from '../src/schema/catalog.schema'

async function main() {
  if (!process.argv.includes('--replace-business-data')) throw new Error('Explicit replacement flag required')
  if (!process.env.DATABASE_URL) throw new Error('Database not configured')
  const dryRun = process.argv.includes('--dry-run')
  const products = catalogImport.parse(JSON.parse(await readFile(new URL('../data/storefront-products.json', import.meta.url), 'utf8')))
  const expectedIds = ['iphone-purple','rtx-5090','ps5-disc','iphone-gold','iphone-silver','rtx-5080','iphone-black','ps5-digital']
  if (products.some((row, index) => row.id !== expectedIds[index])) throw new Error('Import differs from the approved eight products')
  const backupPath = resolve('../.local-backups', `catalog-replacement-${new Date().toISOString().replace(/[:.]/g,'-')}.json`)
  // Backups contain private business records; refuse to create an unignored copy.
  execFileSync('git', ['check-ignore','--quiet',backupPath], {stdio:'ignore'})
  const client = new Client({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:15000,query_timeout:30000})
  try {
    await client.connect()
    await client.query('BEGIN')
    await client.query("SET LOCAL lock_timeout = '10s'")
    await client.query('LOCK TABLE workspace_record, item, catalog_product IN EXCLUSIVE MODE')
    await client.query('LOCK TABLE "user", token IN SHARE MODE')
    const accountsBefore = JSON.stringify((await client.query('SELECT * FROM "user" ORDER BY id')).rows)
    const tokensBefore = JSON.stringify((await client.query('SELECT * FROM token ORDER BY id')).rows)
    const admins = await client.query<{id:string}>("SELECT id FROM \"user\" WHERE role = 'ADMIN' ORDER BY created_at,id")
    if (admins.rows.length !== 1) throw new Error('Expected the existing single admin account')
    const old = {
      workspace: (await client.query('SELECT * FROM workspace_record ORDER BY user_id,kind,id')).rows,
      items: (await client.query('SELECT * FROM item ORDER BY id')).rows,
      catalog: (await client.query('SELECT * FROM catalog_product ORDER BY id')).rows,
    }
    await mkdir(resolve('../.local-backups'), {recursive:true})
    await writeFile(backupPath, JSON.stringify({createdAt:new Date().toISOString(),...old},null,2)+'\n', {flag:'wx',mode:0o600})
    await client.query('DELETE FROM workspace_record')
    await client.query('DELETE FROM item')
    await client.query('DELETE FROM catalog_product')
    for (const [index, product] of products.entries()) {
      await client.query('INSERT INTO catalog_product (id,owner_id,name,variant,category,price,image_key,description,featured,sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)', [product.id,admins.rows[0].id,product.name,product.variant,product.category,product.price.toFixed(2),product.imageKey,product.description,product.featured,index])
    }
    const accountsAfter = JSON.stringify((await client.query('SELECT * FROM "user" ORDER BY id')).rows)
    const tokensAfter = JSON.stringify((await client.query('SELECT * FROM token ORDER BY id')).rows)
    if (accountsBefore !== accountsAfter || tokensBefore !== tokensAfter) throw new Error('Account preservation check failed')
    const count = Number((await client.query('SELECT count(*) AS count FROM catalog_product')).rows[0].count)
    if (count !== 8) throw new Error('Catalog count mismatch')
    await client.query(dryRun ? 'ROLLBACK' : 'COMMIT')
    console.log(JSON.stringify({committed:!dryRun,removed:{workspace:old.workspace.length,items:old.items.length,previousCatalog:old.catalog.length},catalogProducts:count,accountsUnchanged:true,tokensUnchanged:true,backup:join('.local-backups',backupPath.split(/[\\/]/).pop()!)}))
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    throw error
  } finally { await client.end() }
}

main().catch(() => {
  console.error('Catalog replacement failed; database changes were not committed. Verify migration, ignored backup folder, approved import data, and database availability. Connection details suppressed.')
  process.exitCode=1
})
