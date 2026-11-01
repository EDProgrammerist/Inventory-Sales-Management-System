import { type CatalogProduct } from './storefront-catalog'

export function normalizeCartQuantity(value: number): number | null {
  return Number.isSafeInteger(value) ? Math.max(0, Math.min(9, value)) : null
}

export interface CartItem { product: CatalogProduct; quantity: number; total: number }

export function cartSummary(bag: Record<string, number>, products: CatalogProduct[]) {
  const items: CartItem[] = products.flatMap(product => {
    const quantity = normalizeCartQuantity(bag[product.id])
    return quantity && quantity > 0 ? [{ product, quantity, total: product.price * quantity }] : []
  })
  return {
    items,
    quantity: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.total, 0),
  }
}
