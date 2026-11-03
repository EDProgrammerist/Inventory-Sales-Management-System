import assert from 'node:assert/strict'
import {test} from 'node:test'
import {createServer} from 'vite'

test('checkout hides purchase steps from guests, pending sessions and failed session checks',async()=>{
  const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',logLevel:'error'})
  try {
    const {renderCheckoutGuard}=await server.ssrLoadModule('/scripts/product-render-check.tsx')
    const guest={user:null,loading:false,error:''}
    for(const state of [guest,{...guest,signedOut:true},{...guest,loading:true},{...guest,error:'Account service unavailable'}]) {
      assert.ok(!renderCheckoutGuard(state).includes('Authenticated checkout content'))
    }
    assert.match(renderCheckoutGuard({...guest,loading:true}),/Checking your account/)
    assert.match(renderCheckoutGuard({...guest,error:'Account service unavailable'}),/Try again/)
    assert.match(renderCheckoutGuard({...guest,user:{id:'test-customer',name:'Test customer',email:'test@example.com',role:'CUSTOMER'}}),/Authenticated checkout content/)
  } finally {await server.close()}
})
