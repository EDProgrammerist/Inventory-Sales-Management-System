import assert from 'node:assert/strict'
import { test, after } from 'node:test'
import { once } from 'node:events'
import type { AddressInfo } from 'node:net'
import { app } from '@/app'
import { workspaceSchemas } from '@/schema/workspace.schema'
import { getDatabase, closeDatabase } from '@/db'
import { users } from '@/db/schema'
import { listWorkspace, writeRecord } from '@/repositories/workspace.repository'
import { workspaceView } from '@/views/workspace.view'

const server = app.listen(0, '127.0.0.1')
after(() => new Promise<void>((resolve) => server.close(() => resolve())))
after(closeDatabase)

test('workspace reads and writes require authentication instead of silently losing data', async () => {
  if (!server.listening) await once(server, 'listening')
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/workspace/v1`
  for (const [path, method] of [['', 'GET'], ['/products', 'POST'], ['/stores/test', 'PUT']]) {
    const response = await fetch(`${base}${path}`, { method })
    assert.equal(response.status, 401)
  }
})

test('workspace payloads reject ownership injection and invalid form values', () => {
  const store = { id: crypto.randomUUID(), name: 'Validation only', branch: 'Validation branch', address: 'Validation address', city: 'Validation city', phone: '09123456789' }
  assert.equal(workspaceSchemas.stores.parse(store).name, store.name)
  assert.throws(() => workspaceSchemas.stores.parse({ ...store, userId: crypto.randomUUID() }))
  assert.throws(() => workspaceSchemas.stores.parse({ ...store, phone: '123' }))
  assert.throws(() => workspaceSchemas.orders.parse({ id: 'order', product: 'Validation', value: 1, quantity: -1, unit: 'Pieces', expected: '2026-02-30', status: 'Confirmed' }))
})

test('PostgreSQL round trip restores all four lists and product history without leaking accounts', { skip: process.env.WORKSPACE_DATABASE_TEST !== '1' }, async () => {
  const database = getDatabase()
  const [owner] = await database.select({ id: users.id }).from(users).limit(1)
  assert.ok(owner, 'Use an existing account; this test never seeds users')
  const rollback = new Error('intentional test rollback')
  const marker = `rollback-${crypto.randomUUID()}`
  const id = crypto.randomUUID()
  const product = workspaceSchemas.products.parse({ id, name: marker, sku: marker.slice(0, 40), price: 12.5, quantity: 2, threshold: 1, expiry: '2027-01-01', availability: 'in-stock' })
  await assert.rejects(database.transaction(async (tx) => {
    await writeRecord(owner.id, 'products', product, false, tx)
    await writeRecord(owner.id, 'suppliers', workspaceSchemas.suppliers.parse({ id: crypto.randomUUID(), name: marker, product: marker, phone: '09123456789', email: `${marker}@example.test`, type: 'taking-return', onWay: null }), false, tx)
    await writeRecord(owner.id, 'orders', workspaceSchemas.orders.parse({ id: marker, product: marker, value: 25, quantity: 2, unit: 'Pieces', expected: '2027-01-01', status: 'Confirmed' }), false, tx)
    const store = workspaceSchemas.stores.parse({ id: crypto.randomUUID(), name: marker, branch: marker, address: 'Isolated transaction', city: 'Isolated transaction', phone: '09123456789' })
    await writeRecord(owner.id, 'stores', store, false, tx)
    await writeRecord(owner.id, 'stores', { ...store, name: `${marker}-edited` }, true, tx)
    await writeRecord(owner.id, 'products', { ...product, quantity: 3 }, true, tx)
    const restored = workspaceView(await listWorkspace(owner.id, tx))
    assert.equal(restored.products.find((row) => row.id === id)?.quantity, 3)
    assert.ok(restored.suppliers.some((row) => row.name === marker))
    assert.ok(restored.orders.some((row) => row.id === marker))
    assert.equal(restored.stores.find((row) => row.id === store.id)?.name, `${marker}-edited`)
    assert.equal(restored.events.filter((event) => event.productId === id).length, 2)
    assert.deepEqual(await listWorkspace(crypto.randomUUID(), tx), [])
    assert.equal(await writeRecord(crypto.randomUUID(), 'products', product, true, tx), undefined)
    await assert.rejects(writeRecord(owner.id, 'products', { ...product, id: crypto.randomUUID() }, false, tx))
    throw rollback
  }), (error) => error === rollback)
  assert.ok(!(await listWorkspace(owner.id)).some((row) => row.id === id), 'All test writes must roll back')
})
