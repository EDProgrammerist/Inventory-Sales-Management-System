import { toCsv } from './csv.ts'
import { validBuyingPrice } from './field-validation.ts'
import { paginateRows } from './pagination.ts'

export type Availability = 'in-stock' | 'out-of-stock' | 'low-stock'
export type AvailabilityFilter = 'all' | Availability
export interface InventoryProduct {
  id: string
  name: string
  price: number
  quantity: number
  threshold: number
  expiry: string
  availability: Availability
  sku?: string
  category?: string
  unit?: string
  image?: string
  details?: {
    expiry?: string
    openingStock?: number
    remainingStock?: number
    onWay?: number
    supplierName?: string
    supplierPhone?: string
    locations?: { name: string; quantity: number }[]
  }
}

// Preserve the supplied reference's sample values, dates, and explicit stock labels.
export const inventoryProducts: InventoryProduct[] = [
  {
    id: 'maggi',
    name: 'Maggi',
    price: 430,
    quantity: 43,
    threshold: 12,
    expiry: '2022-12-11',
    availability: 'in-stock',
  },
  {
    id: 'bru',
    name: 'Bru',
    price: 257,
    quantity: 22,
    threshold: 12,
    expiry: '2022-12-21',
    availability: 'out-of-stock',
  },
  {
    id: 'red-bull',
    name: 'Red Bull',
    price: 405,
    quantity: 36,
    threshold: 9,
    expiry: '2022-12-05',
    availability: 'in-stock',
  },
  {
    id: 'bourn-vita',
    name: 'Bourn Vita',
    price: 502,
    quantity: 14,
    threshold: 6,
    expiry: '2022-12-08',
    availability: 'out-of-stock',
  },
  {
    id: 'horlicks',
    name: 'Horlicks',
    price: 530,
    quantity: 5,
    threshold: 5,
    expiry: '2023-01-09',
    availability: 'in-stock',
  },
  {
    id: 'harpic',
    name: 'Harpic',
    price: 605,
    quantity: 10,
    threshold: 5,
    expiry: '2023-01-09',
    availability: 'in-stock',
  },
  {
    id: 'ariel',
    name: 'Ariel',
    price: 408,
    quantity: 23,
    threshold: 7,
    expiry: '2023-12-15',
    availability: 'out-of-stock',
  },
  {
    id: 'scotch-brite',
    name: 'Scotch Brite',
    price: 359,
    quantity: 43,
    threshold: 8,
    expiry: '2023-06-06',
    availability: 'in-stock',
  },
  {
    id: 'coca-cola',
    name: 'Coca cola',
    price: 205,
    quantity: 41,
    threshold: 10,
    expiry: '2022-11-11',
    availability: 'low-stock',
  },
]

export const availabilityLabels: Record<Availability, string> = {
  'in-stock': 'In-stock',
  'out-of-stock': 'Out of stock',
  'low-stock': 'Low stock',
}

export function selectProducts(
  products: InventoryProduct[],
  query: string,
  availability: AvailabilityFilter,
) {
  const search = query.trim().toLocaleLowerCase()
  return products.filter(
    (product) =>
      (product.name.toLocaleLowerCase().includes(search) ||
        Boolean(product.sku?.toLocaleLowerCase().includes(search))) &&
      (availability === 'all' || product.availability === availability),
  )
}

export function paginateProducts(
  products: InventoryProduct[],
  requestedPage: number,
  pageSize = 9,
) {
  return paginateRows(products, requestedPage, pageSize)
}

export function displayExpiry(date: string) {
  const [year, month, day] = date.split('-')
  return `${Number(day)}/${Number(month)}/${year.slice(-2)}`
}

export const productCategories = [
  'Instant food',
  'Beverages',
  'Groceries',
  'Personal care',
  'Household cleaning',
]

export type ProductInput = Record<'name' | 'price' | 'quantity' | 'threshold' | 'expiry', string> &
  Partial<Record<'sku' | 'category' | 'unit', string>>
export type ProductErrors = Partial<Record<keyof ProductInput, string>>

export function validateProduct(
  input: ProductInput,
  existing: InventoryProduct[],
):
  { valid: false; errors: ProductErrors } | { valid: true; product: Omit<InventoryProduct, 'id'> } {
  const errors: ProductErrors = {}
  if (input.sku !== undefined) {
    if (!/^[a-zA-Z0-9_-]{1,40}$/.test(input.sku.trim()))
      errors.sku = 'Use 1–40 letters, numbers, hyphens, or underscores.'
    else if (
      existing.some(
        (product) => product.sku?.toLocaleLowerCase() === input.sku?.trim().toLocaleLowerCase(),
      )
    )
      errors.sku = 'This product ID is already in use.'
  }
  if (input.category !== undefined && !productCategories.includes(input.category))
    errors.category = 'Select a product category.'
  if (input.unit !== undefined && (!input.unit.trim() || input.unit.trim().length > 30))
    errors.unit = 'Enter a unit of up to 30 characters.'
  const name = input.name.trim()
  if (!name || name.length > 100) errors.name = 'Enter a product name of 1–100 characters.'
  else if (
    existing.some((product) => product.name.toLocaleLowerCase() === name.toLocaleLowerCase())
  )
    errors.name = 'A product with this name already exists.'
  const price = Number(input.price)
  if (!validBuyingPrice(input.price))
    errors.price = 'Enter a price greater than zero, with up to 2 decimal places.'
  for (const field of ['quantity', 'threshold'] as const) {
    if (
      !/^\d+$/.test(input[field]) ||
      !Number.isSafeInteger(Number(input[field])) ||
      Number(input[field]) > 1000000
    )
      errors[field] = 'Enter a whole number from 0 to 1,000,000.'
  }
  const date = new Date(`${input.expiry}T00:00:00Z`)
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(input.expiry) ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== input.expiry
  )
    errors.expiry = 'Enter a valid expiry date.'
  if (Object.keys(errors).length) return { valid: false, errors }
  const quantity = Number(input.quantity)
  const threshold = Number(input.threshold)
  return {
    valid: true,
    product: {
      name,
      price,
      quantity,
      threshold,
      expiry: input.expiry,
      ...(input.sku !== undefined ? { sku: input.sku.trim() } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.unit !== undefined ? { unit: input.unit.trim() } : {}),
      availability:
        quantity === 0 ? 'out-of-stock' : quantity <= threshold ? 'low-stock' : 'in-stock',
    },
  }
}

export function inventoryCsv(products: InventoryProduct[]) {
  return toCsv([
    [
      'Product',
      'Buying price (USD)',
      'Quantity',
      'Threshold Value',
      'Expiry date',
      'Availability',
      'Product ID',
      'Category',
      'Unit',
    ],
    ...products.map((product) => [
      product.name,
      product.price,
      product.quantity,
      product.threshold,
      product.expiry,
      availabilityLabels[product.availability],
      product.sku ?? '',
      product.category ?? '',
      product.unit ?? 'Packets',
    ]),
  ])
}
