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
export const orderFixtures: Order[] = [
  {
    id: '7535',
    product: 'Maggi',
    value: 4306,
    quantity: 43,
    unit: 'Packets',
    expected: '2022-12-11',
    status: 'Delayed',
  },
  {
    id: '5724',
    product: 'Bru',
    value: 2557,
    quantity: 22,
    unit: 'Packets',
    expected: '2022-12-21',
    status: 'Confirmed',
  },
  {
    id: '2775',
    product: 'Red Bull',
    value: 4075,
    quantity: 36,
    unit: 'Packets',
    expected: '2022-12-05',
    status: 'Returned',
  },
  {
    id: '2275',
    product: 'Bourn Vita',
    value: 5052,
    quantity: 14,
    unit: 'Packets',
    expected: '2022-12-08',
    status: 'Out for delivery',
  },
  {
    id: '2427',
    product: 'Horlicks',
    value: 5370,
    quantity: 5,
    unit: 'Packets',
    expected: '2023-01-09',
    status: 'Returned',
  },
  {
    id: '2578',
    product: 'Harpic',
    value: 6065,
    quantity: 10,
    unit: 'Packets',
    expected: '2023-01-09',
    status: 'Out for delivery',
  },
  {
    id: '2757',
    product: 'Ariel',
    value: 4078,
    quantity: 23,
    unit: 'Packets',
    expected: '2023-12-15',
    status: 'Delayed',
  },
  {
    id: '3757',
    product: 'Scotch Brite',
    value: 3559,
    quantity: 43,
    unit: 'Packets',
    expected: '2023-06-06',
    status: 'Confirmed',
  },
  {
    id: '2474',
    product: 'Coca cola',
    value: 2055,
    quantity: 41,
    unit: 'Packets',
    expected: '2022-11-11',
    status: 'Delayed',
  },
]
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
      'Order Value (USD)',
      'Quantity',
      'Unit',
      'Order ID',
      'Expected Delivery',
      'Status',
      'Product ID',
      'Category',
      'Buying Price (USD)',
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
