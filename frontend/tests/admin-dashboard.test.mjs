import assert from 'node:assert/strict'
import {test} from 'node:test'
import {createServer} from 'vite'

test('reference dashboard derives sales rankings and stock summaries from saved commerce data',async()=>{
 const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',logLevel:'error'})
 try{
  const {dashboardStock,orderTrend}=await server.ssrLoadModule('/src/data/admin-dashboard.ts')
  const products=[{id:'known',name:'Known',variant:'Manual',stockQuantity:0,threshold:1,price:10},{id:'unknown',name:'Unknown',variant:'Manual',stockQuantity:null,threshold:0,price:20}]
  const order={id:'isolated',paymentMode:'demo',paymentState:'demo_paid',status:'delivered',createdAt:'2026-03-10T10:00:00Z',items:[{productId:'known',name:'Known',variant:'Manual',quantity:2,unitPrice:10,total:20}]}
  const snapshot=dashboardStock(products,[order,{...order,id:'cancelled',status:'cancelled',paymentState:'cancelled'}])
  assert.equal(snapshot.knownUnits,0);assert.equal(snapshot.unknown,1)
  assert.deepEqual(snapshot.low.map(item=>item.id),['known'])
  assert.equal(snapshot.top[0].sold,2)
  assert.equal(orderTrend([order],2026)[2].ordered,2)
  assert.equal(orderTrend([order],2026)[2].delivered,2)
  assert.deepEqual(dashboardStock([],[]),{knownUnits:0,knownProducts:0,unknown:0,low:[],top:[]})
 }finally{await server.close()}
})

test('restored product information is a detail page with real catalog fields and accessible reference tabs',async()=>{
 const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',logLevel:'error'})
 try{
  const {renderCommerceRoute}=await server.ssrLoadModule('/scripts/commerce-render-check.tsx')
  const html=renderCommerceRoute('/inventory/ps5-digital')
  for(const label of ['Primary Details','Supplier Details','Stock Locations','Digital edition','Remaining Stock','No purchases yet','No separate adjustment log','Product History'])assert.ok(html.includes(label),label)
  assert.equal((html.match(/role="tab"/g)??[]).length,4)
  assert.equal((html.match(/role="tabpanel"/g)??[]).length,4)
  assert.ok(html.includes('ps5-digital-console.jpg'))
  assert.ok(!html.includes('class="commerce-form"'),'Opening a product should show details, not the list editor')
  assert.ok(!html.includes('Maggi'))
  assert.ok(renderCommerceRoute('/inventory/missing-product').includes('Product not found'))
  const dashboard=renderCommerceRoute('/dashboard')
  for(const title of ['Sales Overview','Inventory Summary','Order Overview','Product Summary','Order Summary','Top Selling Stock','Low Quantity Stock'])assert.ok(dashboard.includes(title),title)
  assert.ok(dashboard.includes('Not set'),'Unknown stock must not become zero')
 }finally{await server.close()}
})
