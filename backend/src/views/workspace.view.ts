import type { workspaceRecords } from '@/db/schema'
type Row = typeof workspaceRecords.$inferSelect
export function workspaceView(rows: Row[]) {
  return {
    products: rows.filter((row) => row.kind === 'products').map((row) => row.data),
    events: rows.flatMap((row) => row.events),
    suppliers: rows.filter((row) => row.kind === 'suppliers').map((row) => row.data),
    orders: rows.filter((row) => row.kind === 'orders').map((row) => row.data),
    stores: rows.filter((row) => row.kind === 'stores').map((row) => row.data),
  }
}
export function recordView(row: Row) { return { record: row.data, events: row.events } }
