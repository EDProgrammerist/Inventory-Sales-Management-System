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


test('catalog loads on browsers without AbortSignal.any or timeout', async () => {
 const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',logLevel:'error'})
 const originalAny=Object.getOwnPropertyDescriptor(AbortSignal,'any')
 const originalTimeout=Object.getOwnPropertyDescriptor(AbortSignal,'timeout')
 try {
  const {loadCatalog}=await server.ssrLoadModule('/src/services/catalog.ts')
  Object.defineProperty(AbortSignal,'any',{value:undefined,configurable:true})
  Object.defineProperty(AbortSignal,'timeout',{value:undefined,configurable:true})
  let called=false
  const result=await loadCatalog(new AbortController().signal,async()=>{
   called=true
   return Response.json({status:'success',data:{products:[]}})
  })
  assert.equal(called,true)
  assert.deepEqual(result,[])
 } finally {
  Object.defineProperty(AbortSignal,'any',originalAny)
  Object.defineProperty(AbortSignal,'timeout',originalTimeout)
  await server.close()
 }
})


test('request timeout and caller cancellation still abort the fetch', async () => {
 const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',logLevel:'error'})
 try {
  const {fetchWithTimeout}=await server.ssrLoadModule('/src/services/fetch-with-timeout.ts')
  const waitingFetch=async(_url,{signal})=>new Promise((_resolve,reject)=>{
   const abort=()=>reject(new DOMException('Aborted','AbortError'))
   if(signal.aborted)abort()
   else signal.addEventListener('abort',abort,{once:true})
  })
  await assert.rejects(fetchWithTimeout('/timeout',{},10,waitingFetch),{name:'AbortError'})
  const caller=new AbortController()
  const pending=fetchWithTimeout('/cancel',{signal:caller.signal},30000,waitingFetch)
  caller.abort()
  await assert.rejects(pending,{name:'AbortError'})
  await assert.rejects(fetchWithTimeout('/already-cancelled',{signal:caller.signal},30000,waitingFetch),{name:'AbortError'})
 } finally {await server.close()}
})
