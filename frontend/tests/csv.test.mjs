import assert from 'node:assert/strict'
import {test} from 'node:test'
import {toCsv} from '../src/data/csv.ts'

test('CSV exports escape quotes, delimiters, newlines and spreadsheet formulas',()=>{
  assert.equal(toCsv([['=SUM(A1:A2)',-42]]),'"\'=SUM(A1:A2)","-42"')
  assert.equal(toCsv([['a,b','say "yes"','two\nlines']]),'"a,b","say ""yes""","two\nlines"')
})
