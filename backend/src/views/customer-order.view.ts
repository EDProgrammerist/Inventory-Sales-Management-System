import type {customerOrders} from '@/db/schema'
export function orderView(row:typeof customerOrders.$inferSelect){return {
  id:row.id,items:row.items,address:row.address,shipping:row.shipping,subtotal:Number(row.subtotal),status:row.status,paymentState:row.paymentState,paidAt:row.paidAt,createdAt:row.createdAt,paymentMode:'demo' as const,
}}
