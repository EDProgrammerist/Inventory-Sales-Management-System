import { index, pgTable, text, uuid, pgEnum, timestamp, jsonb, primaryKey, uniqueIndex } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const role = pgEnum('Role', ['USER', 'ADMIN'])
export const tokenType = pgEnum('TokenType', ['REFRESH', 'EMAIL_VERIFY'])
export const users = pgTable('user', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  password: text('password'),
  role: role('role').default('USER').notNull(),
  emailVerified: timestamp('email_verified', { withTimezone: true, mode: 'string' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date().toISOString()),
})

export const tokens = pgTable(
  'token',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    type: tokenType('type').notNull(),
    token: text('token').unique().notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    consumedAt: timestamp('consumed_at', { withTimezone: true, mode: 'string' }),
    revokedAt: timestamp('revoked_at', { withTimezone: true, mode: 'string' }),
  },
  (table) => [index('token_owner_type_idx').on(table.userId, table.type)],
)

export const items = pgTable(
  'item',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    name: text('name').notNull(),
    description: text('description'),
  },
  (table) => [index('item_user_id_idx').on(table.userId)],
)

// Flexible form payloads, with account ownership and uniqueness enforced in PostgreSQL.
export const workspaceRecords = pgTable('workspace_record', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(),
  id: text('id').notNull(),
  data: jsonb('data').$type<Record<string, unknown>>().notNull(),
  events: jsonb('events').$type<{ id: string; productId: string; kind: 'created' | 'updated'; at: string }[]>().default([]).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.kind, table.id] }),
  uniqueIndex('workspace_product_name_unique').on(table.userId, sql`lower(${table.data}->>'name')`).where(sql`${table.kind} = 'products'`),
  uniqueIndex('workspace_product_sku_unique').on(table.userId, sql`lower(${table.data}->>'sku')`).where(sql`${table.kind} = 'products'`),
  uniqueIndex('workspace_supplier_unique').on(table.userId, sql`lower(${table.data}->>'email')`, sql`lower(${table.data}->>'product')`).where(sql`${table.kind} = 'suppliers'`),
  uniqueIndex('workspace_store_branch_unique').on(table.userId, sql`lower(${table.data}->>'branch')`).where(sql`${table.kind} = 'stores'`),
])
