// Explicit local QA only. Credentials are supplied through process environment,
// never logged or stored. Every created business record is removed in finally.
import assert from 'node:assert/strict'
import {and,eq} from 'drizzle-orm'
import {getDatabase,closeDatabase} from '@/db'
import {catalogProducts,customerOrders,workspaceRecords,users} from '@/db/schema'

const base='http://localhost:7000/api'
const marker=`hci-qa-${crypto.randomUUID()}`
let access='',refresh='',orderId=''
const db=getDatabase()
let ownerId=''
const createdWorkspace:{kind:string;id:string}[]=[]
async function request(path:string,method='GET',body?:unknown,expected=200){
  const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(access?{Authorization:`Bearer ${access}`}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})})
  assert.equal(response.status,expected,`${method} ${path}: ${response.status}`)
  return (await response.json()).data
}
try{
  assert.ok(process.env.QA_PASSWORD,'Set QA_PASSWORD for the supplied test account')
  const session=await request('/auth/v1/login','POST',{email:process.env.QA_EMAIL??'admin@gmail.com',password:process.env.QA_PASSWORD})
  access=session.accessToken;refresh=session.refreshToken;ownerId=session.user.id
  assert.equal((await request('/auth/v1/session')).user.role,'ADMIN')
  const initialCatalog=await request('/catalog/v1/admin/products')
  const initialOrders=await request('/orders/v1/admin')
  const initialWorkspace=await request('/workspace/v1')
  for(const kind of ['suppliers','stores'] as const){
    const id=crypto.randomUUID()
    const record=kind==='suppliers'?{id,name:marker,product:marker,phone:'09170000000',email:`${marker}@example.test`,type:'taking-return',onWay:null}:{id,name:marker,branch:marker,address:'QA isolated address',city:'QA isolated city',phone:'09170000000'}
    createdWorkspace.push({kind,id})
    await request(`/workspace/v1/${kind}`,'POST',record,201)
    await request(`/workspace/v1/${kind}/${id}`,'PUT',{...record,name:`${marker}-edited`})
    assert.equal((await request('/workspace/v1'))[kind].find((row:{id:string})=>row.id===id).name,`${marker}-edited`)
    await request(`/workspace/v1/${kind}/${id}`,'DELETE')
    assert.ok(!(await request('/workspace/v1'))[kind].some((row:{id:string})=>row.id===id))
    await request(`/workspace/v1/${kind}/${id}`,'DELETE',undefined,404)
  }
  const product={id:marker,name:'HCI QA isolated product',variant:'Test only',category:'phones',price:100,imageKey:'iphone-black',description:'Isolated CRUD verification, removed afterward',featured:false,published:true,stockQuantity:4,threshold:1}
  let row=(await request('/catalog/v1/admin/products','POST',product,201)).product
  row=(await request(`/catalog/v1/admin/products/${marker}`,'PUT',{...product,price:101,expectedVersion:row.version})).product
  await request(`/catalog/v1/admin/products/${marker}`,'DELETE',{expectedVersion:row.version+1},409)
  const checkout={idempotencyKey:crypto.randomUUID(),paymentMethod:'demo-card',lines:[{productId:marker,quantity:1,unitPrice:101}],address:{name:'HCI QA',address:'Isolated verification address',phone:'09170000000'},shipping:{method:'standard',date:''}}
  const order=(await request('/orders/v1','POST',checkout,201)).order;orderId=order.id
  await request(`/orders/v1/admin/${order.id}`,'DELETE',undefined,409)
  await request(`/orders/v1/${order.id}/cancel`,'POST')
  await request(`/orders/v1/admin/${order.id}`,'DELETE')
  assert.ok(!(await request('/orders/v1/admin')).orders.some((value:{id:string})=>value.id===order.id))
  assert.ok(!(await request('/orders/v1/mine')).orders.some((value:{id:string})=>value.id===order.id))
  await request('/orders/v1','POST',checkout,409)
  row=(await request('/catalog/v1/admin/products')).products.find((value:{id:string})=>value.id===marker)
  assert.equal(row.stockQuantity,4,'Cancellation restores stock; Delete must not restore it twice')
  await request(`/catalog/v1/admin/products/${marker}`,'DELETE',{expectedVersion:row.version},409)
  // Remove only this script's internally retained tombstone, so local QA leaves no record.
  await db.delete(customerOrders).where(and(eq(customerOrders.id,orderId),eq(customerOrders.userId,ownerId)))
  orderId=''
  await request(`/catalog/v1/admin/products/${marker}`,'DELETE',{expectedVersion:row.version})
  assert.deepEqual(await request('/catalog/v1/admin/products'),initialCatalog)
  assert.deepEqual(await request('/orders/v1/admin'),initialOrders)
  assert.deepEqual(await request('/workspace/v1'),initialWorkspace)
  console.log('PASS: authenticated HTTP CRUD, version conflict, protected references, cancelled-order deletion, retry identity and unchanged existing records.')
  // Clean only the two named records created by the accompanying browser checks.
  for(const [kind,field,value] of [['suppliers','email','hci-qa-20261103@example.test'],['stores','branch','HCI QA 20261103 Branch']]){
    const rows=(await request('/workspace/v1'))[kind]
    for(const record of rows)if(record[field]===value&&String(record.name).startsWith('HCI QA 20261103'))await request(`/workspace/v1/${kind}/${encodeURIComponent(record.id)}`,'DELETE')
  }
  console.log('PASS: isolated browser QA records cleaned through authenticated Delete endpoints.')
}finally{
  if(ownerId){
    if(orderId)await db.delete(customerOrders).where(and(eq(customerOrders.id,orderId),eq(customerOrders.userId,ownerId)))
    await db.delete(catalogProducts).where(and(eq(catalogProducts.id,marker),eq(catalogProducts.ownerId,ownerId)))
    for(const row of createdWorkspace)await db.delete(workspaceRecords).where(and(eq(workspaceRecords.userId,ownerId),eq(workspaceRecords.kind,row.kind),eq(workspaceRecords.id,row.id)))
    if(refresh)await request('/auth/v1/logout','POST',{refreshToken:refresh})
  }
  // No accounts are inserted, changed or removed.
  if(ownerId)assert.ok((await db.select({id:users.id}).from(users).where(eq(users.id,ownerId)))[0])
  await closeDatabase()
}
