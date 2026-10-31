import { createContext, useContext } from 'react'
import type { Order } from '@/data/orders-demo'
import type { Supplier } from '@/data/suppliers-demo'
import type { Store } from '@/data/stores-demo'

export interface WorkspaceState {
  orders: Order[]
  saveOrder: (record: Order) => Promise<void>
  suppliers: Supplier[]
  saveSupplier: (record: Supplier) => Promise<void>
  stores: Store[]
  saveStore: (record: Store, updating?: boolean) => Promise<void>
  loading: boolean
  error: string
  retry: () => void
}

export const WorkspaceContext = createContext<WorkspaceState | null>(null)

export function useWorkspace() {
  const value = useContext(WorkspaceContext)
  if (!value) throw new Error('WorkspaceProvider is required')
  return value
}
