import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createServer } from 'vite'

test('PS5 editions use distinct supplied console and packaging photos without overriding admin uploads',async()=>{
  const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',logLevel:'error'})
  try{
    const {storefrontProducts}=await server.ssrLoadModule('/scripts/storefront-fixture-data.ts')
    const digital=storefrontProducts.find(product=>product.id==='ps5-digital'),disc=storefrontProducts.find(product=>product.id==='ps5-disc')
    assert.notEqual(digital.image,disc.image)
    for(const product of [digital,disc]){
      assert.equal(product.gallery.length,2)
      assert.equal(product.gallery[0].label,'Console')
      assert.equal(product.gallery[1].label,'Packaging')
      assert.notEqual(product.gallery[0].image,product.gallery[1].image)
    }
    const {decodeCatalog}=await server.ssrLoadModule('/src/data/storefront-catalog.ts')
    const custom='data:image/png;base64,YQ=='
    const uploaded=decodeCatalog({products:[{...digital,imageKey:'ps5',image:custom}]})[0]
    assert.equal(uploaded.image,custom)
    assert.equal(uploaded.gallery,undefined)
  }finally{await server.close()}
})

test('public details resolve every catalog entry with accurate per-model data', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { storefrontProducts } = await server.ssrLoadModule('/scripts/storefront-fixture-data.ts')
    const { getProductDetails, relatedProducts } = await server.ssrLoadModule('/src/data/storefront-details.ts')
    for (const product of storefrontProducts) {
      const detail = getProductDetails(product)
      assert.equal(detail.highlights.length, 6)
      assert.ok(detail.groups.length >= 2)
      assert.ok(detail.source.startsWith('https://'))
      const related = relatedProducts(product, storefrontProducts)
      assert.equal(related.length, 4)
      assert.ok(related.every(item => item.id !== product.id))
      assert.equal(new Set(related.map(item => item.id)).size, 4)
    }
    assert.ok(JSON.stringify(getProductDetails(storefrontProducts[0])).includes('6.7'))
    assert.ok(JSON.stringify(getProductDetails(storefrontProducts[3])).includes('6.1'))
    assert.ok(JSON.stringify(getProductDetails(storefrontProducts[1])).includes('32GB'))
    assert.ok(JSON.stringify(getProductDetails(storefrontProducts[5])).includes('16GB'))
  } finally { await server.close() }
})

test('detail routes show honest review/selection states and recover unknown IDs', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { renderStoreProduct } = await server.ssrLoadModule('/scripts/landing-render-check.tsx')
    const html = renderStoreProduct('iphone-purple')
    assert.ok(html.includes('iPhone 14 Pro Max'))
    assert.ok(html.includes('No reviews yet'))
    assert.ok(html.includes('Add to cart'))
    assert.ok(html.includes('Illustrative display price'))
    assert.ok(!/In Stock|1 year|Free Delivery|Ronald|Buy Now/.test(html))
    assert.ok(html.includes('href="/products/iphone-gold"'))
    assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1)
    const missing = renderStoreProduct('not-a-product')
    assert.ok(missing.includes('Product not found'))
    assert.ok(missing.includes('href="/products"'))
  } finally { await server.close() }
})
