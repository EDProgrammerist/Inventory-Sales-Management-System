import { index, pgTable, text, uuid, pgEnum, timestamp } from 'drizzle-orm/pg-core'

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
