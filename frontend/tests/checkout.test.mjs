import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createServer } from 'vite'

test('shipping validates real calendar dates without quoting fees or delivery', async()=>{
 const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',logLevel:'error'})
 try{
  const {validateShipping,checkoutPrerequisite}=await server.ssrLoadModule('/src/data/storefront-checkout.ts')
  assert.equal(validateShipping({method:'standard',date:''},'2026-11-01'),null)
  assert.equal(validateShipping({method:'express',date:''},'2026-11-01'),null)
  assert.ok(validateShipping({method:'scheduled',date:''},'2026-11-01'))
  assert.ok(validateShipping({method:'scheduled',date:'2026-02-30'},'2026-11-01'))
  assert.ok(validateShipping({method:'scheduled',date:'2026-10-31'},'2026-11-01'))
  assert.equal(validateShipping({method:'scheduled',date:'2026-11-02'},'2026-11-01'),null)
  assert.ok(validateShipping({method:'unknown',date:''},'2026-11-01'))
  assert.equal(checkoutPrerequisite(0,null),'cart')
  assert.equal(checkoutPrerequisite(1,null),'address')
  assert.equal(checkoutPrerequisite(1,{id:'manual'}),null)
 }finally{await server.close()}
})

test('shipping/payment render missing prerequisites and explicitly simulated payment',async()=>{
 const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',logLevel:'error'})
 try{
  const {renderCheckout}=await server.ssrLoadModule('/scripts/landing-render-check.tsx')
  const shipping=renderCheckout('shipping'),payment=renderCheckout('payment')
  assert.ok(shipping.includes('Shipment Method'))
  assert.ok(shipping.includes('Not quoted'))
  assert.ok(shipping.includes('Add a product to your cart'))
  assert.ok(!shipping.includes('17 Oct')&&!shipping.includes('$8.50')&&!shipping.includes('Free shipping'))
  assert.ok(payment.includes('Payment'))
  assert.ok(payment.includes('Demo card payment'))
  assert.ok(payment.includes('Place demo order'))
  assert.ok(payment.includes('4242 4242 4242 4242'))
  assert.ok(!/4085|9536|Payment successful|Order confirmed/.test(payment))
  assert.equal((payment.match(/<h1[ >]/g)??[]).length,1)
 }finally{await server.close()}
})
