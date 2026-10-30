import { toCsv } from './csv.ts'
import { validBuyingPrice } from './field-validation.ts'
import { productCategories } from './inventory-demo.ts'
import { emailError } from '../lib/auth-validation.ts'

export type SupplierType = 'taking-return' | 'not-taking-return' | 'unspecified'
export type SupplierTypeFilter = 'all' | SupplierType
export interface Supplier {
  id: string
  name: string
  product: string
  phone: string
  email: string
  type: SupplierType
  onWay: number | null
  category?: string
  price?: number
  image?: string
}
export const supplierTypeLabels: Record<SupplierType, string> = {
  'taking-return': 'Taking Return',
  'not-taking-return': 'Not Taking Return',
  unspecified: 'Not specified',
}
export const supplierPageSize = 14

// Start empty; suppliers are entered manually for the current account session.
export const supplierFixtures: Supplier[] = []

export function selectSuppliers(
  suppliers: Supplier[],
  query: string,
  type: SupplierTypeFilter = 'all',
  onWayOnly = false,
) {
  const search = query.trim().toLocaleLowerCase()
  const digits = search.replace(/\D/g, '')
  const phoneSearch = /^\+?[\d\s()-]+$/.test(search) && digits.length > 0
  return suppliers.filter((supplier) => {
    const matchesSearch =
      `${supplier.name} ${supplier.product} ${supplier.email} ${supplier.phone} ${supplier.category ?? ''}`
        .toLocaleLowerCase()
        .includes(search) ||
      (phoneSearch && supplier.phone.replace(/\D/g, '').includes(digits))
    return (
      matchesSearch &&
      (type === 'all' || supplier.type === type) &&
      (!onWayOnly || (supplier.onWay ?? 0) > 0)
    )
  })
}

export type SupplierInput = Record<
  'name' | 'product' | 'category' | 'price' | 'phone' | 'email' | 'type',
  string
>
export type SupplierErrors = Partial<Record<keyof SupplierInput, string>>

export function validateSupplier(
  input: SupplierInput,
  existing: Supplier[],
): { valid: false; errors: SupplierErrors } | { valid: true; supplier: Omit<Supplier, 'id'> } {
  const errors: SupplierErrors = {}
  const name = input.name.trim(),
    product = input.product.trim(),
    email = input.email.trim().toLocaleLowerCase(),
    phone = input.phone.trim()
  if (!name || name.length > 100) errors.name = 'Enter a supplier name of 1–100 characters.'
  if (!product || product.length > 100) errors.product = 'Enter a product name of 1–100 characters.'
  if (!productCategories.includes(input.category)) errors.category = 'Select a product category.'
  if (!validBuyingPrice(input.price))
    errors.price = 'Enter a price greater than zero, with up to 2 decimal places.'
  const digits = phone.replace(/\D/g, '')
  if (
    !/^\+?[\d\s()-]+$/.test(phone) ||
    digits.length < 7 ||
    digits.length > 15 ||
    phone.length > 32
  )
    errors.phone = 'Enter a phone number containing 7–15 digits.'
  if (email.length > 254 || emailError(email)) errors.email = 'Enter a valid email address.'
  if (input.type !== 'taking-return' && input.type !== 'not-taking-return')
    errors.type = 'Choose whether this supplier accepts returns.'
  if (
    email &&
    product &&
    existing.some(
      (supplier) =>
        supplier.email.toLocaleLowerCase() === email &&
        supplier.product.toLocaleLowerCase() === product.toLocaleLowerCase(),
    )
  )
    errors.product = 'This supplier already supplies this product.'
  if (Object.keys(errors).length) return { valid: false, errors }
  return {
    valid: true,
    supplier: {
      name,
      product,
      email,
      phone,
      category: input.category,
      price: Number(input.price),
      type: input.type as SupplierType,
      onWay: null,
    },
  }
}

export function suppliersCsv(suppliers: Supplier[]) {
  return toCsv([
    [
      'Supplier Name',
      'Product',
      'Contact Number',
      'Email',
      'Type',
      'On the way',
      'Category',
      'Buying Price (PHP)',
    ],
    ...suppliers.map((supplier) => [
      supplier.name,
      supplier.product,
      supplier.phone,
      supplier.email,
      supplierTypeLabels[supplier.type],
      supplier.onWay ?? '',
      supplier.category ?? '',
      supplier.price ?? '',
    ]),
  ])
}
