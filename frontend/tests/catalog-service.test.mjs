import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createServer } from 'vite'

test('catalog responses supply dynamic prices and reject malformed/duplicate/unknown images', async () => {
  const server = await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',logLevel:'error'})
  try {
    const { decodeCatalog } = await server.ssrLoadModule('/src/data/storefront-catalog.ts')
    const { cartSummary } = await server.ssrLoadModule('/src/data/storefront-cart.ts')
    const row = { id:'iphone-purple', name:'Database name', variant:'128GB · Deep Purple', category:'phones', price:123.45, imageKey:'iphone-purple', description:'Database description', featured:true }
    const catalog = decodeCatalog({products:[row]})
    assert.equal(catalog[0].name, 'Database name')
    assert.equal(cartSummary({'iphone-purple':2}, catalog).subtotal, 246.9)
    assert.deepEqual(decodeCatalog({products:[]}), [])
    for (const products of [[{...row,price:-1}], [{...row,price:'123'}], [{...row,imageKey:'../../secret'}], [row,row], [{...row,category:'invalid'}]]) assert.throws(() => decodeCatalog({products}))
  } finally { await server.close() }
})

test('catalog loading uses the API without credentials or a hardcoded fallback', async () => {
  const server = await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',logLevel:'error'})
  try {
    const {loadCatalog} = await server.ssrLoadModule('/src/services/catalog.ts')
    const controller = new AbortController()
    const calls=[]
    const products=await loadCatalog(controller.signal, async (url,options) => {
      calls.push({url,options})
      return new Response(JSON.stringify({status:'success',data:{products:[]}}),{status:200})
    })
    assert.deepEqual(products,[])
    assert.ok(calls[0].url.endsWith('/catalog/v1/products'))
    assert.equal(calls[0].options.credentials,'omit')
    assert.equal(calls[0].options.cache,'no-store')
    await assert.rejects(loadCatalog(controller.signal, async()=>new Response('{}',{status:503})),/unavailable/)
    await assert.rejects(loadCatalog(controller.signal, async()=>{throw new Error('offline')}),/Unable to load products/)
    await assert.rejects(loadCatalog(controller.signal, async()=>new Response('{',{status:200})),/invalid response/)
  } finally {await server.close()}
})
