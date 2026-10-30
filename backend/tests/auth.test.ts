import assert from 'node:assert/strict'
import { test, after } from 'node:test'
import { once } from 'node:events'
import type { AddressInfo } from 'node:net'
import { app } from '@/app'
import { ENV } from '@/config/env'
import { credentialsSchema, signupSchema } from '@/schema/auth.schema'
import { verifyToken, signToken } from '@/lib/auth-token'
import { userView } from '@/views/auth.view'
import { logout } from '@/services/auth/logout-service'
import jwt from 'jsonwebtoken'
const server = app.listen(0, '127.0.0.1')
after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()))
})

test('logout accepts an expired or malformed refresh cookie so the browser can clear it', async () => {
  const expired = jwt.sign({ type: 'refresh', sid: 'expired-session' }, ENV.JWT_SECRET, {
    algorithm: 'HS256', issuer: 'kanban-api', audience: 'kanban-client',
    subject: 'expired-user', expiresIn: -1,
  })
  await assert.doesNotReject(logout(expired))
  await assert.doesNotReject(logout('malformed-cookie'))
})
test('browser credentials need CSRF and session requires verified authentication', async () => {
  if (!server.listening) await once(server, 'listening')
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/auth/v1`
  const csrf = await fetch(`${base}/csrf-token`)
  assert.equal(csrf.status, 200)
  assert.ok((await csrf.json()).data.csrfToken)
  assert.ok(csrf.headers.getSetCookie().every((value) => value.includes('HttpOnly')))
  assert.equal((await fetch(`${base}/session`)).status, 401)
  assert.equal(
    (await fetch(`${base}/session`, { headers: { Authorization: 'Bearer invalid' } })).status,
    401,
  )
  assert.equal(
    (
      await fetch(`${base}/login`, {
        method: 'POST',
        headers: { Origin: ENV.FRONTEND_URL, 'Content-Type': 'application/json' },
        body: '{}',
      })
    ).status,
    403,
  )
  assert.equal(
    (
      await fetch(`${base}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: 'invalid' }),
      })
    ).status,
    401,
  )
})
test('credentials normalize email and signup cannot set an administrator role', () => {
  const input = { email: ' ACCOUNT@EXAMPLE.TEST ', password: 'test-value-for-validation' }
  assert.equal(credentialsSchema.parse(input).email, 'account@example.test')
  assert.throws(() => signupSchema.parse({ ...input, name: 'Account', role: 'ADMIN' }))
  assert.throws(() => credentialsSchema.parse({ ...input, password: 'x'.repeat(73) }))
  assert.throws(() => credentialsSchema.parse({ ...input, password: 'short' }))
})
test('token validation distinguishes access and refresh tokens and user views hide passwords', () => {
  const token = signToken('user-id', 'session-id', 'access')
  assert.deepEqual(verifyToken(token, 'access'), { userId: 'user-id', sessionId: 'session-id' })
  assert.throws(() => verifyToken(token, 'refresh'))
  const view = userView({
    id: 'id',
    email: 'account@example.test',
    name: 'Account',
    role: 'ADMIN',
    password: 'private-hash',
    emailVerified: null,
    createdAt: '2026-10-30T00:00:00Z',
    updatedAt: '2026-10-30T00:00:00Z',
  })
  assert.ok(!('password' in view))
})
