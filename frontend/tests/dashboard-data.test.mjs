import { topStock, lowStock } from './fixtures/reference-data.ts'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { activityForPeriod, filterStock } from '../src/data/dashboard-demo.ts'

test('quarterly grouping preserves totals and marks the incomplete final quarter', () => {
  const quarterly = activityForPeriod('quarterly')
  assert.equal(quarterly.length, 4)
  assert.deepEqual(quarterly[0], { month: 'Q1', purchase: 0, sales: 0, ordered: 0, delivered: 0 })
  assert.equal(quarterly[3].month, 'Q4 to date')
  assert.equal(quarterly[3].purchase, 0)
  for (const key of ['purchase', 'sales', 'ordered', 'delivered']) {
    assert.equal(quarterly.reduce((sum, row) => sum + row[key], 0), activityForPeriod('monthly').reduce((sum, row) => sum + row[key], 0))
  }
})

test('product search ignores case and surrounding whitespace', () => {
  assert.deepEqual(filterStock(topStock, '  SURF  ').map((row) => row.name), ['Surf Excel'])
  assert.deepEqual(filterStock(lowStock, 'salt').map((row) => row.name), ['Tata Salt'])
})

test('empty search returns all products and a missing name returns none', () => {
  assert.equal(filterStock(topStock, ' ').length, 3)
  assert.deepEqual(filterStock(topStock, 'not-a-product'), [])
})

test('filtering and aggregation leave the reference data unchanged', () => {
  const before = JSON.stringify({ monthly: activityForPeriod('monthly') })
  filterStock(topStock, 'rin')
  activityForPeriod('quarterly')
  assert.equal(JSON.stringify({ monthly: activityForPeriod('monthly') }), before)
})
