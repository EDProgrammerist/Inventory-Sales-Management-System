import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'

function checkEnvironment(overrides: NodeJS.ProcessEnv) {
  return spawnSync(process.execPath, ['--import', 'tsx', '--eval', "import('./src/config/env.ts')"], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: 'production', JWT_SECRET: '', CSRF_SECRET: '', ...overrides },
    encoding: 'utf8',
  })
}

test('production refuses missing authentication secrets', () => {
  const result = checkEnvironment({})
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /JWT_SECRET must be a private random secret/)
})

test('production refuses using the same secret for JWT and CSRF', () => {
  const result = checkEnvironment({ JWT_SECRET: 'a'.repeat(48), CSRF_SECRET: 'a'.repeat(48) })
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /JWT_SECRET and CSRF_SECRET must be different/)
})

test('production accepts independent secrets and rejects invalid ports', () => {
  const secrets = { JWT_SECRET: 'a'.repeat(48), CSRF_SECRET: 'b'.repeat(48) }
  assert.equal(checkEnvironment(secrets).status, 0)
  assert.notEqual(checkEnvironment({ ...secrets, PORT: '70000' }).status, 0)
})
