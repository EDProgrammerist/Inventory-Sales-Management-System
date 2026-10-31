import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createServer } from 'vite'

test('workspace services save all four kinds and restore them on the next load', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', logLevel: 'error' })
  const original = globalThis.fetch
  try {
    const service = await server.ssrLoadModule('/src/services/workspace.ts')
    const stored = service.emptyWorkspace()
    const calls = []
    globalThis.fetch = async (url, options) => {
      if (url.endsWith('csrf-token')) return Response.json({ data: { csrfToken: 'test-only-csrf' } })
      assert.equal(options.credentials, 'include')
      calls.push(options.method)
      if (options.method === 'GET') return Response.json({ data: structuredClone(stored) })
      assert.equal(options.headers['x-csrf-token'], 'test-only-csrf')
      const kind = url.split('/workspace/v1/')[1].split('/')[0]
      const record = JSON.parse(options.body)
      if (options.method === 'PUT') stored[kind] = stored[kind].map((row) => row.id === record.id ? record : row)
      else stored[kind].push(record)
      return Response.json({ data: { record, events: [] } })
    }
    for (const kind of ['products', 'suppliers', 'orders', 'stores']) {
      await service.saveWorkspaceRecord(kind, { id: kind, name: `Isolated ${kind}` })
    }
    await service.saveWorkspaceRecord('stores', { id: 'stores', name: 'Edited store' }, true)
    const restored = await service.loadWorkspace()
    for (const kind of ['products', 'suppliers', 'orders', 'stores']) assert.equal(restored[kind].length, 1)
    assert.equal(restored.stores[0].name, 'Edited store')
    assert.deepEqual(calls, ['POST', 'POST', 'POST', 'POST', 'PUT', 'GET'])
    globalThis.fetch = async (url) => url.endsWith('csrf-token') ? Response.json({ data: { csrfToken: 'test-only' } }) : Response.json({ message: 'Duplicate branch' }, { status: 409 })
    await assert.rejects(service.saveWorkspaceRecord('stores', { id: 'duplicate' }), /Duplicate branch/)
    globalThis.fetch = async () => Response.json({ data: {} })
    await assert.rejects(service.loadWorkspace(), /invalid response/)
  } finally {
    globalThis.fetch = original
    await server.close()
  }
})
