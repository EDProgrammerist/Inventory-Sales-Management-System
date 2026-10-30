import { validBuyingPrice } from './field-validation.ts'
import { toCsv } from './csv.ts'
import { productCategories } from './inventory-demo.ts'

export const orderStatuses = ['Delayed', 'Confirmed', 'Returned', 'Out for delivery'] as const
export type OrderStatus = (typeof orderStatuses)[number]
export interface Order {
  id: string
  product: string
  value: number
  quantity: number
  unit: string
  expected: string
  status: OrderStatus
  productId?: string
  category?: string
  buyingPrice?: number
  notifyOnDelivery?: boolean
}
export const orderFixtures: Order[] = []
export function selectOrders(rows: Order[], query: string, status = 'all') {
  const search = query.trim().toLowerCase()
  return rows.filter(
    (row) =>
      `${row.product} ${row.id} ${row.status} ${row.productId ?? ''} ${row.category ?? ''}`.toLowerCase().includes(search) &&
      (status === 'all' || row.status === status),
  )
}
export function displayOrderDate(value: string) {
  const [year, month, day] = value.split('-')
  return `${Number(day)}/${Number(month)}/${year.slice(2)}`
}
function validateOrderDetails(input: Record<string, string>) {
  const errors: Record<string, string> = {}
  if (!input.product?.trim() || input.product.trim().length > 100)
    errors.product = 'Enter a product name of 1–100 characters.'
  if (!validBuyingPrice(input.value ?? ''))
    errors.value = 'Enter a positive value with up to 2 decimal places.'
  if (
    !/^\d+$/.test(input.quantity ?? '') ||
    Number(input.quantity) < 1 ||
    Number(input.quantity) > 999999999
  )
    errors.quantity = 'Enter a whole quantity from 1 to 999999999.'
  const date = new Date(`${input.expected}T00:00:00Z`)
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(input.expected ?? '') ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== input.expected
  )
    errors.expected = 'Enter a valid delivery date.'
  return errors
}
export function validateOrder(input: Record<string, string>, existing: Order[]) {
  const errors = validateOrderDetails(input)
  if (!input.id?.trim() || input.id.trim().length > 100)
    errors.id = 'Enter an order ID of 1–100 characters.'
  if (existing.some((row) => row.id.toLowerCase() === input.id?.trim().toLowerCase()))
    errors.id = 'This order ID already exists.'
  return errors
}
export function validateNewOrder(input: Record<string, string>) {
  const errors = validateOrderDetails(input)
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(input.productId?.trim() ?? ''))
    errors.productId = 'Use 1–100 letters, numbers, hyphens or underscores.'
  if (!productCategories.includes(input.category)) errors.category = 'Select a product category.'
  if (!input.unit?.trim() || input.unit.trim().length > 30)
    errors.unit = 'Enter a unit of 1–30 characters.'
  if (!validBuyingPrice(input.buyingPrice ?? ''))
    errors.buyingPrice = 'Enter a positive buying price with up to 2 decimal places.'
  return errors
}
export function createNewOrder(input: Record<string, string>, orderId: string): Order {
  return {
    ...createOrder({ ...input, id: orderId }),
    productId: input.productId.trim(),
    category: input.category,
    unit: input.unit.trim(),
    buyingPrice: Number(input.buyingPrice),
    notifyOnDelivery: input.notifyOnDelivery === 'on',
  }
}
export function createOrder(input: Record<string, string>): Order {
  return {
    id: input.id.trim(),
    product: input.product.trim(),
    value: Number(input.value),
    quantity: Number(input.quantity),
    unit: 'Packets',
    expected: input.expected,
    status: 'Confirmed',
  }
}
export function ordersCsv(rows: Order[]) {
  return toCsv([
    [
      'Product',
      'Order Value (PHP)',
      'Quantity',
      'Unit',
      'Order ID',
      'Expected Delivery',
      'Status',
      'Product ID',
      'Category',
      'Buying Price (PHP)',
      'Delivery Notification Requested',
    ],
    ...rows.map((row) => [
      row.product,
      row.value,
      row.quantity,
      row.unit,
      row.id,
      displayOrderDate(row.expected),
      row.status,
      row.productId ?? '',
      row.category ?? '',
      row.buyingPrice ?? '',
      row.notifyOnDelivery === undefined ? '' : row.notifyOnDelivery ? 'Yes' : 'No',
    ]),
  ])
}
