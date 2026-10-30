import assert from 'node:assert/strict'
import { test } from 'node:test'
import { reportProducts, reportCategories, reportOverview, reportTrendForPeriod, filterReportProducts, filterReportCategories, reportMoney, reportTrendCsv, reportProductsCsv, reportCategoriesCsv } from '../src/data/reports-demo.ts'
import { reportProducts as productFixtures, reportCategories as categoryFixtures } from './fixtures/reference-data.ts'
import { smoothLinePath } from '../src/lib/chart-path.ts'
import { toCsv } from '../src/data/csv.ts'

test('reports start with no seeded products or categories and zero summary values',()=>{
 assert.deepEqual(reportProducts,[])
 assert.deepEqual(reportCategories,[])
 assert.ok(Object.values(reportOverview).every(value=>value===0))
 for(const query of ['', 'tomato','23567','households']) {assert.deepEqual(filterReportProducts(query),[]);assert.deepEqual(filterReportCategories(query),[])}
 assert.equal(reportMoney(117432),'\u20b1117,432.00')
 assert.equal(reportMoney(125.5),'\u20b1125.50')
 assert.equal(reportMoney(0),'\u20b10.00')
})
test('monthly and quarterly charts contain no sample revenue or profit',()=>{
 for(const period of ['monthly','quarterly'])assert.ok(reportTrendForPeriod(period).every(row=>row.revenue===0 && row.profit===0))
})
test('report CSV helpers still export supplied rows and protect formula-like values',()=>{
 assert.equal(reportTrendCsv('monthly').split('\r\n').length,8)
 assert.equal(reportProductsCsv(productFixtures).split('\r\n').length,5)
 assert.equal(reportCategoriesCsv(categoryFixtures).split('\r\n').length,4)
 assert.equal(reportProductsCsv(reportProducts).split('\r\n').length,1)
 assert.equal(toCsv([['=SUM(A1:A2)',-42]]),'"\'=SUM(A1:A2)","-42"')
})
test('smooth chart paths support empty and single-point data',()=>{
 assert.equal(smoothLinePath([]),'')
 assert.ok(!smoothLinePath([{x:1,y:2}]).includes('NaN'))
 const path=smoothLinePath([{x:0,y:2},{x:5,y:10},{x:10,y:4}])
 assert.ok(path.startsWith('M 0 2'))
 assert.ok(path.endsWith('10 4'))
})
