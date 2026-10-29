import assert from 'node:assert/strict'
import { test } from 'node:test'
import { reportProducts, reportCategories, reportOverview, reportTrendForPeriod, filterReportProducts, filterReportCategories, reportMoney, reportTrendCsv, reportProductsCsv, reportCategoriesCsv } from '../src/data/reports-demo.ts'
import { smoothLinePath } from '../src/lib/chart-path.ts'
import { toCsv } from '../src/data/csv.ts'

test('report fixtures retain distinct rows even when reference product IDs repeat', () => {
  assert.equal(reportProducts.length, 4)
  assert.equal(new Set(reportProducts.map((row) => row.id)).size, 4)
  assert.equal(filterReportProducts('23567').length, 2)
  assert.equal(reportOverview.netPurchase, 117432)
  assert.equal(reportMoney(117432), '$1,17,432')
})

test('report product search composes with category filters and supports household labels', () => {
  assert.deepEqual(filterReportProducts(' TOMATO ', 'vegetables').map((row) => row.name), ['Tomato'])
  assert.equal(filterReportProducts('tomato', 'instant-food').length, 0)
  assert.deepEqual(filterReportProducts('households').map((row) => row.name), ['Surf Excel'])
  assert.equal(filterReportProducts('not-a-product').length, 0)
})

test('category search follows matching products without mutating report fixtures', () => {
  const before = JSON.stringify({ reportProducts, reportCategories })
  assert.deepEqual(filterReportCategories('Maggi').map((row) => row.name), ['Instant Food'])
  assert.deepEqual(filterReportCategories('Household').map((row) => row.id), ['households'])
  assert.equal(filterReportCategories('missing').length, 0)
  assert.equal(JSON.stringify({ reportProducts, reportCategories }), before)
})

test('quarterly chart grouping preserves totals across the Sep-to-Mar year boundary', () => {
  const monthly = reportTrendForPeriod('monthly')
  const quarterly = reportTrendForPeriod('quarterly')
  assert.deepEqual(quarterly.map((row) => row.period), ['Q3 (Sep)', 'Q4', 'Q1'])
  assert.equal(quarterly[1].revenue, 120000)
  assert.equal(quarterly[2].revenue, 157000)
  for (const key of ['revenue', 'profit']) assert.equal(quarterly.reduce((sum, row) => sum + row[key], 0), monthly.reduce((sum, row) => sum + row[key], 0))
})

test('report CSV exports keep records complete and formula protection preserves numeric negatives', () => {
  assert.equal(reportTrendCsv('monthly').split('\r\n').length, 8)
  assert.equal(reportProductsCsv(reportProducts).split('\r\n').length, 5)
  assert.equal(reportCategoriesCsv(reportCategories).split('\r\n').length, 4)
  assert.ok(reportProductsCsv(reportProducts).includes('"Maggi","56841"'))
  assert.equal(toCsv([['=SUM(A1:A2)', -42]]), '"\'=SUM(A1:A2)","-42"')
})

test('smooth chart paths preserve endpoints and support empty/single-point series', () => {
  assert.equal(smoothLinePath([]), '')
  assert.equal(smoothLinePath([{ x: 2, y: 3 }]), 'M 2 3')
  const path = smoothLinePath([{ x: 0, y: 10 }, { x: 10, y: 20 }, { x: 20, y: 5 }])
  assert.match(path, /^M 0 10 C /)
  assert.match(path, /20 5$/)
  assert.ok(!/NaN|Infinity/.test(path))
})
