import { type CatalogProduct } from './storefront-catalog'

export function normalizeCartQuantity(value: number): number | null {
  return Number.isSafeInteger(value) ? Math.max(0, Math.min(9, value)) : null
}

interface CartState { bag: Record<string, number>; notice: string }
type CartAction =
  | { type: 'add'; id: string; label: string }
  | { type: 'set'; id: string; label: string; quantity: number }
  | { type: 'complete'; quantities: Record<string, number> }
  | { type: 'reset' }

export function cartReducer(state: CartState, action: CartAction): CartState {
  if (action.type === 'reset') return { bag: {}, notice: '' }
  if (action.type === 'complete') return {
    bag: Object.fromEntries(Object.entries(state.bag).map(([id, quantity]) => [id, Math.max(0, quantity - (action.quantities[id] ?? 0))]).filter(([, quantity]) => Number(quantity) > 0)),
    notice: '',
  }
  const current = state.bag[action.id] ?? 0
  if (action.type === 'add' && current >= 9) return { ...state, notice: `The cart limit is 9 units per product. ${action.label} is already at the limit.` }
  const quantity = action.type === 'add' ? current + 1 : normalizeCartQuantity(action.quantity)
  if (quantity === null) return state
  const bag = { ...state.bag }
  if (quantity === 0) delete bag[action.id]
  else bag[action.id] = quantity
  return { bag, notice: quantity === 0 ? `${action.label} removed from your cart.` : `${action.label}: ${quantity} in your cart.` }
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
