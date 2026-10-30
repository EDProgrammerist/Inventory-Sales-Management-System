import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createServer } from 'vite'

const account = { id: 'test-account', email: 'test@example.com', name: 'Test', role: 'USER' }
const json = (body, status = 200) => new Response(JSON.stringify(body), { status })

test('cookie authentication restores, refreshes, validates responses and signs out', async (t) => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', logLevel: 'error' })
  const originalFetch = globalThis.fetch
  try {
    const auth = await server.ssrLoadModule('/src/services/auth.ts')
    await t.test('deduplicates restoration and returns only the safe user fields', async () => {
      let requests = 0
      globalThis.fetch = async (_url, options) => {
        requests++
        assert.equal(options.credentials, 'include')
        return json({ data: { user: { ...account, password: 'must-not-expose' }, accessToken: 'not-for-state' } })
      }
      const [first, second] = await Promise.all([auth.getSession(), auth.getSession()])
      assert.deepEqual(first, account)
      assert.deepEqual(second, account)
      assert.equal(requests, 1)
    })
    await t.test('refreshes an expired access cookie with CSRF protection', async () => {
      const calls = []
      globalThis.fetch = async (url, options) => {
        const path = url.split('/').at(-1)
        calls.push(path)
        if (path === 'session') return json({}, 401)
        if (path === 'csrf-token') return json({ data: { csrfToken: 'csrf-test' } })
        assert.equal(options.method, 'POST')
        assert.equal(options.headers['x-csrf-token'], 'csrf-test')
        return json({ data: { user: account } })
      }
      assert.deepEqual(await auth.getSession(), account)
      assert.deepEqual(calls, ['session', 'csrf-token', 'refresh'])
    })
    await t.test('expired refresh cookies produce an anonymous session', async () => {
      globalThis.fetch = async (url) => url.endsWith('csrf-token') ? json({ data: { csrfToken: 'csrf-test' } }) : json({}, 401)
      assert.equal(await auth.getSession(), null)
    })
    await t.test('network errors remain errors and do not trigger refresh or fake logout', async () => {
      let calls = 0
      globalThis.fetch = async () => { calls++; throw new Error('offline') }
      await assert.rejects(auth.getSession(), /account service/)
      assert.equal(calls, 1)
    })
    await t.test('rejects malformed users and sends logout with cookies and CSRF', async () => {
      globalThis.fetch = async () => json({ data: { user: { ...account, role: 'INVALID' } } })
      await assert.rejects(auth.getSession(), /Invalid account response/)
      globalThis.fetch = async (url, options) => {
        if (url.endsWith('csrf-token')) return json({ data: { csrfToken: 'logout-csrf' } })
        assert.ok(url.endsWith('/logout'))
        assert.equal(options.credentials, 'include')
        assert.equal(options.method, 'POST')
        assert.equal(options.headers['x-csrf-token'], 'logout-csrf')
        return json({ status: 'success' })
      }
      await auth.signOut()
    })
    await t.test('the route guard hides private content until authenticated', async () => {
      const { renderAuthGuard } = await server.ssrLoadModule('/scripts/product-render-check.tsx')
      const pending = renderAuthGuard({ user: null, loading: true, error: '' })
      assert.ok(pending.includes('Checking your session'))
      assert.ok(!pending.includes('Private workspace content'))
      const anonymous = renderAuthGuard({ user: null, loading: false, error: '' })
      assert.ok(!anonymous.includes('Private workspace content'))
      const failed = renderAuthGuard({ user: null, loading: false, error: 'Offline' })
      assert.ok(failed.includes('Try again'))
      assert.ok(!failed.includes('Private workspace content'))
      const signedIn = renderAuthGuard({ user: account, loading: false, error: '' })
      assert.ok(signedIn.includes('Private workspace content'))
    })
  } finally {
    globalThis.fetch = originalFetch
    await server.close()
  }
})
