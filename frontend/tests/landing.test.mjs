import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createServer } from 'vite'

test('landing preview preserves business data and exposes real project destinations', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { renderLanding } = await server.ssrLoadModule('/scripts/landing-render-check.tsx')
    const { html, inventoryUnchanged } = renderLanding()
    assert.ok(inventoryUnchanged, 'Rendering the preview must not mutate inventory')
    for (const path of ['/login', '/signup', '/suppliers', '/orders', '/manage-store', '/reports']) {
      assert.ok(html.includes(`href="${path}"`), `Missing real destination ${path}`)
    }
    assert.ok(html.includes('inventory-management'))
    assert.ok(!/student|HCI|OOP/.test(html), 'Public landing copy must omit academic positioning')
    assert.equal((html.match(/data-landing-illustration=/g) ?? []).length, 9, 'Six prominent section illustrations plus hero, information and closing artwork')
    assert.ok(!html.includes('Good to know'), 'The removed FAQ must stay removed')
    assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1)
    assert.ok(html.includes('aria-label="Decrease preview stock" disabled=""'))
    assert.ok(!html.includes('role="tablist"'), 'The replaced landing preview must not retain tabs')
    assert.ok(!/<(?:input|select|textarea)[\s>]/.test(html), 'The replaced landing previews must not retain forms')
    assert.ok(!html.includes('Tracky'))
    for (const sample of ['Maggi', 'Richard Martin', 'Lisy Store']) assert.ok(!html.includes(sample))
  } finally { await server.close() }
})
