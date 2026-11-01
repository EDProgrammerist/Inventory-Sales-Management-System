import assert from 'node:assert/strict'
import {test} from 'node:test'
import {createServer} from 'vite'

test('only explicit demo card details pass and checkout payload never includes card data',async()=>{
 const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',logLevel:'error'})
 try{
  const {validateDemoCard,buildDemoCheckout,commerceMetrics}=await server.ssrLoadModule('/src/data/customer-orders.ts')
  assert.deepEqual(validateDemoCard({name:'Demo buyer',number:'4242 4242 4242 4242',expiry:'12/30',cvv:'123'},new Date('2026-11-01')), {})
  assert.ok(validateDemoCard({name:'Demo buyer',number:'4111111111111111',expiry:'12/30',cvv:'123'}).number)
  assert.ok(validateDemoCard({name:'Demo buyer',number:'4242424242424242',expiry:'01/20',cvv:'123'}).expiry)
  const product={id:'manual',name:'Manual',variant:'Manual',price:12.5,category:'phones',image:'',description:'Manual',featured:false}
  const payload=buildDemoCheckout('attempt',{'manual':2},[product],{name:'Manual address',address:'Manual test address',phone:'09170000000'},{method:'standard',date:''})
  assert.equal(payload.paymentMethod,'demo-card')
  assert.ok(!/cardNumber|cvv|expiry|4242/.test(JSON.stringify(payload)))
  const order={paymentMode:'demo',paymentState:'demo_paid',status:'pending',subtotal:25,paidAt:'2026-11-01T00:00:00Z'}
  assert.equal(commerceMetrics([product],[order,{...order,status:'cancelled'}]).demoSales,25)
 }finally{await server.close()}
})

test('checkout retry identity survives navigation until the saved order is confirmed',async()=>{
 const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',logLevel:'error'})
 try {
  const {checkoutAttempt}=await server.ssrLoadModule('/src/lib/checkout-attempt.ts')
  const values=new Map(),storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)}
  const payload={idempotencyKey:'',paymentMethod:'demo-card',lines:[{productId:'manual',quantity:1,unitPrice:12}],address:{name:'Isolated',address:'Isolated address',phone:'09170000000'},shipping:{method:'standard',date:''}}
  const first=await checkoutAttempt('isolated-account',payload,storage)
  assert.equal((await checkoutAttempt('isolated-account',payload,storage)).id,first.id)
  assert.ok(!JSON.stringify([...values]).includes('Isolated address'))
  assert.ok(!JSON.stringify([...values]).includes('4242424242424242'))
  first.clear()
  assert.notEqual((await checkoutAttempt('isolated-account',payload,storage)).id,first.id)
 }finally{await server.close()}
})
