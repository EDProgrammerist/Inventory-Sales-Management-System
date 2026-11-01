import assert from 'node:assert/strict'
import {test} from 'node:test'
import {createServer} from 'vite'

test('customer sessions cannot render workspace content; admin sessions can',async()=>{
 const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',logLevel:'error'})
 try {
  const {renderAuthGuard}=await server.ssrLoadModule('/scripts/product-render-check.tsx')
  const user={id:'test-only',email:'isolated@example.test',name:'Isolated',role:'USER'}
  assert.ok(!renderAuthGuard({user,loading:false,error:''}).includes('Private workspace content'))
  assert.ok(renderAuthGuard({user:{...user,role:'ADMIN'},loading:false,error:''}).includes('Private workspace content'))
 } finally {await server.close()}
})
