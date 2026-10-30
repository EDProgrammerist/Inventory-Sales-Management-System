import { createContext, useContext, type Dispatch, type SetStateAction } from 'react'
import type { Order } from '@/data/orders-demo'
import type { Supplier } from '@/data/suppliers-demo'
import type { Store } from '@/data/stores-demo'

export interface WorkspaceState {
  orders: Order[]
  setOrders: Dispatch<SetStateAction<Order[]>>
  suppliers: Supplier[]
  setSuppliers: Dispatch<SetStateAction<Supplier[]>>
  stores: Store[]
  setStores: Dispatch<SetStateAction<Store[]>>
}

export const WorkspaceContext = createContext<WorkspaceState | null>(null)

export function useWorkspace() {
  const value = useContext(WorkspaceContext)
  if (!value) throw new Error('WorkspaceProvider is required')
  return value
}
