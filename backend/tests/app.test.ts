import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { once } from 'node:events'
import type { AddressInfo } from 'node:net'
import { app } from '@/app'
import { ENV } from '@/config/env'
import { getDatabase } from '@/db'
import { toItemResponse } from '@/views/item.view'

const server = app.listen(0, '127.0.0.1')
let baseUrl: string

before(async () => {
  if (!server.listening) await once(server, 'listening')
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
})

after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
})

test('root and API health respond without PostgreSQL', async () => {
  for (const path of ['/', '/api/health']) {
    const response = await fetch(`${baseUrl}${path}`)
    assert.equal(response.status, 200)
    const data = await response.json()
    assert.equal(data.status, 'success')
    assert.ok(Number.isFinite(Date.parse(data.timestamp)))
  }
})

test('unknown routes return JSON 404 rather than claiming authentication exists', async () => {
  const response = await fetch(`${baseUrl}/api/auth/v1/csrf-token`)
  assert.equal(response.status, 404)
  assert.deepEqual(await response.json(), { status: 'error', message: 'Route not found' })
})

test('credentialed CORS permits only the configured browser origin', async () => {
  const allowed = await fetch(`${baseUrl}/api/health`, { headers: { Origin: ENV.FRONTEND_URL } })
  assert.equal(allowed.headers.get('access-control-allow-origin'), ENV.FRONTEND_URL)
  assert.equal(allowed.headers.get('access-control-allow-credentials'), 'true')
  const untrusted = 'https://untrusted.example'
  const disallowed = await fetch(`${baseUrl}/api/health`, { headers: { Origin: untrusted } })
  assert.notEqual(disallowed.headers.get('access-control-allow-origin'), untrusted)
})

test('malformed JSON is rejected with 400 and no stack trace', async () => {
  const response = await fetch(`${baseUrl}/unknown`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{invalid',
  })
  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), { status: 'error', message: 'Invalid JSON body' })
})

test('oversized JSON is rejected with 413', async () => {
  const response = await fetch(`${baseUrl}/unknown`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: 'x'.repeat(40000) }),
  })
  assert.equal(response.status, 413)
})

test('security headers are enabled and Express identification is removed', async () => {
  const response = await fetch(`${baseUrl}/api/health`)
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
  assert.equal(response.headers.get('x-powered-by'), null)
})

test('item presenter excludes internal ownership fields', () => {
  assert.deepEqual(toItemResponse({ id: 'item-id', userId: 'private-owner', name: 'Draft', description: null }), {
    id: 'item-id', name: 'Draft', description: null,
  })
})

test('persisted features fail clearly when no database is configured', () => {
  if (!ENV.DATABASE_URL) assert.throws(() => getDatabase(), /DATABASE_URL is required/)
})
