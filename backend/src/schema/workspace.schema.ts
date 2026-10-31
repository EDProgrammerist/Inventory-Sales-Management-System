import { z } from 'zod'

export const workspaceKind = z.enum(['products', 'suppliers', 'orders', 'stores'])
const name = z.string().trim().min(1).max(100)
const count = z.number().int().min(0).max(1_000_000)
const price = z.number().positive().max(999999999.99).refine((n) => Math.abs(n * 100 - Math.round(n * 100)) < 0.0001, 'Use up to two decimal places')
const date = z.iso.date()
const category = z.enum(['Instant food', 'Beverages', 'Groceries', 'Personal care', 'Household cleaning'])
const phone = z.string().max(32).regex(/^\+?[\d\s()-]+$/).refine((value) => {
  const length = value.replace(/\D/g, '').length
  return length >= 7 && length <= 15
}, 'Enter 7–15 digits')
const image = z.string().max(7_000_000).regex(/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/).optional()
const id = z.string().trim().min(1).max(100)
const unit = z.string().trim().min(1).max(30)
const product = z.object({
  id: z.uuid(), name, price, quantity: count, threshold: count, expiry: date,
  availability: z.enum(['in-stock', 'out-of-stock', 'low-stock']),
  sku: z.string().regex(/^[a-zA-Z0-9_-]{1,40}$/).optional(),
  category: category.optional(), unit: unit.optional(), image,
  details: z.object({
    expiry: date.optional(), openingStock: count.optional(), remainingStock: count.optional(),
    onWay: count.optional(), supplierName: name.optional(), supplierPhone: phone.optional(),
    locations: z.array(z.object({ name, quantity: count }).strict()).max(1000).optional(),
  }).strict().optional(),
}).strict().transform((value) => ({
  ...value,
  availability: value.quantity === 0 ? 'out-of-stock' as const : value.quantity <= value.threshold ? 'low-stock' as const : 'in-stock' as const,
}))
const supplier = z.object({
  id: z.uuid(), name, product: name, phone, email: z.email().max(254).transform((value) => value.toLowerCase()),
  type: z.enum(['taking-return', 'not-taking-return', 'unspecified']), onWay: count.nullable(),
  category: category.optional(), price: price.optional(), image,
}).strict()
const order = z.object({
  id, product: name, value: price, quantity: z.number().int().min(1).max(999999999), unit, expected: date,
  status: z.enum(['Delayed', 'Confirmed', 'Returned', 'Out for delivery']),
  productId: z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/).optional(), category: category.optional(),
  buyingPrice: price.optional(), notifyOnDelivery: z.boolean().optional(),
}).strict()
const store = z.object({
  id: z.uuid(), branch: z.string().trim().min(1).max(200), name: z.string().trim().min(1).max(200),
  address: z.string().trim().min(1).max(200), city: z.string().trim().min(1).max(200), phone,
}).strict()
export const workspaceSchemas = { products: product, suppliers: supplier, orders: order, stores: store }
export type WorkspaceKind = z.infer<typeof workspaceKind>
