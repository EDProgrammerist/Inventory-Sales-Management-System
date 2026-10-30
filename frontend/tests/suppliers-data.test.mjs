import assert from 'node:assert/strict'
import { test } from 'node:test'
import { supplierFixtures, supplierPageSize, selectSuppliers, validateSupplier, suppliersCsv } from '../src/data/suppliers-demo.ts'
import { paginateRows } from '../src/data/pagination.ts'

const valid = { name: 'Marina Wholesale', product: 'Oat Biscuits', category: 'Groceries', price: '125.50', phone: '+63 917 846 2053', email: 'orders@marinawholesale.example', type: 'taking-return' }

test('suppliers start empty with no reference records', () => {
  assert.deepEqual(supplierFixtures, [])
  assert.deepEqual(selectSuppliers(supplierFixtures, ''), [])
  assert.deepEqual(paginateRows(supplierFixtures, 9, supplierPageSize), { page: 1, totalPages: 1, rows: [] })
  assert.equal(suppliersCsv(supplierFixtures).split('\r\n').length, 1)
})

test('supplier validation normalizes manually supplied contacts', () => {
  const result = validateSupplier({ ...valid, name: ` ${valid.name} `, email: valid.email.toUpperCase() }, [])
  assert.equal(result.valid, true)
  assert.equal(result.supplier.name, valid.name)
  assert.equal(result.supplier.email, valid.email)
  assert.equal(result.supplier.price, 125.5)
  assert.equal(result.supplier.onWay, null)
})

test('supplier validation rejects invalid fields and repeated supplier/product combinations', () => {
  for (const change of [{ name: '' }, { product: ' ' }, { category: 'unknown' }, { price: '0' }, { price: '12.345' }, { phone: 'abc1234567' }, { phone: '123' }, { email: 'invalid' }, { type: '' }, { type: 'unspecified' }]) assert.equal(validateSupplier({ ...valid, ...change }, []).valid, false)
  const result = validateSupplier(valid, [])
  assert.equal(result.valid, true)
  assert.equal(validateSupplier(valid, [{ ...result.supplier, id: 'manual-entry' }]).valid, false)
})
