import { index, pgTable, text, uuid, pgEnum, timestamp, jsonb, primaryKey, uniqueIndex, numeric, integer, boolean, check } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import type {OrderLine,OrderAddress,OrderShipping} from '@/models/customer-order.model'

export const role = pgEnum('Role', ['USER', 'ADMIN'])
export const catalogCategory = pgEnum('CatalogCategory', ['phones', 'computers', 'consoles'])
export const customerOrderStatus = pgEnum('CustomerOrderStatus',['pending','confirmed','processing','shipped','delivered','cancelled'])
export const orderPaymentState = pgEnum('OrderPaymentState',['demo_paid','cancelled'])
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

// Public display catalog; no fabricated stock, expiry, or fulfillment information.
export const catalogProducts = pgTable('catalog_product', {
  id: text('id').primaryKey(),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  variant: text('variant').notNull(),
  category: catalogCategory('category').notNull(),
  price: numeric('price', { precision:12, scale:2 }).notNull(),
  imageKey: text('image_key').notNull(),
  description: text('description').notNull(),
  featured: boolean('featured').default(false).notNull(),
  published: boolean('published').default(true).notNull(),
  stockQuantity: integer('stock_quantity'),
  threshold: integer('threshold').default(0).notNull(),
  version: integer('version').default(0).notNull(),
  image: text('image'),
  sortOrder: integer('sort_order').notNull(),
  createdAt: timestamp('created_at', { withTimezone:true, mode:'string' }).defaultNow().notNull(),
}, table => [check('catalog_price_positive', sql`${table.price} > 0`),check('catalog_stock_nonnegative',sql`${table.stockQuantity} IS NULL OR ${table.stockQuantity} >= 0`),check('catalog_threshold_nonnegative',sql`${table.threshold} >= 0`)])

export const customerOrders=pgTable('customer_order',{
  id:uuid('id').defaultRandom().primaryKey(),
  userId:uuid('user_id').notNull().references(()=>users.id),
  idempotencyKey:uuid('idempotency_key').notNull(),
  requestHash:text('request_hash').notNull(),
  items:jsonb('items').$type<OrderLine[]>().notNull(),
  address:jsonb('address').$type<OrderAddress>().notNull(),
  shipping:jsonb('shipping').$type<OrderShipping>().notNull(),
  subtotal:numeric('subtotal',{precision:16,scale:2}).notNull(),
  status:customerOrderStatus('status').default('pending').notNull(),
  paymentState:orderPaymentState('payment_state').default('demo_paid').notNull(),
  stockReserved:boolean('stock_reserved').default(true).notNull(),
  paidAt:timestamp('paid_at',{withTimezone:true,mode:'string'}),
  createdAt:timestamp('created_at',{withTimezone:true,mode:'string'}).defaultNow().notNull(),
},table=>[uniqueIndex('customer_order_idempotency_unique').on(table.userId,table.idempotencyKey),index('customer_order_user_idx').on(table.userId),check('customer_order_subtotal_positive',sql`${table.subtotal}>0`)])

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
