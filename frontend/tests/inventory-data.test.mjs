import assert from 'node:assert/strict'
import { test } from 'node:test'
import { inventoryProducts, selectProducts, paginateProducts, validateProduct, inventoryCsv, displayExpiry } from '../src/data/inventory-demo.ts'

const validInput = { name: 'Oat Biscuits', price: '125.50', quantity: '12', threshold: '5', expiry: '2027-05-21' }

test('search and availability filters compose without changing reference records', () => {
  assert.deepEqual(selectProducts(inventoryProducts, ' BRU ', 'out-of-stock').map((row) => row.name), ['Bru'])
  assert.equal(selectProducts(inventoryProducts, 'bru', 'in-stock').length, 0)
  assert.equal(selectProducts(inventoryProducts, '', 'out-of-stock').length, 3)
  assert.equal(inventoryProducts[1].quantity, 22)
})
test('pagination clamps pages and supports empty results and newly added rows', () => {
  assert.deepEqual(paginateProducts([], 10), { page: 1, totalPages: 1, rows: [] })
  assert.equal(paginateProducts(inventoryProducts, 99).page, 1)
  const extra = { ...inventoryProducts[0], id: 'extra' }
  assert.deepEqual(paginateProducts([...inventoryProducts, extra], 2).rows, [extra])
})
test('product validation rejects duplicates, malformed amounts, fractional counts, and invalid dates', () => {
  for (const input of [{ name: ' maggi ' }, { price: '' }, { price: '1.234' }, { price: '-4' }, { quantity: '2.5' }, { threshold: '' }, { expiry: '2027-02-30' }]) {
    assert.equal(validateProduct({ ...validInput, ...input }, inventoryProducts).valid, false)
  }
})
test('new product availability is calculated at zero and threshold boundaries', () => {
  for (const [quantity, expected] of [['0', 'out-of-stock'], ['5', 'low-stock'], ['6', 'in-stock']]) {
    const result = validateProduct({ ...validInput, quantity }, inventoryProducts)
    assert.equal(result.valid, true)
    assert.equal(result.product.availability, expected)
  }
})
test('CSV quotes names and neutralizes spreadsheet formulas', () => {
  const csv = inventoryCsv([{ ...inventoryProducts[0], name: '=HYPERLINK("example")' }])
  assert.ok(csv.includes('"\'=HYPERLINK(""example"")"'))
  assert.equal(csv.split('\r\n').length, 2)
})
test('reference expiry dates retain day/month/year display', () => {
  assert.equal(displayExpiry('2022-12-05'), '5/12/22')
})
