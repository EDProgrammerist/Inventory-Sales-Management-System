import { storeFixtures } from './fixtures/reference-data.ts'
import { orderFixtures } from '../src/data/orders-demo.ts'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { selectOrders, validateOrder, createOrder, displayOrderDate, ordersCsv, validateNewOrder, createNewOrder } from '../src/data/orders-demo.ts'
import { selectStores, validateStore } from '../src/data/stores-demo.ts'
import { paginateRows } from '../src/data/pagination.ts'

const validOrder = { id: 'PO-2026-48', product: 'Oat Biscuits', value: '125.50', quantity: '20', expected: '2026-11-03' }
const validStore = { branch: 'Peelamedu Branch', name: 'Lisy Store', address: '42 Avinashi Road', city: 'Coimbatore - 641004', phone: '+91 422 256 1234' }
const referenceOrder = {...validOrder,productId:' BIS-48 ',category:'Groceries',unit:' Boxes ',buyingPrice:'6.25',notifyOnDelivery:'on'}

test('reference order form validates category, product ID, custom unit, and buying price', () => {
  assert.deepEqual(validateNewOrder(referenceOrder),{})
  for (const change of [{productId:''},{productId:'invalid id'},{category:'unknown'},{unit:' '},{unit:'x'.repeat(31)},{buyingPrice:'0'},{buyingPrice:'12.345'},{expected:'2026-02-30'},{quantity:'2.5'},{value:''}]) assert.ok(Object.keys(validateNewOrder({...referenceOrder,...change})).length)
})
test('reference order preserves metadata, separates product and order IDs, and saves checkbox preferences', () => {
  const next = createNewOrder(referenceOrder,'generated-order-id')
  assert.equal(next.id,'generated-order-id')
  assert.equal(next.productId,'BIS-48')
  assert.equal(next.category,'Groceries')
  assert.equal(next.unit,'Boxes')
  assert.equal(next.buyingPrice,6.25)
  assert.equal(next.notifyOnDelivery,true)
  assert.equal(createNewOrder({...referenceOrder,notifyOnDelivery:''},'other-id').notifyOnDelivery,false)
  assert.equal(selectOrders([next],'BIS-48')[0].id,next.id)
  assert.equal(selectOrders([next],'groceries','Confirmed').length,1)
})
test('order CSV exports reference form metadata without inventing missing fixture details', () => {
  const csv = ordersCsv([createNewOrder(referenceOrder,'generated-order-id')])
  assert.ok(csv.includes('"BIS-48","Groceries","6.25","Yes"'))
  assert.ok(ordersCsv(orderFixtures).split('\r\n').length === 1)
})

test('orders start empty with no reference records', () => {
  assert.deepEqual(orderFixtures, [])
  assert.deepEqual(selectOrders(orderFixtures, ''), [])
  assert.equal(displayOrderDate('2023-01-09'), '9/1/23')
})

test('order validation rejects duplicate IDs, invalid dates, amounts and fractional quantities', () => {
  assert.deepEqual(validateOrder(validOrder, orderFixtures), {})
  for (const change of [{ id:' ' },{ product:' ' },{ value:'-1' },{ value:'12.345' },{ quantity:'1.5' },{ quantity:'0' },{ expected:'2026-02-30' },{ expected:'' }]) assert.ok(Object.keys(validateOrder({...validOrder,...change},orderFixtures)).length)
  const order = createOrder({...validOrder,product:' Oat Biscuits '})
  assert.equal(order.product, 'Oat Biscuits')
  assert.equal(order.status, 'Confirmed')
  assert.equal(order.value, 125.5)
  assert.equal(paginateRows([...orderFixtures,order],1,9).rows[0].id,validOrder.id)
})
test('order CSV contains complete records and protects formula-like product names', () => {
  assert.equal(ordersCsv(orderFixtures).split('\r\n').length,1)
  assert.ok(ordersCsv([{...createOrder(validOrder),product:'=1+1'}]).includes('"\'=1+1"'))
})
test('stores preserve all reference branches and search addresses and contact details', () => {
  assert.equal(storeFixtures.length,3)
  assert.equal(selectStores(storeFixtures,' singanallur ')[0].id,'singanallur')
  assert.equal(selectStores(storeFixtures,'Ramani')[0].branch,'Slur Branch')
  assert.equal(selectStores(storeFixtures,'653763').length,1)
  assert.equal(selectStores(storeFixtures,'missing').length,0)
})
test('store validation rejects empty fields, duplicate branches and invalid phones while allowing edits', () => {
  assert.deepEqual(validateStore(validStore,storeFixtures),{})
  const existing = storeFixtures[0]
  assert.deepEqual(validateStore({...existing},storeFixtures,existing.id),{})
  assert.ok(validateStore({...validStore,branch:' singanallur BRANCH '},storeFixtures).branch)
  for (const key of ['branch','name','address','city','phone']) assert.ok(validateStore({...validStore,[key]:''},storeFixtures)[key])
  assert.ok(validateStore({...validStore,phone:'call 12345678'},storeFixtures).phone)
})
