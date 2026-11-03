import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createServer } from 'vite'

test('homepage PS5 promotions use the existing Disc, Digital and packaging photos',async()=>{
  const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',logLevel:'error'})
  try{
    const {renderLanding}=await server.ssrLoadModule('/scripts/landing-render-check.tsx')
    const {html}=renderLanding()
    assert.match(html,/<article class="shop-ps5-feature"[^>]*><img[^>]*src="[^"]*ps5-disc-console\.jpg"/)
    assert.match(html,/<article class="shop-editorial-console"[^>]*><img[^>]*src="[^"]*ps5-digital-console\.jpg"/)
    assert.match(html,/<img class="shop-closing-ps5"[^>]*src="[^"]*ps5-disc-box\.jpg"/)
    assert.ok(!html.includes('/storefront/ps5.png'),'Homepage should no longer use the generic PS5 artwork')
  }finally{await server.close()}
})

test('storefront display catalog stays separate from business data and preserves account links', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { renderLanding } = await server.ssrLoadModule('/scripts/landing-render-check.tsx')
    const { html, inventoryUnchanged } = renderLanding()
    assert.ok(inventoryUnchanged, 'Rendering the preview must not mutate inventory')
    for (const path of ['/login', '/signup']) {
      assert.ok(html.includes(`href="${path}"`), `Missing real destination ${path}`)
    }
    assert.ok(!html.includes('href="/dashboard"'), 'Anonymous customers must not see admin navigation')
    assert.ok(html.includes('iPhone 14'))
    assert.ok(html.includes('GeForce RTX'))
    assert.ok(html.includes('PlayStation'))
    assert.ok(!/student|HCI|OOP/.test(html), 'Public landing copy must omit academic positioning')
    assert.equal((html.match(/class="shop-product"/g) ?? []).length, 8)
    assert.ok(html.includes('Prices in PHP'))
    assert.ok(html.includes('Checkout saves simulated orders'))
    assert.ok(!html.includes('Buy Now'), 'Display catalog must not imply live checkout')
    assert.ok(!html.includes('Good to know'), 'The removed FAQ must stay removed')
    assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1)
    assert.ok(html.includes('role="search"'))
    assert.ok(!html.includes('Preview stock'))
    assert.ok(!html.includes('landing-illustration'))
    assert.ok(!html.includes('Tracky'))
    for (const sample of ['Maggi', 'Richard Martin', 'Lisy Store']) assert.ok(!html.includes(sample))
  } finally { await server.close() }
})

test('catalog filters compose without mutating inventory or catalog entries', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { storefrontProducts, selectCatalog } = await server.ssrLoadModule('/scripts/storefront-fixture-data.ts')
    const before = JSON.stringify(storefrontProducts)
    assert.equal(selectCatalog(storefrontProducts, 'phones', '', 'all', []).length, 4)
    assert.equal(selectCatalog(storefrontProducts, 'computers', '', 'all', []).length, 2)
    assert.equal(selectCatalog(storefrontProducts, 'consoles', '', 'all', []).length, 2)
    assert.equal(selectCatalog(storefrontProducts, 'all', ' GOLD ', 'all', [])[0].id, 'iphone-gold')
    assert.deepEqual(selectCatalog(storefrontProducts, 'all', '', 'saved', ['ps5-disc']).map(item => item.id), ['ps5-disc'])
    assert.equal(selectCatalog(storefrontProducts, 'all', 'no-such-product', 'all', []).length, 0)
    assert.ok(selectCatalog(storefrontProducts, 'all', '', 'featured', []).every(item => item.featured))
    assert.equal(JSON.stringify(storefrontProducts), before)
  } finally { await server.close() }
})
