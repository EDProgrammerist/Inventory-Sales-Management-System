import { createContext, useContext } from 'react'
import type { InventoryProduct } from '@/data/inventory-demo'
import type { InventoryEvent } from '@/data/inventory-state'

export const InventoryContext = createContext<{
  products: InventoryProduct[]
  events: InventoryEvent[]
  addProduct: (product: Omit<InventoryProduct, 'id'>) => Promise<void>
  updateProduct: (id: string, product: Omit<InventoryProduct, 'id'>) => Promise<void>
} | null>(null)

export function useInventory() {
  const value = useContext(InventoryContext)
  if (!value) throw new Error('InventoryProvider is required')
  return value
}
