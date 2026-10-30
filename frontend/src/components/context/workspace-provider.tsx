import { useState, type ReactNode } from 'react'
import { orderFixtures } from '@/data/orders-demo'
import { supplierFixtures } from '@/data/suppliers-demo'
import { storeFixtures } from '@/data/stores-demo'
import InventoryProvider from './inventory-provider'
import { WorkspaceContext } from './workspace-context'
import { useAuth } from './use-auth'

function WorkspaceSession({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState(() => [...orderFixtures])
  const [suppliers, setSuppliers] = useState(() => [...supplierFixtures])
  const [stores, setStores] = useState(() => [...storeFixtures])

  return (
    <WorkspaceContext value={{ orders, setOrders, suppliers, setSuppliers, stores, setStores }}>
      <InventoryProvider>{children}</InventoryProvider>
    </WorkspaceContext>
  )
}

export default function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  // Keep manual entries across routes, but never carry them into another account.
  // This remains in-memory state: a full page reload starts empty.
  return <WorkspaceSession key={user?.id ?? 'anonymous'}>{children}</WorkspaceSession>
}
