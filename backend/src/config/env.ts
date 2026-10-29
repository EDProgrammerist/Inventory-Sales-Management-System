import 'dotenv/config'
import { randomBytes } from 'node:crypto'
import { z } from 'zod'

const origin = z.url().refine((value) => new URL(value).origin === value, 'Use an origin without a path or trailing slash')

const settings = z.object({
  APP_NAME: z.string().min(1).default('Kanban API'),
  PORT: z.coerce.number().int().min(1).max(65535).default(7000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  BACKEND_URL: origin.default('http://localhost:7000'),
  FRONTEND_URL: origin.default('http://localhost:5173'),
  JWT_SECRET: z.string().optional(),
  CSRF_SECRET: z.string().optional(),
  DATABASE_URL: z.string().optional(),
}).parse(process.env)

function resolveSecret(value: string | undefined, name: string): string {
  if (value && value.length >= 32 && !value.startsWith('replace_')) return value
  if (settings.NODE_ENV === 'production') throw new Error(`${name} must be a private random secret of at least 32 characters`)
  if (value) throw new Error(`${name} must be at least 32 characters or empty for development`)
  return randomBytes(48).toString('hex')
}

export const ENV = {
  ...settings,
  JWT_SECRET: resolveSecret(settings.JWT_SECRET, 'JWT_SECRET'),
  CSRF_SECRET: resolveSecret(settings.CSRF_SECRET, 'CSRF_SECRET'),
}

if (ENV.JWT_SECRET === ENV.CSRF_SECRET) throw new Error('JWT_SECRET and CSRF_SECRET must be different')
