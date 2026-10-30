import { inventoryProducts } from './fixtures/reference-data.ts'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validateProduct, selectProducts } from '../src/data/inventory-demo.ts'
import { createInventoryState, inventoryReducer, productForOverview } from '../src/data/inventory-state.ts'
import { imageFileError } from '../src/data/image-validation.ts'

test('inventory initialization preserves supplied records without reference overrides', () => {
  const supplied = [{ ...inventoryProducts[0], sku: 'CUSTOM-1', unit: 'Boxes', image: undefined }]
  const initial = createInventoryState(supplied)
  assert.deepEqual(initial.products, supplied)
  assert.notEqual(initial.products[0], supplied[0])
  assert.equal(productForOverview(initial.products[0]).quantity, 43)
  assert.equal(productForOverview(initial.products[0]).expiry, '2022-12-11')
  assert.equal(initial.products[0].details, undefined)
  assert.equal(selectProducts(initial.products, 'CUSTOM-1', 'all')[0].id, 'maggi')
})

test('new product fields and image persist in shared inventory state and create history', () => {
  const initial = createInventoryState(inventoryProducts)
  const product = { ...initial.products[1], id: 'added-product', name: 'Oat Biscuits', sku: 'OAT-21', category: 'Groceries', unit: 'Boxes', image: 'data:image/png;base64,example' }
  const next = inventoryReducer(initial, { type: 'add', product, eventId: 'created-event', at: '2026-10-30T01:00:00Z' })
  assert.equal(initial.products.length, 9)
  assert.deepEqual(next.products.at(-1), product)
  assert.equal(next.events[0].kind, 'created')
  assert.equal(next.events[0].productId, product.id)
  assert.equal(inventoryReducer(next, { type: 'add', product: { ...product, id: 'duplicate' }, eventId: 'duplicate', at: '' }), next)
})

test('edits update overview and list consistently and remove outdated stock allocations', () => {
  const initial = createInventoryState(inventoryProducts)
  const product = { ...initial.products[0], quantity: 27, expiry: '2027-04-13' }
  const next = inventoryReducer(initial, { type: 'update', id: 'maggi', product, eventId: 'edit-event', at: '2026-10-30T01:10:00Z' })
  assert.equal(next.products[0].quantity, 27)
  assert.equal(productForOverview(next.products[0]).quantity, 27)
  assert.equal(productForOverview(next.products[0]).expiry, '2027-04-13')
  assert.equal(next.products[0].details.locations, undefined)
  assert.equal(next.products[1], initial.products[1])
  assert.equal(next.events[0].kind, 'updated')
})

test('expanded form validates IDs, category, and unit', () => {
  const initial = createInventoryState(inventoryProducts)
  const input = { name: 'Oat Biscuits', sku: 'OAT-21', category: 'Groceries', unit: 'Boxes', price: '125.50', quantity: '12', threshold: '5', expiry: '2027-05-21' }
  assert.equal(validateProduct(input, initial.products).valid, true)
  const existing = [{ ...initial.products[0], sku: 'EXISTING-1' }]
  for (const changes of [{ sku: '' }, { sku: 'EXISTING-1' }, { category: '' }, { category: 'unknown' }, { unit: ' ' }]) {
    assert.equal(validateProduct({ ...input, ...changes }, existing).valid, false)
  }
})

test('image upload rejects unsupported types, empty files, and oversized files', () => {
  assert.equal(imageFileError({ size: 5 * 1024 * 1024, type: 'image/png' }), undefined)
  assert.ok(imageFileError({ size: 0, type: 'image/png' }))
  assert.ok(imageFileError({ size: 5 * 1024 * 1024 + 1, type: 'image/jpeg' }))
  assert.ok(imageFileError({ size: 100, type: 'image/svg+xml' }))
})
