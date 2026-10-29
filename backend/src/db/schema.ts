import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core'

// Starter models from the setup guide; authentication columns and routes are a separate feature.
export const users = pgTable('user', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
})

export const items = pgTable('item', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
}, (table) => [index('item_user_id_idx').on(table.userId)])
