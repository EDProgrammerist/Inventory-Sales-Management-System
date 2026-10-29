import assert from 'node:assert/strict'
import { test } from 'node:test'
import { supplierFixtures, supplierPageSize, selectSuppliers, validateSupplier, suppliersCsv } from '../src/data/suppliers-demo.ts'
import { paginateRows } from '../src/data/pagination.ts'

const valid = { name: 'Marina Wholesale', product: 'Oat Biscuits', category: 'Groceries', price: '125.50', phone: '+63 917 846 2053', email: 'orders@marinawholesale.example', type: 'taking-return' }

test('supplier fixtures retain all reference rows with unique internal identities and unknown type', () => {
  assert.equal(supplierFixtures.length, 14)
  assert.equal(new Set(supplierFixtures.map((row) => row.id)).size, 14)
  assert.equal(supplierFixtures.filter((row) => row.name === 'Joe Nike').length, 4)
  assert.equal(supplierFixtures.find((row) => row.id === 'dender-a').type, 'unspecified')
})

test('supplier search covers name, product, email, and formatted phone without changing records', () => {
  const before = JSON.stringify(supplierFixtures)
  assert.equal(selectSuppliers(supplierFixtures, ' RICHARD ')[0].product, 'Kit Kat')
  assert.equal(selectSuppliers(supplierFixtures, 'apple').length, 2)
  assert.equal(selectSuppliers(supplierFixtures, 'tomhoman@gmail.com')[0].name, 'Tom Homan')
  assert.equal(selectSuppliers(supplierFixtures, '768 776 4556')[0].name, 'Richard Martin')
  assert.equal(selectSuppliers(supplierFixtures, 'missing-contact').length, 0)
  assert.equal(JSON.stringify(supplierFixtures), before)
})

test('return and incoming-product filters combine correctly', () => {
  assert.equal(selectSuppliers(supplierFixtures, '', 'not-taking-return').length, 3)
  assert.equal(selectSuppliers(supplierFixtures, '', 'not-taking-return', true).length, 2)
  assert.equal(selectSuppliers(supplierFixtures, '', 'unspecified', true).length, 1)
  assert.equal(selectSuppliers(supplierFixtures, 'Tom Homan', 'taking-return', true).length, 0)
})

test('supplier validation normalizes contacts and leaves incoming quantities unrecorded', () => {
  const result = validateSupplier({ ...valid, name: ' Marina Wholesale ', email: ' ORDERS@MARINAWHOLESALE.EXAMPLE ' }, supplierFixtures)
  assert.equal(result.valid, true)
  assert.equal(result.supplier.name, 'Marina Wholesale')
  assert.equal(result.supplier.email, 'orders@marinawholesale.example')
  assert.equal(result.supplier.phone, '+63 917 846 2053')
  assert.equal(result.supplier.price, 125.5)
  assert.equal(result.supplier.onWay, null)
})

test('supplier validation rejects invalid fields and repeated supplier/product combinations', () => {
  for (const change of [{ name: '' }, { product: ' ' }, { category: 'unknown' }, { price: '0' }, { price: '12.345' }, { phone: 'abc1234567' }, { phone: '123' }, { email: 'invalid' }, { type: '' }, { type: 'unspecified' }]) assert.equal(validateSupplier({ ...valid, ...change }, supplierFixtures).valid, false)
  assert.equal(validateSupplier({ ...valid, email: 'RICHARD@gmail.com', product: 'kit kat' }, supplierFixtures).valid, false)
  assert.equal(validateSupplier({ ...valid, email: 'RICHARD@gmail.com', product: 'Oat Biscuits' }, supplierFixtures).valid, true)
})

test('supplier pagination uses actual rows and advances for a fifteenth supplier', () => {
  assert.equal(paginateRows(supplierFixtures, 99, supplierPageSize).page, 1)
  assert.deepEqual(paginateRows([], 9, supplierPageSize), { page: 1, totalPages: 1, rows: [] })
  const added = { ...supplierFixtures[0], id: 'added' }
  assert.deepEqual(paginateRows([...supplierFixtures, added], 2, supplierPageSize).rows, [added])
  assert.throws(() => paginateRows([], 1, 0), /positive integer/)
})

test('supplier CSV keeps repeated records and safely escapes supplier names', () => {
  assert.equal(suppliersCsv(supplierFixtures).split('\r\n').length, 15)
  const csv = suppliersCsv([{ ...supplierFixtures[0], name: '=SUPPLIER("test")' }])
  assert.ok(csv.includes('"\'=SUPPLIER(""test"")"'))
  assert.ok(csv.includes('"7687764556","richard@gmail.com"'))
})
