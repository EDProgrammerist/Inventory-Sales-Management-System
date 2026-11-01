import assert from 'node:assert/strict'
import {test,after} from 'node:test'
import {eq} from 'drizzle-orm'
import {getDatabase,closeDatabase} from '@/db'
import {users,catalogProducts,customerOrders} from '@/db/schema'
import {reserveOrder,cancelDemoOrder,updateFulfillment} from '@/repositories/customer-order.repository'
import {writeCatalog} from '@/repositories/catalog.repository'
import {adminCatalogInput} from '@/schema/catalog.schema'
import {checkoutInput} from '@/schema/customer-order.schema'

after(closeDatabase)
test('Neon rollback verifies catalog editing, server-priced demo orders, retry, stock and ownership', {skip:process.env.COMMERCE_DATABASE_TEST!=='1'},async()=>{
 const db=getDatabase(),rollback=new Error('intentional commerce test rollback'),marker=`isolated-${crypto.randomUUID()}`
 const [admin]=await db.select().from(users).where(eq(users.role,'ADMIN')).limit(1)
 assert.ok(admin,'Use the existing admin; do not seed accounts')
 let orderId=''
 await assert.rejects(db.transaction(async tx=>{
  const productInput=adminCatalogInput.parse({id:marker,name:'Isolated validation product',variant:'Isolated configuration',category:'phones',price:100,imageKey:'iphone-black',description:'Rollback transaction only',featured:false,published:true,stockQuantity:3,threshold:1})
  const added=await writeCatalog(admin.id,productInput,false,tx)
  assert.equal(added.stockQuantity,3)
  const edited=await writeCatalog(admin.id,{...productInput,description:'Changed only inside rollback',expectedVersion:added.version},true,tx)
  assert.equal(edited.description,'Changed only inside rollback')
  assert.equal(await writeCatalog(crypto.randomUUID(),{...productInput,expectedVersion:edited.version},true,tx),undefined)
  const input=checkoutInput.parse({idempotencyKey:crypto.randomUUID(),paymentMethod:'demo-card',lines:[{productId:marker,quantity:2,unitPrice:100}],address:{name:'Isolated test address',address:'Isolated transaction address',phone:'09170000000'},shipping:{method:'standard',date:''}})
  const order=await reserveOrder(admin.id,input,tx);orderId=order.id
  assert.equal(order.paymentState,'demo_paid');assert.equal(order.subtotal,'200.00')
  assert.equal((await reserveOrder(admin.id,input,tx)).id,order.id)
  assert.equal(await writeCatalog(admin.id,{...productInput,description:'Stale edit',expectedVersion:edited.version},true,tx),undefined,'A stale editor cannot restore sold stock')
  assert.equal((await tx.select().from(catalogProducts).where(eq(catalogProducts.id,marker)))[0].stockQuantity,1)
  await assert.rejects(reserveOrder(admin.id,{...input,idempotencyKey:crypto.randomUUID()},tx),/insufficient/i)
  await assert.rejects(reserveOrder(admin.id,{...input,lines:[{...input.lines[0],quantity:1}]},tx),/different order/)
  await assert.rejects(cancelDemoOrder(order.id,crypto.randomUUID(),tx),/not found/i)
  await assert.rejects(updateFulfillment(order.id,'shipped',tx),/next fulfillment/)
  assert.equal((await updateFulfillment(order.id,'confirmed',tx)).status,'confirmed')
  assert.equal((await cancelDemoOrder(order.id,admin.id,tx)).status,'cancelled')
  await cancelDemoOrder(order.id,admin.id,tx)
  assert.equal((await tx.select().from(catalogProducts).where(eq(catalogProducts.id,marker)))[0].stockQuantity,3)
  await tx.update(catalogProducts).set({stockQuantity:null}).where(eq(catalogProducts.id,marker))
  const unknown=await reserveOrder(admin.id,{...input,idempotencyKey:crypto.randomUUID()},tx)
  assert.equal(unknown.items[0].stockReserved,false)
  await cancelDemoOrder(unknown.id,admin.id,tx)
  assert.equal((await tx.select().from(catalogProducts).where(eq(catalogProducts.id,marker)))[0].stockQuantity,null)
  assert.deepEqual((await tx.select().from(users).where(eq(users.id,admin.id)))[0],admin)
  throw rollback
 }),error=>error===rollback)
 assert.deepEqual(await db.select().from(catalogProducts).where(eq(catalogProducts.id,marker)),[])
 assert.deepEqual(await db.select().from(customerOrders).where(eq(customerOrders.id,orderId)),[])
})
