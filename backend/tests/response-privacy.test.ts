import assert from 'node:assert/strict'
import {test} from 'node:test'
import {orderView} from '@/views/customer-order.view'
import {catalogView,adminCatalogView,type CatalogRow} from '@/views/catalog.view'
import type {customerOrders} from '@/db/schema'

test('customer order responses exclude ownership, retry identity and request hashes',()=>{
  const order={id:'isolated',userId:'private-owner',idempotencyKey:'private-attempt',requestHash:'private-hash',items:[],address:{name:'Isolated',address:'Isolated address',phone:'09170000000'},shipping:{method:'standard',date:''},subtotal:'25.50',status:'pending',paymentState:'demo_paid',paidAt:null,createdAt:new Date().toISOString(),stockReserved:false} satisfies typeof customerOrders.$inferSelect
  const response=orderView(order)
  assert.equal(response.subtotal,25.5)
  assert.equal(response.paymentMode,'demo')
  for(const key of ['userId','idempotencyKey','requestHash','stockReserved'])assert.ok(!(key in response))
})

test('public catalog omits administrative fields while the admin response retains edit versions',()=>{
  const row={id:'isolated',ownerId:'private-owner',name:'Isolated',variant:'Manual',category:'phones',price:'25.50',imageKey:'iphone-black',image:null,description:'Isolated response test',featured:false,published:true,stockQuantity:2,threshold:1,version:3,sortOrder:0,createdAt:new Date().toISOString()} satisfies CatalogRow
  const product=catalogView([row]).products[0]
  assert.equal(product.price,25.5)
  for(const key of ['published','stockQuantity','threshold','version','ownerId','sortOrder'])assert.ok(!(key in product))
  const admin=adminCatalogView([row]).products[0]
  assert.equal(admin.stockQuantity,2)
  assert.equal(admin.version,3)
})
