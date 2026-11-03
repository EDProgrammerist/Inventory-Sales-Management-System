import assert from 'node:assert/strict'
import {test} from 'node:test'
import {createServer} from 'vite'

test('API failures provide recovery messages for HTML, malformed and expired-session responses',async()=>{
  const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',logLevel:'error'})
  const original=globalThis.fetch
  try{
    const {apiRequest}=await server.ssrLoadModule('/src/services/api.ts')
    globalThis.fetch=async()=>new Response('<h1>Proxy unavailable</h1>',{status:502})
    await assert.rejects(apiRequest('/workspace/v1'),/unable to load|unavailable|try again/i)
    globalThis.fetch=async()=>Response.json(null)
    await assert.rejects(apiRequest('/workspace/v1'),/invalid response/i)
    globalThis.fetch=async()=>Response.json({message:'Duplicate branch'},{status:409})
    await assert.rejects(apiRequest('/workspace/v1'),/Duplicate branch/)
    globalThis.fetch=async url=>url.endsWith('csrf-token')?Response.json({data:{csrfToken:'isolated'}}):new Response('',{status:401})
    await assert.rejects(apiRequest('/workspace/v1'),/sign in/i)
    const controller=new AbortController();controller.abort()
    globalThis.fetch=async()=>{throw new Error('Already aborted requests must not reach the network')}
    await assert.rejects(apiRequest('/workspace/v1','GET',undefined,controller.signal),{name:'AbortError'})
    const {getSession}=await server.ssrLoadModule('/src/services/auth.ts')
    globalThis.fetch=async()=>new Response('not-json',{status:200})
    await assert.rejects(getSession(),/account service returned an invalid response/i)
    globalThis.fetch=async()=>Response.json(null)
    await assert.rejects(getSession(),/account service returned an invalid response/i)
  }finally{globalThis.fetch=original;await server.close()}
})

test('missing public URLs explain the problem and offer storefront recovery',async()=>{
  const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',logLevel:'error'})
  try{
    const {renderUnknownRoute}=await server.ssrLoadModule('/scripts/hci-render-check.tsx')
    const html=renderUnknownRoute()
    assert.ok(html.includes('Page not found'))
    assert.ok(html.includes('href="/products"'))
    assert.ok(html.includes('href="/"'))
    assert.ok(!html.includes('Log in to your account'))
    const {renderCartFeedback}=await server.ssrLoadModule('/scripts/hci-render-check.tsx')
    const cart=renderCartFeedback('The cart limit is 9 units per product.')
    assert.match(cart,/<p[^>]*role="status"[^>]*>The cart limit is 9 units per product\.<\/p>/)
  }finally{await server.close()}
})

test('cart feedback matches quantity limits, completion and account reset',async()=>{
  const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',logLevel:'error'})
  try{
    const {cartReducer}=await server.ssrLoadModule('/src/data/storefront-cart.ts')
    let state={bag:{},notice:''}
    for(let index=0;index<9;index++)state=cartReducer(state,{type:'add',id:'manual',label:'Isolated GPU'})
    assert.equal(state.bag.manual,9)
    const capped=cartReducer(state,{type:'add',id:'manual',label:'Isolated GPU'})
    assert.equal(capped.bag.manual,9)
    assert.match(capped.notice,/limit|maximum/i)
    assert.ok(!capped.notice.includes('added'))
    const completed=cartReducer(capped,{type:'complete',quantities:{manual:2}})
    assert.equal(completed.bag.manual,7)
    assert.deepEqual(cartReducer(completed,{type:'reset'}),{bag:{},notice:''})
    const removed=cartReducer(state,{type:'set',id:'manual',label:'Isolated GPU',quantity:0})
    assert.equal(removed.bag.manual,undefined)
    assert.match(removed.notice,/removed/i)
    assert.deepEqual(state.bag,{manual:9},'Reducer must leave previous snapshots unchanged')
  }finally{await server.close()}
})

test('GPU model labels, edition filters and specifications match the approved ASUS cards',async()=>{
  const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',logLevel:'error'})
  try{
    const {storefrontProducts}=await server.ssrLoadModule('/scripts/storefront-fixture-data.ts')
    const {getProductDetails}=await server.ssrLoadModule('/src/data/storefront-details.ts')
    const {filterProducts,productBrand}=await server.ssrLoadModule('/src/data/storefront-filters.ts')
    const gpus=storefrontProducts.filter(product=>product.category==='computers')
    for(const product of gpus){
      assert.ok(product.variant.startsWith('ASUS ROG Astral OC'))
      assert.equal(productBrand(product),'ASUS')
      const detail=getProductDetails(product),text=JSON.stringify(detail)
      assert.ok(text.includes('357.6 mm'))
      assert.ok(text.includes('3.8'))
      assert.ok(!text.includes('Founders Edition'))
      assert.ok(detail.source.startsWith('https://rog.asus.com/'))
      assert.ok(text.includes(product.id==='rtx-5090'?'2.58 GHz':'2.76 GHz'))
    }
    assert.equal(filterProducts(storefrontProducts,{brands:['ASUS'],editions:['ASUS ROG Astral OC']}).length,2)
  }finally{await server.close()}
})
