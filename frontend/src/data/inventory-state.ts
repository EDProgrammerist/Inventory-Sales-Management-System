import type { InventoryProduct } from './inventory-demo'

export interface InventoryEvent {
  id: string
  productId: string
  kind: 'created' | 'updated'
  at: string
}
export interface InventoryState {
  products: InventoryProduct[]
  events: InventoryEvent[]
}
export type InventoryChange =
  | { type: 'add'; product: InventoryProduct; eventId: string; at: string }
  | {
      type: 'update'
      id: string
      product: Omit<InventoryProduct, 'id'>
      eventId: string
      at: string
    }

export function createInventoryState(products: InventoryProduct[]): InventoryState {
  return {
    products: products.map((product) => ({ ...product })),
    events: [],
  }
}

export function productForOverview(product: InventoryProduct): InventoryProduct {
  return {
    ...product,
    expiry: product.details?.expiry ?? product.expiry,
    quantity: product.details?.remainingStock ?? product.quantity,
  }
}

export function inventoryReducer(state: InventoryState, change: InventoryChange): InventoryState {
  if (change.type === 'add') {
    if (
      state.products.some(
        (product) =>
          product.id === change.product.id ||
          product.name.toLocaleLowerCase() === change.product.name.toLocaleLowerCase() ||
          (product.sku &&
            change.product.sku &&
            product.sku.toLocaleLowerCase() === change.product.sku.toLocaleLowerCase()),
      )
    )
      return state
    return {
      products: [...state.products, change.product],
      events: [
        ...state.events,
        { id: change.eventId, productId: change.product.id, kind: 'created', at: change.at },
      ],
    }
  }
  const current = state.products.find((product) => product.id === change.id)
  if (!current) return state
  const previousQuantity = current.details?.remainingStock ?? current.quantity
  const updated = {
    ...current,
    ...change.product,
    id: current.id,
    details: {
      ...current.details,
      expiry: change.product.expiry,
      remainingStock: change.product.quantity,
      locations:
        change.product.quantity === previousQuantity ? current.details?.locations : undefined,
    },
  }
  return {
    products: state.products.map((product) => (product.id === change.id ? updated : product)),
    events: [
      ...state.events,
      { id: change.eventId, productId: change.id, kind: 'updated', at: change.at },
    ],
  }
}
