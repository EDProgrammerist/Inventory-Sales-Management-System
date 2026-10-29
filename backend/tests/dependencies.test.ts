import assert from 'node:assert/strict'
import { test } from 'node:test'
import bcrypt from 'bcrypt'

test('installed bcrypt native package hashes and verifies passwords', async () => {
  const hash = await bcrypt.hash('installation-check-only', 4)
  assert.notEqual(hash, 'installation-check-only')
  assert.equal(await bcrypt.compare('installation-check-only', hash), true)
  assert.equal(await bcrypt.compare('wrong-value', hash), false)
})
