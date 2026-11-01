import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createServer } from 'vite'

test('cart totals use only valid catalog quantities and leave catalog data unchanged', async () => {
  const server = await createServer({ server: { middlewareMode:true, hmr:false, ws:false }, appType:'custom', logLevel:'error' })
  try {
    const { storefrontProducts } = await server.ssrLoadModule('/scripts/storefront-fixture-data.ts')
    const { cartSummary, normalizeCartQuantity } = await server.ssrLoadModule('/src/data/storefront-cart.ts')
    const before = JSON.stringify(storefrontProducts)
    const result = cartSummary({ 'iphone-purple':2, 'rtx-5090':1, 'ps5-disc':0, unknown:3 }, storefrontProducts)
    assert.equal(result.items.length, 2)
    assert.equal(result.quantity, 3)
    assert.equal(result.subtotal, 45990 * 2 + 149990)
    assert.equal(cartSummary({}, storefrontProducts).subtotal, 0)
    assert.equal(cartSummary({ 'iphone-purple':NaN, 'rtx-5090':1.5 }, storefrontProducts).items.length, 0)
    assert.equal(normalizeCartQuantity(99), 9)
    assert.equal(normalizeCartQuantity(-1), 0)
    assert.equal(normalizeCartQuantity(NaN), null)
    assert.equal(normalizeCartQuantity(1.5), null)
    assert.equal(JSON.stringify(storefrontProducts), before)
  } finally { await server.close() }
})

test('cart renders truthful empty and populated states without fake fees or checkout', async () => {
  const server = await createServer({ server: { middlewareMode:true, hmr:false, ws:false }, appType:'custom', logLevel:'error' })
  try {
    const { renderCart } = await server.ssrLoadModule('/scripts/landing-render-check.tsx')
    const empty = renderCart()
    assert.ok(empty.includes('Your cart is empty'))
    assert.ok(empty.includes('href="/products"'))
    const populated = renderCart({ 'iphone-purple':2, 'ps5-disc':1 })
    assert.equal((populated.match(/class="cart-item"/g) ?? []).length, 2)
    assert.ok(populated.includes('Shopping Cart'))
    assert.ok(populated.includes('Order Summary'))
    assert.ok(populated.includes('Not calculated'))
    assert.ok(populated.includes('Continue to address'))
    assert.ok(populated.includes('href="/checkout/address"'))
    assert.ok(!/AirPods|Apple Watch|\$2347|\$50|SAVE10/.test(populated))
    assert.equal((populated.match(/<h1[ >]/g) ?? []).length, 1)
  } finally { await server.close() }
})
