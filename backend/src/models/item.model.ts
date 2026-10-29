import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { items } from '@/db/schema'

export type Item = InferSelectModel<typeof items>
export type NewItem = InferInsertModel<typeof items>
