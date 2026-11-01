import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createServer } from 'vite'

test('product listing composes price, brand, memory and category filters and clamps pagination', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { storefrontProducts } = await server.ssrLoadModule('/scripts/storefront-fixture-data.ts')
    const { filterProducts, paginateCatalog, productBrand } = await server.ssrLoadModule('/src/data/storefront-filters.ts')
    const before = JSON.stringify(storefrontProducts)
    assert.deepEqual(filterProducts(storefrontProducts, { category: 'phones', brands: ['Apple'], memory: ['128GB'], min: 40000 }).map(row => row.id), ['iphone-purple'])
    assert.equal(filterProducts(storefrontProducts, { brands: ['NVIDIA'], max: 80000 })[0].id, 'rtx-5080')
    assert.equal(filterProducts(storefrontProducts, { min: 90000, max: 10000 }).length, 0)
    assert.equal(filterProducts(storefrontProducts, { query: 'unknown' }).length, 0)
    assert.equal(productBrand(storefrontProducts[2]), 'Sony')
    assert.equal(paginateCatalog(storefrontProducts, 1).rows.length, 6)
    assert.equal(paginateCatalog(storefrontProducts, 99).page, 2)
    assert.equal(paginateCatalog([], 99).page, 1)
    assert.equal(JSON.stringify(storefrontProducts), before)
    const { renderProducts } = await server.ssrLoadModule('/scripts/landing-render-check.tsx')
    const html = renderProducts('/products?category=phones')
    assert.ok(html.includes('Selected products:'))
    assert.equal((html.match(/class="shop-product"/g) ?? []).length, 4)
    assert.ok(html.includes('Minimum price in PHP'))
    assert.ok(!html.includes('Buy Now'))
  } finally { await server.close() }
})
