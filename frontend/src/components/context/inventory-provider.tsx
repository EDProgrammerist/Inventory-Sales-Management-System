import type { ReactNode } from 'react'
import type { InventoryProduct } from '@/data/inventory-demo'
import type { InventoryState } from '@/data/inventory-state'
import { InventoryContext } from './inventory-context'

export default function InventoryProvider({ state, onSave, children }: {
  state: InventoryState
  onSave: (product: InventoryProduct, updating?: boolean) => Promise<void>
  children: ReactNode
}) {
  async function addProduct(product: Omit<InventoryProduct, 'id'>) {
    await onSave({ ...product, id: crypto.randomUUID() })
  }
  async function updateProduct(id: string, product: Omit<InventoryProduct, 'id'>) {
    const current = state.products.find((row) => row.id === id)
    if (!current) throw new Error('Product not found. Please reload inventory.')
    await onSave({ ...product, id, details: {
      ...current.details, expiry: product.expiry, remainingStock: product.quantity,
      locations: product.quantity === (current.details?.remainingStock ?? current.quantity) ? current.details?.locations : undefined,
    } }, true)
  }
  return (
    <InventoryContext value={{ ...state, addProduct, updateProduct }}>{children}</InventoryContext>
  )
}
