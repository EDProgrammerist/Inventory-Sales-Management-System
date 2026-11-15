import assert from 'node:assert/strict'
import {test} from 'node:test'
import {readFile, access} from 'node:fs/promises'
import {createServer} from 'vite'

test('production account, catalog, and management requests stay on the frontend origin',async()=>{
 const server=await createServer({define:{'import.meta.env.PROD':true,'import.meta.env.VITE_API_BASE_URL':JSON.stringify('https://wrong-backend.example/api')},server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',logLevel:'error'})
 const originalFetch=globalThis.fetch
 const calls=[]
 try {
  globalThis.fetch=async(url,options)=>{
   calls.push({url,options})
   if(url==='/api/auth/v1/csrf-token')return Response.json({data:{csrfToken:'deployment-test'}})
   return Response.json({data:{products:[]}})
  }
  const {getCsrfToken}=await server.ssrLoadModule('/src/services/auth.ts')
  const {loadCatalog}=await server.ssrLoadModule('/src/services/catalog.ts')
  const {apiRequest}=await server.ssrLoadModule('/src/services/api.ts')
  assert.equal(await getCsrfToken(),'deployment-test')
  assert.deepEqual(await loadCatalog(new AbortController().signal),[])
  await apiRequest('/catalog/v1/admin/products','POST',{id:'isolated'})
  assert.ok(calls.every(call=>call.url.startsWith('/api/')))
  assert.equal(calls.find(call=>call.url.endsWith('/catalog/v1/products')).options.credentials,'omit')
  const write=calls.find(call=>call.options.method==='POST')
  assert.equal(write.options.credentials,'include')
  assert.equal(write.options.headers['x-csrf-token'],'deployment-test')
 }finally{globalThis.fetch=originalFetch;await server.close()}
})

test('Vercel uses a static Render rewrite ahead of the SPA fallback',async()=>{
 const config=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8'))
 assert.equal(config.framework,'vite')
 assert.equal(config.outputDirectory,'dist')
 assert.deepEqual(config.rewrites,[
  {source:'/api/:path*',destination:'https://inventory-sales-management-system-vwwv.onrender.com/api/:path*'},
  {source:'/(.*)',destination:'/index.html'},
 ])
 assert.ok(config.rewrites.every(row=>typeof row.destination==='string'&&row.destination.length>0))
 assert.ok(config.headers.find(row=>row.source==='/api/:path*').headers.some(header=>header.key==='Cache-Control'&&header.value.includes('no-store')))
 await assert.rejects(access(new URL('../vercel.mjs',import.meta.url)),{code:'ENOENT'})
})
