import assert from 'node:assert/strict'
import { once } from 'node:events'
import type { AddressInfo } from 'node:net'
import { inArray, sql } from 'drizzle-orm'
import { app } from '../src/app'
import { ENV } from '../src/config/env'
import { getDatabase, closeDatabase } from '../src/db'
import { tokens } from '../src/db/schema'
import { verifyToken } from '../src/lib/auth-token'
import { credentialsSchema } from '../src/schema/auth.schema'

async function main() {
  let source = ''
  for await (const chunk of process.stdin) source += chunk
  const credentials = credentialsSchema.parse(JSON.parse(source))
  const server = app.listen(0, '127.0.0.1')
  if (!server.listening) await once(server, 'listening')
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/auth/v1`
  const jar = new Map<string, string>(),
    createdSessions: string[] = []
  async function request(
    path: string,
    body?: unknown,
    browser = true,
    csrfToken?: string,
    bearer?: string,
  ) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (browser) {
      headers.Origin = ENV.FRONTEND_URL
      headers.Cookie = [...jar].map(([key, value]) => `${key}=${value}`).join('; ')
    }
    if (csrfToken) headers['x-csrf-token'] = csrfToken
    if (bearer) headers.Authorization = `Bearer ${bearer}`
    const response = await fetch(`${base}/${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    if (browser)
      for (const cookie of response.headers.getSetCookie()) {
        const pair = cookie.split(';')[0],
          at = pair.indexOf('=')
        jar.set(pair.slice(0, at), pair.slice(at + 1))
      }
    return { status: response.status, body: await response.json() }
  }
  async function csrf() {
    const response = await request('csrf-token')
    assert.equal(response.status, 200)
    return response.body.data.csrfToken as string
  }
  try {
    const token = await csrf()
    assert.equal((await request('login', credentials)).status, 403)
    assert.equal(
      (await request('login', { ...credentials, password: 'incorrect-password' }, true, token))
        .status,
      401,
    )
    const response = await request(
      'login',
      { ...credentials, email: credentials.email.toUpperCase() },
      true,
      token,
    )
    assert.equal(response.status, 200)
    assert.equal(response.body.data.user.role, 'ADMIN')
    assert.ok(!('password' in response.body.data.user))
    const original = response.body.data
    createdSessions.push(verifyToken(original.refreshToken, 'refresh').sessionId)
    assert.equal((await request('session')).status, 200)
    assert.equal((await request('session', undefined, false, undefined, 'invalid')).status, 401)
    assert.equal((await request('refresh', {}, true, token)).status, 403)
    const authenticatedToken = await csrf()
    const rotated = await request('refresh', {}, true, authenticatedToken)
    assert.equal(rotated.status, 200)
    createdSessions.push(verifyToken(rotated.body.data.refreshToken, 'refresh').sessionId)
    assert.equal(
      (await request('refresh', { refreshToken: original.refreshToken }, false)).status,
      401,
    )
    assert.equal(
      (await request('session', undefined, false, undefined, original.accessToken)).status,
      401,
    )
    assert.equal((await request('logout', {}, true, await csrf())).status, 200)
    assert.equal(
      (await request('session', undefined, false, undefined, rotated.body.data.accessToken)).status,
      401,
    )
    const counts = await getDatabase().execute(
      sql`select (select count(*) from "user")::int as users, (select count(*) from item)::int as items`,
    )
    assert.equal(counts.rows[0].items, 0)
    console.log(
      'PASS: requested admin login, ADMIN role, safe user view, cookie CSRF binding, bearer rejection, refresh rotation/replay and logout. No business records inserted.',
    )
  } finally {
    if (createdSessions.length)
      await getDatabase().delete(tokens).where(inArray(tokens.id, createdSessions))
    await new Promise<void>((resolve) => server.close(() => resolve()))
    await closeDatabase()
  }
}
main().catch((error) => {
  console.error(
    'Admin verification failed:',
    error instanceof assert.AssertionError ? error.message : 'Authentication/database error',
  )
  process.exitCode = 1
})
