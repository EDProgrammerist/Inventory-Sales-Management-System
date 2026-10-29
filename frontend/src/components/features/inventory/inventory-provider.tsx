import { useReducer, type ReactNode } from 'react'
import { inventoryProducts, type InventoryProduct } from '@/data/inventory-demo'
import { createInventoryState, inventoryReducer } from '@/data/inventory-state'
import { InventoryContext } from './inventory-context'

export default function InventoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(inventoryReducer, inventoryProducts, createInventoryState)
  function addProduct(product: Omit<InventoryProduct, 'id'>) {
    dispatch({
      type: 'add',
      product: { ...product, id: crypto.randomUUID() },
      eventId: crypto.randomUUID(),
      at: new Date().toISOString(),
    })
  }
  function updateProduct(id: string, product: Omit<InventoryProduct, 'id'>) {
    dispatch({
      type: 'update',
      id,
      product,
      eventId: crypto.randomUUID(),
      at: new Date().toISOString(),
    })
  }
  return (
    <InventoryContext value={{ ...state, addProduct, updateProduct }}>{children}</InventoryContext>
  )
}
